from db_models import *
from db_seeder import seed_db
from flask import Flask, render_template, send_file, send_from_directory, request, abort
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

# Test this using link below after server is running:
# http://localhost:5001/get_pdf?file=Sample_Survey_Highlights.pdf
@app.route('/get_pdf', methods=['GET'])
def get_pdf():
    filename = request.args.get('file')
    pdf_path = f"/frontend/static/"
    return send_from_directory(pdf_path, filename)

"""
# get_pdf but actually from mongoDB (not local computer)
# Should be close to done, but I'm not sure how to test
# the function without upload_pdf to retrieve it yet

@app.route('/get_pdf', methods=['GET'])
def get_pdf():
    filename = request.args.get('name')
    pdf_file = PDF.objects(name=filename).first()
    file_data = pdf_file.file.read()
    file_stream = io.BytesIO(file_data)
    return send_file(file_stream, mimetype='application/pdf')
"""

@app.route('/get_notes', methods=['GET'])
def get_notes():
    pass

@app.route('/upload_pdf', methods=['POST'])
def upload_pdf():
    pass