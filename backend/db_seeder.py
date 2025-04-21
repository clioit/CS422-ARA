import os
from db_models import *


def seed_db():
    """
    Loads example documents and users into the database.
    NOTE: Assumes MongoEngine is already connected to an instance.
    """
    example_docs = []
    static_path = "/frontend/static"
    if os.path.isdir("/frontend/static"):
        for file_name in os.listdir("/frontend/static"):
            if file_name.endswith(".pdf"):
                new_pdf = PDF(name=file_name, file=open(f"/frontend/static/{file_name}", "rb").read())
                new_pdf.save()
                example_docs.append(new_pdf)

    alice = User(username="alice")
    bob = User(username="bob")
    eva = User(username="eva")
    for user in (alice, bob, eva):
        user.documents = example_docs
        user.save()
