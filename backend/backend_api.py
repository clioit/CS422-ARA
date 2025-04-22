from db_models import *
from db_seeder import seed_db
from flask import Flask, request, jsonify, send_file
from mongoengine import connect
from os import environ as env
#from db_models import User, PDF, Note
#from io import BytesIO


app = Flask(__name__)
connect(host=f"mongodb://{env['MONGODB_HOSTNAME']}:27017/ara_db")
if User.objects.count() == 0:
    seed_db()

# Seed database if empty
if User.objects.count() == 0:
    seed_db()

# Basic test route
#@app.route("/")
#def hello_world():
#    return "<p>Hello, World!</p>"

# Route to retrieve a PDF file
#jsonify automatically adds the Content-Type, is essential for web clients
@app.route('/get_pdf', methods=['GET'])
def get_pdf():
    file_name = request.args.get('file')
    pdf_file = PDF.objects(file=filename).first()
    if not file_name:
        return jsonify({"error": "File parameter is required"}), 404 #400?

    pdf = PDF.objects(name=file_name).first()
    if not pdf:
        return jsonify({"error": "PDF not found"}), 404

    pdf_bytes = pdf.file.read()
    return send_file(BytesIO(pdf_bytes),
                     mimetype='application/pdf')
#as_attachment=True, download_name=pdf.name)???



# Route to list all PDFs in the database
#id string representation of the PDFs  MongoDB identifier.
@app.route('/list_pdfs', methods=['GET'])
def list_pdfs():
    pdfs = PDF.objects()
    pdf_list = [{"id": str(pdf.id), "name": pdf_
