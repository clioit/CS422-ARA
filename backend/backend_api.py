from db_models import *
from db_seeder import seed_db
from flask import Flask, render_template
from mongoengine import connect
from os import environ as env


app = Flask(__name__,
            template_folder='/frontend/templates',
            static_folder='/frontend/static')
connect(host=f"mongodb://{env['MONGODB_HOSTNAME']}:27017/ara_db")

if User.objects.count() == 0:
    seed_db()

@app.route('/')
def index():
    return render_template('index.html')