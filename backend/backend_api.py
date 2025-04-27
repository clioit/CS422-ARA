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
    return render_template('login.html')

# open this html template
@app.route('/readRecite')
def readRecite():
    return render_template('readRecite.html')

# open this html template
@app.route('/home')
def home():
    return render_template('home.html')

# open this html template
@app.route('/review')
def review():
    return render_template('review.html')

# open this html template
@app.route('/surveyQuestion')
def surveyQuestion():
    return render_template('surveyQuestion.html')

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
