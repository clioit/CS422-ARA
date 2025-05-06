# Dockerfile for ARA web server
#
# This file dictates the build process for the ARA web server container.
# It pulls a prebuilt Python 3.13 image and copies the program files into it,
# then runs the program.
#
# Author: Ryan Kovatch (rkovatch@uoregon.edu)
# Last modified: 04/22/2025

FROM python:3.13-alpine
LABEL maintainer="rkovatch@uoregon.edu"

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY backend backend
COPY frontend frontend
COPY example_documents example_documents

ENTRYPOINT ["python", "-m"]
CMD ["flask", "--app", "backend/backend_api", "--debug", "run", "--host=0.0.0.0"]
