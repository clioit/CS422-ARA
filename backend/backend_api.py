import mongoengine
from db_models import *
from db_seeder import seed_db
from flask import Flask, render_template, send_file, request, abort
from mongoengine import connect
from os import environ as env
import io


app = Flask(__name__,
            template_folder='/frontend/templates',
            static_folder='/frontend/static')
connect(host=f"mongodb://{env['MONGODB_HOSTNAME']}:27017/ara_db")

if User.objects.count() == 0:
    seed_db()


def get_object_by_id(collection, obj_id: str, is_array=False):
    """Gets an object from a collection/array by its ID."""
    try:
        if is_array:
            obj = collection.filter(_id=obj_id)
            if len(obj) == 0:
                abort(404, f"{repr(collection)} object with ID {obj_id} not found.")
            elif len(obj) == 1:
                return obj[0]
        else:
            obj = collection.objects(id=obj_id).first()
            if obj is not None:
                return obj
            else:
                abort(404, f"{repr(collection)} object with ID {obj_id} not found.")
    except mongoengine.errors.InvalidQueryError:
        abort(400, f"Object ID {obj_id} is of an invalid format.")


def instantiate_from_request_json(cls):
    """Instantiates a class from a JSON object in the request body."""
    try:
        new_obj = cls.from_json(request.get_data(as_text=True))
        new_obj.validate()
        return new_obj
    except ValidationError as e:
        return abort(400, str(e))


@app.route('/')
def index():
    """
    Users login here. Prototype does not require password.
    """
    return render_template('login.html')


@app.route('/home')
def home():
    """
    Homepage for choosing which PDFs to open.
    """
    return render_template('home.html')


@app.route('/pdfs/<pdf_id>/surveyQuestion')
def surveyQuestion(pdf_id):
    """
    Page for reading PDF, taking questions/answers, and adding chapters/sections.
    """
    try:
        pdf = get_object_by_id(PDF, pdf_id)
        return render_template('surveyQuestion.html', pdf_id=pdf_id)
    except:
        abort(404, "PDF not found.")


@app.route('/pdfs/<pdf_id>/readRecite')
def readRecite(pdf_id):
    """
    Page for reading PDF, taking notes, and choosing chapters for notes.
    """
    try:
        pdf = get_object_by_id(PDF, pdf_id)
        return render_template('readRecite.html', pdf_id=pdf_id)
    except:
        abort(404, "PDF not found.")


@app.route('/pdfs/<pdf_id>/review')
def review(pdf_id):
    """
    Page for choosing chapters to review content with flashcards.
    """
    try:
        pdf = get_object_by_id(PDF, pdf_id)
        return render_template('review.html', pdf_id=pdf_id)
    except:
        abort(404, "PDF not found.")


@app.route('/pdfs', methods=['GET', 'POST'])
def pdf_set_operations():
    match request.method:
        case 'GET':
            """
            Queries the MongoDB database, retrieves a list of all stored PDFs,
            structures their key details (ID, name, and page count) into a clear JSON format.
            """
            pdfs = PDF.objects()
            pdf_list = [
                {
                    "_id": str(pdf.id),
                    "name": pdf.name,
                    "num_chapters": len(pdf.chapters),
                } for pdf in pdfs
            ]
            return pdf_list

        case 'POST':
            """Receives and uploads a PDF to the MongoDB database."""
            file = request.files['pdf_file']
            if file.filename.endswith(".pdf"):
                existing_pdf_check = PDF.objects(name=file.filename).first()
                if existing_pdf_check:
                    return {'message': f'Could not upload: "{file.filename}" already exists.'}, 409
                new_pdf = PDF(name=file.filename)
                new_pdf.file.put(file)
                new_pdf.save()
                return {'message': f'File "{file.filename}" successfully uploaded.'}, 201


@app.route('/pdfs/<pdf_id>', methods=['GET', 'PATCH', 'DELETE'])
def pdf_object_operations(pdf_id: str):
    pdf = get_object_by_id(PDF, pdf_id)

    match request.method:
        case 'GET':
            """
            Retrieves a PDF from the MongoDB database and returns its bytes.
            Ex: http://localhost:5001/pdf/680be4af29187334e35baad3
            """
            file_data = pdf.file.read()
            file_stream = io.BytesIO(file_data)
            return send_file(file_stream, mimetype='application/pdf', download_name=pdf.name)

        case 'PATCH':
            """Renames a PDF given its ID."""
            data = request.get_json()
            new_name = data.get('new_name')
            if not new_name:
                abort(400, description="Missing 'new_name' parameter.")
            if PDF.objects(name=new_name).first():
                abort(409, description="The PDF with this new name already exists.")
            pdf.name = new_name
            pdf.save()
            return {
                "message": "PDF renamed successfully.",
                "pdf_id": str(pdf.id),
                "new_name": new_name
            }, 200

        case 'DELETE':
            """Deletes a PDF given its ID."""
            pdf.delete()
            return {"success": True}, 200


