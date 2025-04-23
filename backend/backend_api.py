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
    return render_template('index.html')


@app.route('/get_pdf', methods=['GET'])
def get_pdf():
    """
    Retrieves a PDF from the MongoDB database and returns its bytes.
    Ex: http://localhost:5001/get_pdf?name=dummy.pdf
    """
    filename = request.args.get('name')
    pdf_file = PDF.objects(name=filename).first()
    if pdf_file is None:
        abort(404)
    file_data = pdf_file.file.read()
    file_stream = io.BytesIO(file_data)
    return send_file(file_stream, mimetype='application/pdf', download_name=filename)


@app.route('/get_notes', methods=['GET'])
def get_notes():
    pass


@app.route('/upload_pdf', methods=['POST'])
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
