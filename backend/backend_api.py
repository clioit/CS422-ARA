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
    return render_template('index.html', dummy_pdf_id=str(PDF.objects(name='dummy.pdf').first().id))


@app.route('/pdfs/<pdf_id>', methods=['GET'])
def get_pdf(pdf_id: str):
    """
    Retrieves a PDF from the MongoDB database and returns its bytes.
    Ex: http://localhost:5001/pdf/680be4af29187334e35baad3
    """
    pdf_file = get_object_by_id(PDF, pdf_id)
    file_data = pdf_file.file.read()
    file_stream = io.BytesIO(file_data)
    return send_file(file_stream, mimetype='application/pdf', download_name=pdf_file.name)


@app.route('/pdfs/<pdf_id>/notes', methods=['GET'])
def get_note_hierarchy(pdf_id: str):
    """Gets the note hierarchy for a PDF."""
    pdf_obj = get_object_by_id(PDF, pdf_id)
    return pdf_obj.to_mongo().to_dict()["chapters"]


@app.route('/pdfs', methods=['POST'])
def upload_pdf():
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


@app.route('/pdfs', methods=['GET'])
def list_pdfs():
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


@app.route('/pdfs/<pdf_id>', methods=['DELETE'])
def delete_pdf(pdf_id: str):
    """Deletes a PDF by its ID."""
    pdf = get_object_by_id(PDF, pdf_id)
    pdf.delete()
    return {"success": True}, 200


@app.route('/pdfs/<pdf_id>', methods=['PATCH'])
def rename_pdf(pdf_id: str):
    """Renames a PDF given its ID."""
    pdf = get_object_by_id(PDF, pdf_id)
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


@app.route('/pdfs/<pdf_id>/chapters', methods=['POST'])
def create_chapter(pdf_id: str):
    """Creates a new chapter of a PDF."""
    new_chapter = instantiate_from_request_json(Chapter)

    pdf = get_object_by_id(PDF, pdf_id)
    pdf.chapters.append(new_chapter)
    pdf.save()

    return new_chapter.to_json(), 201


@app.route('/pdfs/<pdf_id>/chapters', methods=['GET'])
def list_chapters(pdf_id: str):
    """Lists chapters in a PDF."""
    pdf = get_object_by_id(PDF, pdf_id)
    return [{
        "_id": str(chap._id),  # TODO: don't access protected attr
        "title": chap.title,
        "start_page": chap.start_page,
        "sections_count": len(chap.sections)
    } for chap in pdf.chapters]


@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections', methods=['POST'])
def create_section(pdf_id: str, chapter_id: str):
    """Creates a section in a chapter of a PDF."""
    new_section = instantiate_from_request_json(Section)

    pdf = get_object_by_id(PDF, pdf_id)
    chapter = get_object_by_id(pdf.chapters, chapter_id, is_array=True)
    chapter.sections.append(new_section)
    pdf.save()

    return new_section.to_json(), 201


@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections', methods=['GET'])
def list_sections(pdf_id: str, chapter_id: str):
    """Lists sections in a chapter of a PDF."""
    pdf = get_object_by_id(PDF, pdf_id)
    chapter = get_object_by_id(pdf.chapters, chapter_id, is_array=True)
    return [{
        "_id": str(sec._id),  # TODO: don't access protected attr
        "title": sec.title,
        "start_page": sec.start_page,
        "notes_count": len(sec.notes)
    } for sec in chapter.sections]


@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections/<section_id>/notes', methods=['POST'])
def create_note(pdf_id: str, chapter_id: str, section_id: str):
    """Creates a new note on a PDF."""
    new_note = instantiate_from_request_json(Note)

    pdf = get_object_by_id(PDF, pdf_id)
    chapter = get_object_by_id(pdf.chapters, chapter_id, is_array=True)
    section = get_object_by_id(chapter.sections, section_id, is_array=True)
    section.notes.append(new_note)
    pdf.save()

    return new_note.to_json(), 201


@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections/<section_id>/notes', methods=['GET'])
def list_notes(pdf_id: str, chapter_id: str, section_id: str):
    """Lists notes in a section of a PDF."""
    pdf = get_object_by_id(PDF, pdf_id)
    chapter = get_object_by_id(pdf.chapters, chapter_id, is_array=True)
    section = get_object_by_id(chapter.sections, section_id, is_array=True)
    section_notes = section.notes.filter(_cls="Note")
    return [{
        "_id": str(note._id),  # TODO: don't access protected attr
        "start_page": note.start_page,
        "text": note.text
    } for note in section_notes]


@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections/<section_id>/qas', methods=['GET'])
def list_qas(pdf_id: str, chapter_id: str, section_id: str):
    """Lists Q&As in a section of a PDF."""
    pdf = get_object_by_id(PDF, pdf_id)
    chapter = get_object_by_id(pdf.chapters, chapter_id, is_array=True)
    section = get_object_by_id(chapter.sections, section_id, is_array=True)
    section_notes = section.notes.filter(_cls="QuestionAnswer")
    return [{
        "_id": str(note._id),  # TODO: don't access protected attr
        "start_page": note.start_page,
        "question": note.question,
        "text": note.text
    } for note in section_notes]


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
