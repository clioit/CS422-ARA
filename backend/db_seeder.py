"""
Database seeder for CS 422 Project 1: ARA.

This file runs on startup of the web server and populates the database
with various example objects (users, PDFs, notes, etc.). It loads example
PDFs from a folder called example_documents at the root of the repository.

Author: Ryan Kovatch
Last modified: 04/25/2025
"""

import os
from db_models import *


def seed_db():
    """
    Loads example documents and users into the database.
    NOTE: Assumes MongoEngine is already connected to an instance.
    """
    example_chapters = [
        Chapter(title="Chapter 1 - Introduction", start_page=1, sections=[
            Section(title="Professional software development", start_page=3, notes=[
                Note(text="Software systems are becoming increasingly complex which comes with more issues, but this "
                          "can be solved by software engineering methods."),
                Note(text="A program is a product, but professional software requires software engineering with "
                          "specifications, designs, evolution, alongside documentation, libraries, support, etc."),
                Note(text="Generic products are sold on the market, customized software is sold by a particular "
                          "customer."),
                Note(text="Software engineering has fundamental processes and techniques:\n"
                          "\ta. Software specification (constraints)\n"
                          "\tb. Software development (design and program)\n"
                          "\tc. Software validation (checking)\n"
                          "\td. Software evolution (changing)"),
                Note(text="Common issues with software:\n"
                          "\ta. Diverse systems requirements (PC, mobile, legacy)\n"
                          "\tb. Business and social change (evolution)\n"
                          "\tc. Security and trust (malware)\n"
                          "\td. Scale (different audiences)"),
                Note(text="Regardless of large # of application types, fundamentals apply:\n"
                          "\ta. Use a good and clear development process\n"
                          "\tb. Think about dependability and performance\n"
                          "\tc. Understand software specification and requirements\n"
                          "\td. Make effective use of existing resources"),
                QuestionAnswer(question="What is software engineering? Why is it important?",
                               text="This is my answer."),
                QuestionAnswer(question="What are the different software engineering techniques?",
                               text="This is my other answer.")
            ]),
            Section(title="Software engineering ethics", start_page=12, notes=[
                Note(text="Ethical Issues:\n"
                          "\ta. Confidentiality (privacy of clients)\n"
                          "\tb. Competence (know what to accept)\n"
                          "\tc. Intellectual Property rights (copyright/patents)\n"
                          "\td. Misuse of Resources (off-task)"),
                Note(text="Ethics Importance:\n"
                          "\ta. Professional reputation and employment\n"
                          "\tb. Legal repercussions\n"
                          "\tc. Ability and potential to harm"),
                Note(text="It’s important to recognize ethical issues that arise as well as how to address them both "
                          "from peers and yourself."),
                QuestionAnswer(question="What are ethical and professional issues?",
                               text="This is my answer."),
                QuestionAnswer(question="How might/can these ethical and professional issues affect me?",
                               text="This is my other answer.")
            ]),
            Section(title="Case studies", start_page=15, notes=[
                Note(text="Different systems:\n"
                          "\ta. Embedded system (ex. insulin pump)\n"
                          "\tb. Information system (ex. medical records)\n"
                          "\tc. Sensor-based data collection system (ex. wilderness weather station)\n"
                          "\td. Support system (digital learning environment in school)"),
                Note(text="Key Differences:\n"
                          "\ta. Primary purpose - each system serves a different role better than others\n"
                          "\tb. Interactions - each system interact differently, what interactions do we need?\n"
                          "\tc. Requirements - each system has different challenges associated with it, does it fit "
                          "your goal?"),
                QuestionAnswer(question="What are the four systems for software engineering?",
                               text="This is my answer."),
                QuestionAnswer(question="How do these systems work and how do you differentiate them from each other?",
                               text="This is my other answer.")
            ])
        ])
    ]

    example_docs = []
    if os.path.isdir("/example_documents"):
        for file_name in os.listdir("/example_documents"):
            if file_name.endswith(".pdf"):
                new_pdf = PDF(name=file_name, file=open(f"/example_documents/{file_name}", "rb").read(),
                              chapters=example_chapters)
                new_pdf.save()
                example_docs.append(new_pdf)

    alice = User(username="alice")
    bob = User(username="bob")
    eva = User(username="eva")
    for user in (alice, bob, eva):
        user.documents = example_docs
        user.save()
