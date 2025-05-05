"""
Web server for CS 422 Project 1: ARA

This file implements a RESTful API for committing and retrieving PDF
and note data from a MongoDB instance. It also renders and serves the
HTML templates in frontend/templates.

Authors: Ryan Kovatch, Song Zhang, Derek van Devender
Last modified: 04/29/2025
"""

import mongoengine
from db_models import *
from db_seeder import seed_db
from flask import Flask, render_template, send_file, request, make_response, redirect, url_for, abort
from functools import wraps
from mongoengine import connect
from os import environ as env
import io

app = Flask(__name__,
            template_folder='/frontend/templates',
            static_folder='/frontend/static')
connect(host=f"mongodb://{env['MONGODB_HOSTNAME']}:27017/ara_db")

if User.objects.count() == 0:
    seed_db()


def get_object_by_id(collection, obj_id: str, is_array=False, **addl_filters):
    """Gets an object from a collection/array by its ID."""
    try:
        if is_array:
            obj = collection.filter(_id=obj_id, **addl_filters)
            if len(obj) == 0:
                abort(404, f"{repr(collection)} object with ID {obj_id} not found.")
            elif len(obj) == 1:
                return obj[0]
        else:
            obj = collection.objects(id=obj_id, **addl_filters).first()
            if obj is not None:
                return obj
            else:
                abort(404, f"{repr(collection)} object with ID {obj_id} not found.")
    except mongoengine.errors.InvalidQueryError:
        abort(400, f"Object ID {obj_id} is of an invalid format.")


def get_user_pdf(pdf_id: str):
    """Gets a user's PDF by its ID."""
    user = get_object_by_id(User, request.cookies["user"])
    user_pdf_ids = [str(doc.id) for doc in user.documents]
    if pdf_id in user_pdf_ids:
        return get_object_by_id(PDF, pdf_id)
    else:
        abort(404, f"User PDF with ID {pdf_id} not found.")


def get_username():
    """Gets the username of the current user."""
    user = get_object_by_id(User, request.cookies["user"])
    return user.username


def instantiate_from_request_json(cls):
    """Instantiates a class from a JSON object in the request body."""
    try:
        new_obj = cls.from_json(request.get_data(as_text=True))
        new_obj.validate()
        return new_obj
    except ValidationError as e:
        return abort(400, str(e))


def json_response(json_str: str, status_code=200):
    """
    Creates a response object for payloads that are not
    implicitly marked as application/json.
    """
    resp = make_response(json_str)
    resp.status_code = status_code
    resp.content_type = "application/json"
    return resp


def requires_login(route):
    """Redirects to the login page if the user is not auth'd."""

    @wraps(route)
    def login_check_wrapper(**kwargs):
        if "user" in request.cookies:
            if User.objects(id=request.cookies["user"]).first() is not None:
                return route(**kwargs)  # Client is logged in
            else:
                return redirect(url_for("logout"))  # Client has stored an invalid user ID, clear it
        else:
            return redirect(url_for("login"))  # Client is not logged in

    return login_check_wrapper


@app.route('/')
def index():
    """Redirects to the home page."""
    return redirect(url_for("home"))


@app.route('/login', methods=['GET', 'POST'])
def login():
    """Page for logging in. Passwords are not currently implemented."""
    match request.method:
        case 'GET':
            """Users log in here."""
            return render_template("login.html", users=User.objects())

        case 'POST':
            """Processes login form and sets user cookie."""
            if "username" in request.form:
                user = User.objects(username=request.form["username"]).first()
                if user is not None:
                    resp = make_response(redirect(url_for("home")))
                    resp.set_cookie("user", str(user.id), max_age=3600)
                    return resp
                else:
                    return redirect(url_for("login"))
            else:
                return redirect(url_for("login"))


@app.route('/logout')
def logout():
    """Logs out the current user."""
    resp = make_response(redirect(url_for("login")))
    resp.set_cookie('user', '', expires=0)
    return resp


@app.route('/home')
@requires_login
def home():
    """Homepage for choosing which PDFs to open."""
    if "user" in request.cookies:
        return render_template('home.html', get_username=get_username)
    else:
        return redirect(url_for("login"))


@app.route('/pdfs/<pdf_id>/surveyQuestion')
@requires_login
def survey_question(pdf_id):
    """Page for reading PDF, taking questions/answers, and adding chapters/sections."""
    return render_template('surveyQuestion.html', pdf_id=pdf_id, get_username=get_username)


@app.route('/pdfs/<pdf_id>/readRecite')
@requires_login
def read_recite(pdf_id):
    """Page for reading PDF, taking notes, and choosing chapters for notes."""
    return render_template('readRecite.html', pdf_id=pdf_id, get_username=get_username)


