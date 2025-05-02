from mongoengine import *
from bson.objectid import ObjectId


class Note(EmbeddedDocument):
    """A note attached to a page of a PDF."""
    meta = {'allow_inheritance': True}
    _id = StringField(required=True, default=str(ObjectId()))
    start_page = IntField(required=True)
    text = StringField(required=True)


class QuestionAnswer(Note):
    """A Q&A note which has two text fields."""
    question = StringField(required=True)


class Section(EmbeddedDocument):
    """A section of a PDF. Used to logically separate notes."""
    _id = StringField(required=True, default=str(ObjectId()))
    title = StringField(required=True)
    start_page = IntField(required=True)
    notes = EmbeddedDocumentListField(Note)


class Chapter(EmbeddedDocument):
    """
    A chapter of a PDF. Used to logically separate sections.
    Per the SRS, there needs to be a note hierarchy of at least
    three levels (chapters, sections, notes).
    """
    _id = StringField(required=True, default=str(ObjectId()))
    title = StringField(required=True)
    start_page = IntField(required=True)
    sections = EmbeddedDocumentListField(Section)


class PDF(Document):
    """A PDF document that a user can take notes on."""
    meta = {'collection': 'pdfs'}
    file = FileField(required=True)
    name = StringField(required=True)
    chapters = EmbeddedDocumentListField(Chapter)


class User(Document):
    """A user that can store PDFs and take notes on them."""
    meta = {'collection': 'users'}
    username = StringField(required=True)
    documents = ListField(ReferenceField(PDF))
