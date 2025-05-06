1. The system supports hierarchical note-taking and annotation for PDFs. Users can organize content using chapters, sections, notes/flashcards while reading. All annotations are automatically saved onto the server. The frontend is built with HTML and JavaScript, connected to a Python (Flask + MongoEngine) backend REST API. The entire system is deployed using Docker.

	
2. The authors (alphabetical by last name).
Claire Cody, Ryan Kovatch, Clio Tsao, Derek Van Devender, Song Zhang


3. When it was created.
Last Modified 5/5/2025


4. Why it was created such as the class name and assignment.
CS422 (or similar advanced software engineering / systems course
Project 1 - Active Reading Assistant (ARA)
The purpose was to implement a structured reading tool that supports the SQ3R (Survey, Question, Read, Recite, Review) method for reading PDFs and taking hierarchical notes.
The project uses a backend (server) + frontend (UI) software to guide students through this method using their own notes, linked PDFs, and reviews.


5. What needs to be done to compile the source code and run the program.
Backend (Flask + MongoEngine + Docker):
Install Python 3.12 or higher.
Install Flask and MongoEngine libraries (pip install flask mongoengine).
Build and run Docker container
MongoDB must be running (either local or remote).

Frontend:
Templates (HTML) + Static (CSS + JS) are served via Flask backend.
Just access through the Flask server (i.e. open localhost or deploy server in browser).

6. Any additional setup that is needed.
MongoDB server must be up and running.
This can be local (localhost) or Dockerized version (if applicable).
MongoDB stores all user notes, PDFs info, and SQ3R data.

Preloads PDF files into the backends PDF directory or database so that users have starter content.
(Some sample PDFs should be included or manually uploaded for the demo/test).

No login or authentication required other than selecting from the drop down a username.
(Built-in usernames handled in frontend login page.)

Frontend templates and static files must be properly placed in /templates and /static respectively, and Flask must be configured correctly to serve them.


7. Software dependencies such as the version of the compiler.
Languages + Versions:
    Python 3.12 or higher (as per SRS).
    Flask (pip installed).
    MongoEngine (pip installed).
    MongoDB (Any recent stable version, tested on latest community version).
    Docker (optional for backend deployment — tested on Docker Desktop or CLI version).


8. A brief description of what is in each subdirectory in the directory structure.

/CS422-ARA
|
|-- .idea/                 # (IDE config files — automatically created by IDE like PyCharm)
|
|-- backend/               # Backend Python code (Flask app)
|                           API routes, MongoEngine models, server logic
|
|--example documents/      # Example PDFs
|                          Pre-loaded PDFs for Survey (highlighted PDFs)
|
|-- frontend/              # Frontend Web App (HTML templates + Static files)
|   |-- templates/         # HTML Pages (login.html, home.html, readRecite.html, etc)
|   |--static/             # CSS and JS files (home.css, review.js, etc)
|
|-- .gitignore             # Git ignore list (optional version control config)
|
|-- docker-compose         # Docker Compose file (manages multi-container setup)
|
|-- Dockerfile             # Dockerfile (backend container setup for Flask + dependencies)
|
|-- README                 # Project overview and instructions
|
|-- requirements           # Python dependencies (Flask, MongoEngine)



