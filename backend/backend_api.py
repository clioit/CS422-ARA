import mongoengine

from db_models import *
from db_seeder import seed_db
from flask import Flask, render_template, send_file, request, jsonify, abort
from mongoengine import connect
from os import environ as env
import io


app = Flask(__name__,
            template_folder='/frontend/templates',
            static_folder='/frontend/static')
connect(host=f"mongodb://{env['MONGODB_HOSTNAME']}:27017/ara_db")

if User.objects.count() == 0:
    seed_db()


@app.route('/')
def index():
    return render_template('index.html', dummy_pdf_id=str(PDF.objects(name='dummy.pdf').first().id))


@app.route('/pdf/<pdf_id>', methods=['GET'])
def get_pdf(pdf_id: str):
    """
    Retrieves a PDF from the MongoDB database and returns its bytes.
    Ex: http://localhost:5001/pdf/680be4af29187334e35baad3
    """
    pdf_file = PDF.objects(id=pdf_id).first()
    if pdf_file is None:
        abort(404)
    file_data = pdf_file.file.read()
    file_stream = io.BytesIO(file_data)
    return send_file(file_stream, mimetype='application/pdf', download_name=pdf_file.name)


@app.route('/pdf/<pdf_id>/notes', methods=['GET'])
def get_notes(pdf_id: str):
    """Gets notes for a pdf."""
    pdf_obj: PDF = PDF.objects(id=pdf_id).first()
    if pdf_obj is None:
        abort(404)
    return pdf_obj.to_mongo().to_dict()["chapters"]


@app.route('/pdf/upload', methods=['POST'])
def upload_pdf():
    """Receives and uploads a PDF to the MongoDB database."""
    file = request.files['pdf_file']
    if file.filename.endswith(".pdf"):
        existing_pdf_check = PDF.objects(name=file.filename).first()
        if existing_pdf_check:
            return jsonify({'message': f'Could not upload: "{file.filename}" already exists.'}), 409
        new_pdf = PDF(name=file.filename)
        new_pdf.file.put(file)
        new_pdf.save()
        return jsonify({'message': f'File "{file.filename}" successfully uploaded.'}), 201


@app.route('/pdf/list', methods=['GET'])
def list_pdfs():
    """
    Queries the MongoDB database, retrieves a list of all stored PDFs,
    structures their key details (ID, name, and page count) into a clear JSON format.
    """
    pdfs = PDF.objects()
    pdf_list = [
        {
            "id": str(pdf.id),
            "name": pdf.name,
            "num_pages": pdf.num_pages
        } for pdf in pdfs
    ]
    return jsonify(pdf_list), 200


@app.route('/pdf/<pdf_id>', methods=['DELETE'])
def delete_pdf(pdf_id: str):
    """Deletes a PDF by its ID."""
    pdf = PDF.objects(id=pdf_id).first()
    if pdf is None:
        abort(404, description="PDF NOT found.")
    pdf.delete()
    return jsonify({"message": f"PDF with the ID {pdf_id} has been successfully deleted."}), 200


@app.route('/pdf/<pdf_id>', methods=['PATCH'])
def rename_pdf(pdf_id: str):
    """Renames a PDF given its ID."""
    try:
        pdf = PDF.objects(id=pdf_id).first()
    except mongoengine.errors.InvalidQueryError:
        abort(400, description="Invalid PDF ID format.")
    if pdf is None:
        abort(404, description="PDF not found.")

    data = request.get_json()
    new_name = data.get('new_name')

    if not new_name:
        abort(400, description="Missing 'new_name' parameter.")
    if PDF.objects(name=new_name).first():
        abort(409, description="The PDF with this new name already exists.")

    pdf.name = new_name
    pdf.save()

    return jsonify({
        "message": "PDF renamed successfully.",
        "pdf_id": str(pdf.id),
        "new_name": new_name
    }), 200


# TODO: complete implementation
@app.route('/pdf/<pdf_id>/notes', methods=['POST'])
def create_note(pdf_id: str):
    """Creates a new note on a PDF."""
    data = request.get_json()
    start_page = data.get('start_page')
    text = data.get('text')

    if not all([start_page is not None, text]):
        abort(400, description="Missing the note data.")

    pdf = PDF.objects(id=pdf_id).first()

    if not pdf:
        abort(404, description="PDF NOT found.")

    note = Note(
        start_page=start_page,
        text=text
    )
    pdf.notes.append(note)
    pdf.save()

    return jsonify({"Message": "Note has been successfully created."}), 201


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