@app.route('/pdfs/<pdf_id>/review')
@requires_login
def review(pdf_id):
    """Page for choosing chapters to review content with flashcards."""
    return render_template('review.html', pdf_id=pdf_id, get_username=get_username)


@app.route('/pdfs', methods=['GET', 'POST'])
@requires_login
def pdf_set_operations():
    user = get_object_by_id(User, request.cookies["user"])

    match request.method:
        case 'GET':
            """
            Queries the MongoDB database, retrieves a list of all stored PDFs,
            structures their key details (ID, name, and page count) into a clear JSON format.
            """
            pdf_list = [
                {
                    "_id": str(pdf.id),
                    "name": pdf.name,
                    "num_chapters": len(pdf.chapters),
                } for pdf in user.documents
            ]
            return pdf_list

        case 'POST':
            """Receives and uploads a PDF to the MongoDB database."""
            file = request.files['pdf_file']
            if file.filename.endswith(".pdf"):
                # Check for existing PDFs of this name
                for pdf in user.documents:
                    if pdf.name == file.filename:
                        return {'message': f'Could not upload: "{file.filename}" already exists.'}, 409

                new_pdf = PDF(name=file.filename)
                new_pdf.file.put(file)
                new_pdf.save()
                user.documents.append(new_pdf)
                user.save()
                return {'message': f'File "{file.filename}" successfully uploaded.'}, 201


@app.route('/pdfs/<pdf_id>', methods=['GET', 'PATCH', 'DELETE'])
@requires_login
def pdf_object_operations(pdf_id: str):
    pdf = get_user_pdf(pdf_id)

    match request.method:
        case 'GET':
            """
            Retrieves a PDF from the MongoDB database and returns its bytes.
            Ex: http://localhost:5001/pdfs/680be4af29187334e35baad3
            """
            file_data = pdf.file.read()
            file_stream = io.BytesIO(file_data)
            return send_file(file_stream, mimetype='application/pdf', download_name=pdf.name)

        case 'PATCH':
            """Renames a PDF given its ID."""
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

        case 'DELETE':
            """Deletes a PDF given its ID."""
            pdf.delete()
            return {"success": True}, 200


@app.route('/pdfs/<pdf_id>/notes', methods=['GET'])
@requires_login
def get_note_hierarchy(pdf_id: str):
    """Gets the note hierarchy for a PDF."""
    pdf = get_user_pdf(pdf_id)
    return pdf.to_mongo().to_dict()["chapters"]


@app.route('/pdfs/<pdf_id>/chapters', methods=['GET', 'POST'])
@requires_login
def chapter_set_operations(pdf_id: str):
    pdf = get_user_pdf(pdf_id)

    match request.method:
        case 'GET':
            """Lists chapters in a PDF."""
            return [{
                "_id": str(chap._id),  # TODO: don't access protected attr
                "title": chap.title,
                "start_page": chap.start_page,
                "sections_count": len(chap.sections)
            } for chap in pdf.chapters]

        case 'POST':
            """Creates a new chapter of a PDF."""
            new_chapter = instantiate_from_request_json(Chapter)
            pdf.chapters.append(new_chapter)
            pdf.save()
            return json_response(new_chapter.to_json(), 201)


@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>', methods=['GET', 'PATCH', 'DELETE'])
@requires_login
def chapter_object_operations(pdf_id: str, chapter_id: str):
    pdf = get_user_pdf(pdf_id)
    this_chapter = get_object_by_id(pdf.chapters, chapter_id, is_array=True)

    match request.method:
        case 'GET':
            """Gets a single chapter of a PDF."""
            return json_response(this_chapter.to_json())

        case 'PATCH':
            """Renames a single chapter of a PDF."""
            new_chapter = instantiate_from_request_json(Chapter)
            if new_chapter.title != this_chapter.title:
                this_chapter.title = new_chapter.title
            pdf.save()
            return json_response(this_chapter.to_json())

        case 'DELETE':
            """Deletes a single chapter of a PDF, INCLUDING ALL OF ITS SECTIONS AND NOTES."""
            PDF.objects(id=pdf_id).update_one(
                pull__chapters___id=this_chapter._id,  # TODO: don't access protected attr
                upsert=False
            )
            return {"success": True}


@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections', methods=['GET', 'POST'])
@requires_login
def section_set_operations(pdf_id: str, chapter_id: str):
    pdf = get_user_pdf(pdf_id)
    chapter = get_object_by_id(pdf.chapters, chapter_id, is_array=True)

    match request.method:
        case 'GET':
            """Lists sections in a chapter of a PDF."""
            return [{
                "_id": str(sec._id),  # TODO: don't access protected attr
                "title": sec.title,
                "start_page": sec.start_page,
                "notes_count": len(sec.notes)
            } for sec in chapter.sections]

        case 'POST':
            """Creates a section in a chapter of a PDF."""
            new_section = instantiate_from_request_json(Section)
            chapter.sections.append(new_section)
            pdf.save()
            return json_response(new_section.to_json(), 201)


