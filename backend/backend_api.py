from db_models import *
from db_seeder import seed_db
from flask import Flask
from mongoengine import connect
from os import environ as env

app = Flask(__name__)
connect(host=f"mongodb://{env['MONGODB_HOSTNAME']}:27017/ara_db")
if User.objects.count() == 0:
    seed_db()


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"
