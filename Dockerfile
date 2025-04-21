FROM python:3.13-alpine
LABEL maintainer="rkovatch@uoregon.edu"

COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

COPY backend backend
COPY frontend frontend

ENTRYPOINT ["python", "-m"]
CMD ["flask", "--app", "backend/backend_api", "--debug", "run", "--host=0.0.0.0"]
