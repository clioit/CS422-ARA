from db_models import *
from db_seeder import seed_db
from flask import Flask, render_template, send_file, send_from_directory, request, jsonify
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

"""
# Test this using link below after server is running:
# http://localhost:5001/get_pdf?name=Sample_Survey_Highlights.pdf
@app.route('/get_pdf', methods=['GET'])
def get_pdf():
    filename = request.args.get('file')
    pdf_path = f"/frontend/static/"
    return send_from_directory(pdf_path, filename)
"""

# get_pdf but actually from mongoDB (not local computer)
# Please look over this and upload_pdf
# http://localhost:5001/get_pdf?name=Sample_Survey_Highlights.pdf
@app.route('/get_pdf', methods=['GET'])
def get_pdf():
    filename = request.args.get('name')
    pdf_file = PDF.objects(name=filename).first()
    file_data = pdf_file.file.read()
    file_stream = io.BytesIO(file_data)
    return send_file(file_stream, mimetype='application/pdf')

@app.route('/get_notes', methods=['GET'])
def get_notes():
    pass

# You can test this by opening the webpage and trying to upload
# a file. It should populate in pdfs section of MongoDB
# You can access it using
# http://localhost:5001/get_pdf?name=[uploaded file name here].pdf
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
