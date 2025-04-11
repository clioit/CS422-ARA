FROM python:3.13-alpine
LABEL maintainer="rkovatch@uoregon.edu"

COPY backend_api.py backend_api.py
COPY db_models.py db_models.py
COPY db_seeder.py db_seeder.py
COPY example_documents example_documents

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

ENTRYPOINT ["python", "-m"]
CMD ["flask", "--app", "backend_api", "--debug", "run", "--host=0.0.0.0"]
