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


# Route to list all PDFs in the database
#id string representation of the PDFs  MongoDB identifier.
@app.route('/list_pdfs', methods=['GET'])
def list_pdfs():
    pdfs = PDF.objects()
    pdf_list = [{"id": str(pdf.id), "name": pdf.name, "num_pages": pdf.num_pages} for pdf in pdfs]
    return jsonify(pdf_list)


# Route to search PDFs by filename
@app.route('/find_pdf', methods=['GET'])
def find_pdf():
    query = request.args.get('name')
    if not query:
        return jsonify({"error": "Name query parameter is required"}), 400

    matched_pdfs = PDF.objects(name__icontains=query)
    results = [{"id": str(pdf.id), "name": pdf.name} for pdf in matched_pdfs]

    return jsonify(results), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)