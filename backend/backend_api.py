from db_models import *
from db_seeder import seed_db
from flask import Flask, render_template, send_file, send_from_directory, request, jsonify, abort
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


@app.route('/get_notes', methods=['GET'])
def get_notes():
    pass

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


#When you send a GET request to /list_pdfs, it queries the MongoDB database, retrieves a list of all stored PDFs,"
#structures their key details (ID, name, and page count) into a clear JSON format,"
# returns this JSON list back to the client with an HTTP status of 200.")
@app.route('/list_pdfs', methods=['GET'])
def list_pdfs():
    pdfs = PDF.objects()
    pdf_list = [
        {
            "id": str(pdf.id),
            "name": pdf.name,
            "num_pages": pdf.num_pages
        } for pdf in pdfs
    ]
    return jsonify(pdf_list), 200


# Delete a PDF by its ID
@app.route('/delete_pdf/<pdf_id>', methods=['DELETE'])
def delete_pdf(pdf_id):
    pdf = PDF.objects(id=pdf_id).first()
    if pdf is None:
        abort(404, description="PDF not found.")
    pdf.delete()
    return jsonify({"message": f"PDF with the ID {pdf_id}  has been successfully deleted."}), 200


# Rename a PDF given its ID and new name
from flask import request, jsonify, abort

@app.route('/rename_pdf/<pdf_id>', methods=['PUT'])
def rename_pdf(pdf_id):
    try:
        pdf = PDF.objects(id=pdf_id).first()

    if pdf is None:
        abort(404, description="PDF not found.")

    data = request.get_json()
    new_name = data.get('new_name')

    if PDF.objects(name=new_name).first():
        abort(409, description="The PDF with this new name already exists.")

    pdf.name = new_name
    pdf.save()

    return jsonify({
        "message": "PDF renamed successfully.",
        "pdf_id": str(pdf.id),
        "new_name": new_name
    }), 200
















if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)