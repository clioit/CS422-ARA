# CS 422 Spring 2025 Project 1: ARA (Active-Reading Assistant)

## Usage
### Server
The backend server is run in two containers orchestrated using Docker Compose. To install the Docker Engine and Docker 
Compose, click the link for your platform on [Get Docker](https://docs.docker.com/get-started/get-docker/).

Once you've installed Docker, open Docker Desktop. This will start the Docker daemon in the background so you can build
and deploy Docker containers. Now:

- `cd` into the repository's `backend` directory.
- (Optional) `mkdir example_documents` and move example PDFs into that folder.
  - These will be loaded into the database on startup and become available to all users.
- Run `docker compose up -d`.

After the build process finishes, the MongoDB database instance and the ARA web API will be running in the background.
You can see a "hello world" page at http://localhost:5001. To inspect the database, you can connect to
mongodb://localhost:5002 using [MongoDB Compass](https://www.mongodb.com/products/tools/compass).