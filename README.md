# CS 422 Spring 2025 Project 1: ARA (Active-Reading Assistant)
### Authors: Claire Cody, Ryan Kovatch, Clio Tsao, Derek Van Devender, Song Zhang
### Last modified: 5/5/2025
The ARA is a hierarchical note-taking and annotation application for PDFs. Users can annotate content using chapters, 
sections, notes and flashcards while reading. All annotations are automatically saved onto the server. The frontend is 
built with HTML and JavaScript, connected to a backend comprised of a Python web server and a MongoDB database. The
entire system is deployed using Docker.

## Purpose
The ARA was created as an assignment for CS 422 Software Methodologies I at the University of Oregon. The purpose was 
to implement a structured reading tool that supports the SQ3R (Survey, Question, Read, Recite, Review) method for 
reading PDFs and taking hierarchical notes. The project uses a backend (server) + frontend (UI) software to guide 
students through this method using their own notes, linked PDFs, and reviews.

## Repository Organization
The ARA repository is organized into three main directories:
- `frontend`: HTML, JavaScript, and CSS files supporting the frontend web app
  - `static`: JavaScript and CSS files served automatically. Includes .js and .css files for home, login, readRecite, 
    surveyQuestion, and review pages, as well as loadingTags.js which provides logic shared across readRecite,
    surveyQuestion, and review.
  - `templates`: Jinja HTML templates to be rendered before they’re served. Includes HTML pages for login, home, 
    surveyQuestion, readRecite, and review.
- `backend`: Python code implementing the backend web server
  - `db_models.py`: a file implementing classes for each major object type
  - `db_seeder.py`: code for loading example documents into the database
  - `backend_api.py`: the main Flask web server code
- `example_documents`: PDF files loaded on startup for demonstration purposes
  - `dummy.pdf`: a barebones PDF file for testing

## Installation and Usage
The only host-system dependency this application has is Docker. All other dependencies (Python 3.13, external libraries,
and MongoDB) are installed automatically in isolated containers during the build process. To install the Docker Engine
and Docker Compose, click the link for your platform on [Get Docker](https://docs.docker.com/get-started/get-docker/).

Once you've installed Docker, open Docker Desktop. This will start the Docker daemon in the background so you can build
and deploy Docker containers. Now, assuming you have already downloaded/extracted the source code:

- `cd` into the repository's root directory.
- Drop any desired example documents in the `example_documents` directory. These will become available to all users on
  startup, with a preloaded set of example annotations.
- Run `docker compose up -d`. This will bring up the application in the background.

After the build process finishes, the ARA web interface will be accessible at http://localhost:5001. The MongoDB
instance is accessible for debugging purposes at mongodb://localhost:5002.