from mongoengine import *


class Note(EmbeddedDocument):
    """A note attached to a page of a PDF."""
    meta = {'allow_inheritance': True}
    start_page = IntField(required=True)
    text = StringField(required=True)


class QuestionAnswer(Note):
    """A Q&A note which has two text fields."""
    question = StringField(required=True)


class Section(EmbeddedDocument):
    """A section of a PDF. Used to logically separate notes."""
    #meta = {'collection': 'sections'}
    title = StringField(required=True)
    start_page = IntField(required=True)
    notes = EmbeddedDocumentListField(Note)


class Chapter(EmbeddedDocument):
    """
    A chapter of a PDF. Used to logically separate sections.
    Per the SRS, there needs to be a note hierarchy of at least
    three levels (chapters, sections, notes).
    """
    #meta = {'collection': 'chapters'}
    title = StringField(required=True)
    start_page = IntField(required=True)
    sections = EmbeddedDocumentListField(Section)


class PDF(Document):
    """A PDF document that a user can take notes on."""
    meta = {'collection': 'pdfs'}
    file = FileField(required=True)
    name = StringField(required=True)
    num_pages = IntField()
    chapters = EmbeddedDocumentListField(Chapter)


class User(Document):
    """A user that can store PDFs and take notes on them."""
    meta = {'collection': 'users'}
    username = StringField(required=True)
    documents = ListField(ReferenceField(PDF))
