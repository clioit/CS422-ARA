from db_models import *
#from db_models import User, PDF, Note
from db_seeder import seed_db
from flask import Flask, request, jsonify, send_file
from mongoengine import connect
from os import environ as env
from io import BytesIO


app = Flask(__name__)
connect(host=f"mongodb://{env['MONGODB_HOSTNAME']}:27017/ara_db")
if User.objects.count() == 0:
    seed_db()

# Seed database if empty
if User.objects.count() == 0:
    seed_db()




#Route to retrieve a PDF file
#jsonify automatically adds the Content-Type, is essential for web clients
@app.route('/get_pdf', methods=['GET'])
def get_pdf():
    file_name = request.args.get('name')
    pdf_file = PDF.objects(file=file_name).first()
    if file_name == none:
        return jsonify({"error": "File parameter is required"}), 400
    pdf = PDF.objects(name=file_name).first() #Checks if pdf exsists
    if pdf == None:
        return jsonify({"error": "PDF not found"}), 404

    pdf_bytes = pdf.file.read()
    file_stream = io.BytesIO(pdf_data)
    return send_file(file_stream, mimetype='application/pdf', as_attachment=True, download_name=pdf.name)
    #From the flask.send_file documentation:
    #as_attachment – Indicate to a browser that it should offer to save the file instead of displaying it.
    #download_name – The default name browsers  use when saving the file. Defaults to the passed file name.


# Route to list all PDFs in the database
#id string representation of the PDFs  MongoDB identifier.
@app.route('/list_pdfs', methods=['GET'])
def list_pdfs():
    pdfs = PDF.objects()
    pdf_list = [{"id": str(pdf.id), "name": pdf.name, "num_pages": pdf.num_pages} for pdf in pdfs]
    return jsonify(pdf_list)

h
# Route to search PDFs by filename
@app.route('/find_pdf', methods=['GET'])
def find_pdf():
    query = request.args.get('name')#function expects to pass the name of the file
    if not query:
        return jsonify({"error": "Name query parameter is required"}), 400

    matched_pdfs = PDF.objects(name__icontains=query)
    results = [{"id": str(pdf.id), "name": pdf.name} for pdf in matched_pdfs]

    return jsonify(results), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)