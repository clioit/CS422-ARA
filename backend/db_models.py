"""
MongoDB object schemas for CS 422 Project 1: ARA.

This file defines classes for accessing objects in our MongoDB
instance. mongoengine provides methods for creating, validating,
saving, and retrieving objects of each of these types.

Author: Ryan Kovatch
Last modified: 04/25/2025
"""

from mongoengine import *
from bson.objectid import ObjectId


def new_obj_id() -> str:
    obj_id = ObjectId()
    return str(obj_id)


class Note(EmbeddedDocument):
    """A note attached to a page of a PDF."""
    meta = {'allow_inheritance': True}
    _id = StringField(required=True, default=new_obj_id, primary_key=True)
    start_page = IntField()
    text = StringField(required=True)


class QuestionAnswer(Note):
    """A Q&A note which has two text fields."""
    question = StringField(required=True)


class Section(EmbeddedDocument):
    """A section of a PDF. Used to logically separate notes."""
    _id = StringField(required=True, default=new_obj_id, primary_key=True)
    title = StringField(required=True)
    start_page = IntField(required=True)
    notes = EmbeddedDocumentListField(Note)


class Chapter(EmbeddedDocument):
    """
    A chapter of a PDF. Used to logically separate sections.
    Per the SRS, there needs to be a note hierarchy of at least
    three levels (chapters, sections, notes).
    """
    _id = StringField(required=True, default=new_obj_id, primary_key=True)
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
