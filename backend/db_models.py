from mongoengine import *


class Note(Document):
    """A note attached to a page of a PDF."""
    meta = {'collection': 'notes'}
    start_page = IntField(required=True)
    text = StringField(required=True)


class Section(Document):
    """A section of a PDF. Used to logically separate notes."""
    meta = {'collection': 'sections'}
    title = StringField(required=True)
    start_page = IntField(required=True)
    notes = ListField(ReferenceField(Note))


class Chapter(Document):
    """
    A chapter of a PDF. Used to logically separate sections.
    Per the SRS, there needs to be a note hierarchy of at least
    three levels (chapters, sections, notes).
    """
    meta = {'collection': 'chapters'}
    title = StringField(required=True)
    start_page = IntField(required=True)
    sections = ListField(ReferenceField(Section))


class PDF(Document):
    """A PDF document that a user can take notes on."""
    meta = {'collection': 'pdfs'}
    file = FileField(required=True)
    name = StringField(required=True)
    num_pages = IntField()
    chapters = ListField(ReferenceField(Chapter))


class User(Document):
    """A user that can store PDFs and take notes on them."""
    meta = {'collection': 'users'}
    username = StringField(required=True)
    documents = ListField(ReferenceField(PDF))
