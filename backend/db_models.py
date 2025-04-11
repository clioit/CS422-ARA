from mongoengine import *
from enum import Enum


class NoteType(Enum):
    """Note types from the provided SRS."""
    UNKNOWN = 0
    CHAPTER_TITLE = 1
    SECTION_HEADING = 2
    SECTION_NOTE = 3


class Note(Document):
    """A note attached to a page of a PDF."""
    meta = {'collection': 'notes'}
    start_page = IntField(required=True)
    type = EnumField(NoteType, required=True)
    text = StringField(required=True)


class PDF(Document):
    """A PDF document that a user can take notes on."""
    meta = {'collection': 'pdfs'}
    file = FileField(required=True)
    name = StringField(required=True)
    num_pages = IntField()
    notes = ListField(ReferenceField(Note))


class User(Document):
    """A user that can store PDFs and take notes on them."""
    meta = {'collection': 'users'}
    username = StringField(required=True)
    documents = ListField(ReferenceField(PDF))