@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections/<section_id>', methods=['GET', 'PATCH', 'DELETE'])
@requires_login
def section_object_operations(pdf_id: str, chapter_id: str, section_id: str):
    pdf = get_user_pdf(pdf_id)
    chapter = get_object_by_id(pdf.chapters, chapter_id, is_array=True)
    this_section = get_object_by_id(chapter.sections, section_id, is_array=True)

    match request.method:
        case 'GET':
            """Gets a single section of a chapter."""
            return json_response(this_section.to_json())

        case 'PATCH':
            """Renames a section of a chapter."""
            new_section = instantiate_from_request_json(Section)
            if new_section.title != this_section.title:
                this_section.title = new_section.title
            pdf.save()
            return json_response(this_section.to_json())

        case 'DELETE':
            """Deletes a section of a chapter, INCLUDING ALL OF ITS NOTES."""
            PDF.objects(id=pdf_id).update_one(
                __raw__={"$pull": {"chapters.$[i].sections": {
                    "_id": this_section._id  # TODO: don't access protected attr
                }}},
                array_filters=[{"i._id": chapter_id}],
                upsert=False
            )
            return {"success": True}


@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections/<section_id>/notes', methods=['GET', 'POST'])
@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections/<section_id>/qas', methods=['GET', 'POST'])
@requires_login
def note_set_operations(pdf_id: str, chapter_id: str, section_id: str):
    if request.path.endswith("notes"):
        note_class = Note
    elif request.path.endswith("qas"):
        note_class = QuestionAnswer
    else:
        abort(500)  # This should never happen

    pdf = get_user_pdf(pdf_id)
    chapter = get_object_by_id(pdf.chapters, chapter_id, is_array=True)
    section = get_object_by_id(chapter.sections, section_id, is_array=True)

    match request.method:
        case 'GET':
            """Lists notes in a section of a PDF."""
            section_notes = section.notes.filter(_cls=note_class.__name__)
            if note_class == Note:
                return [{
                    "_id": str(note._id),  # TODO: don't access protected attr
                    "start_page": note.start_page,
                    "text": note.text
                } for note in section_notes]
            elif note_class == QuestionAnswer:
                return [{
                    "_id": str(note._id),  # TODO: don't access protected attr
                    "start_page": note.start_page,
                    "question": note.question,
                    "text": note.text
                } for note in section_notes]

        case 'POST':
            """Creates a new note on a PDF."""
            new_note = instantiate_from_request_json(note_class)
            section.notes.append(new_note)
            pdf.save()
            return json_response(new_note.to_json(), 201)


@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections/<section_id>/notes/<note_id>', methods=['GET', 'PATCH',
                                                                                                  'DELETE'])
@app.route('/pdfs/<pdf_id>/chapters/<chapter_id>/sections/<section_id>/qas/<note_id>', methods=['GET', 'PATCH',
                                                                                                'DELETE'])
@requires_login
def note_object_operations(pdf_id: str, chapter_id: str, section_id: str, note_id: str):
    if "/notes/" in request.path:
        note_class = Note
    elif "/qas/" in request.path:
        note_class = QuestionAnswer
    else:
        abort(500)  # This should never happen

    pdf = get_user_pdf(pdf_id)
    chapter = get_object_by_id(pdf.chapters, chapter_id, is_array=True)
    section = get_object_by_id(chapter.sections, section_id, is_array=True)
    this_note = get_object_by_id(section.notes, note_id, is_array=True, _cls=note_class.__name__)

    match request.method:
        case 'GET':
            """Retrieves a single note."""
            return json_response(this_note.to_json())

        case 'PATCH':
            """Edits the text of a single note."""
            new_note = instantiate_from_request_json(Note)
            if new_note.text != this_note.text:
                this_note.text = new_note.text
            if note_class == QuestionAnswer and new_note.question != this_note.question:
                this_note.question = new_note.question
            pdf.save()
            return json_response(this_note.to_json())

        case 'DELETE':
            """Deletes a single note."""
            PDF.objects(id=pdf_id).update_one(
                __raw__={"$pull": {"chapters.$[i].sections.$[j].notes": {
                    "_id": this_note._id,  # TODO: don't access protected attr
                    "_cls": note_class.__name__,
                }}},
                array_filters=[{"i._id": chapter_id}, {"j._id": section_id}],
                upsert=False
            )
            return {"success": True}


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