@app.route('/pdfs/<pdf_id>/notes', methods=['GET'])
def get_note_hierarchy(pdf_id: str):
    """Gets the note hierarchy for a PDF."""
    pdf_obj = get_object_by_id(PDF, pdf_id)
    return pdf_obj.to_mongo().to_dict()["chapters"]


@app.route('/pdfs/<pdf_id>/chapters', methods=['GET', 'POST'])
def chapter_set_operations(pdf_id: str):
    pdf = get_object_by_id(PDF, pdf_id)

    match request.method:
        case 'GET':
            """Lists chapters in a PDF."""
            return [{
                "_id": str(chap._id),  # TODO: don't access protected attr
                "title": chap.title,
                "start_page": chap.start_page,
                "sections_count": len(chap.sections)
            } for chap in pdf.chapters]

        case 'POST':
            """Creates a new chapter of a PDF."""
            new_chapter = instantiate_from_request_json(Chapter)
            pdf.chapters.append(new_chapter)
            pdf.save()
            return new_chapter.to_json(), 201


@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections', methods=['GET', 'POST'])
def section_set_operations(pdf_id: str, chapter_id: str):
    pdf = get_object_by_id(PDF, pdf_id)
    chapter = get_object_by_id(pdf.chapters, chapter_id, is_array=True)

    match request.method:
        case 'GET':
            """Lists sections in a chapter of a PDF."""
            return [{
                "_id": str(sec._id),  # TODO: don't access protected attr
                "title": sec.title,
                "start_page": sec.start_page,
                "notes_count": len(sec.notes)
            } for sec in chapter.sections]

        case 'POST':
            """Creates a section in a chapter of a PDF."""
            new_section = instantiate_from_request_json(Section)
            chapter.sections.append(new_section)
            pdf.save()
            return new_section.to_json(), 201


@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections/<section_id>/notes', methods=['GET', 'POST'])
def note_set_operations(pdf_id: str, chapter_id: str, section_id: str):
    pdf = get_object_by_id(PDF, pdf_id)
    chapter = get_object_by_id(pdf.chapters, chapter_id, is_array=True)
    section = get_object_by_id(chapter.sections, section_id, is_array=True)

    match request.method:
        case 'GET':
            """Lists notes in a section of a PDF."""
            section_notes = section.notes.filter(_cls="Note")
            return [{
                "_id": str(note._id),  # TODO: don't access protected attr
                "start_page": note.start_page,
                "text": note.text
            } for note in section_notes]

        case 'POST':
            """Creates a new note on a PDF."""
            new_note = instantiate_from_request_json(Note)
            section.notes.append(new_note)
            pdf.save()
            return new_note.to_json(), 201


@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections/<section_id>/qas', methods=['GET'])
def qa_set_operations(pdf_id: str, chapter_id: str, section_id: str):
    pdf = get_object_by_id(PDF, pdf_id)
    chapter = get_object_by_id(pdf.chapters, chapter_id, is_array=True)
    section = get_object_by_id(chapter.sections, section_id, is_array=True)

    match request.method:
        case 'GET':
            """Lists Q&As in a section of a PDF."""
            section_notes = section.notes.filter(_cls="QuestionAnswer")
            return [{
                "_id": str(note._id),  # TODO: don't access protected attr
                "start_page": note.start_page,
                "question": note.question,
                "text": note.text
            } for note in section_notes]

        case 'POST':
            """Creates a new Q&A on a PDF."""
            new_qa = instantiate_from_request_json(QuestionAnswer)
            section.notes.append(new_qa)
            pdf.save()
            return new_qa.to_json(), 201

# TODO Switch over to new APIs (above)
# Retrieves PDF from MongoDB database and sends to frontend to populate on app
# http://localhost:5001/get_pdf?name=Sample_Survey_Highlights.pdf
@app.route('/get_pdf', methods=['GET'])
def get_pdf():
    filename = request.args.get('name')
    pdf_file = PDF.objects(name=filename).first()
    if pdf_file == None:
        abort(404)
    file_data = pdf_file.file.read()
    file_stream = io.BytesIO(file_data)
    return send_file(file_stream, mimetype='application/pdf', download_name=filename)

# TODO Switch over to new APIs (above)
@app.route('/get_notes', methods=['GET'])
def get_notes():
    pass

# TODO Switch over to new APIs (above)
# Receives and uploads PDF to MongoDB database
@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    file = request.files['pdf_file']
    if file.filename.endswith(".pdf"):
        existing_pdf_check = PDF.objects(name=file.filename).first()
        if existing_pdf_check:
            return jsonify({'message': f'Could not upload: "{file.filename}" already exists.'}), 409
        new_pdf = PDF(name=file.filename)
        new_pdf.file.put(file)
        new_pdf.save()
        return jsonify({'message': f'File "{file.filename}" successfully uploaded.'}), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)