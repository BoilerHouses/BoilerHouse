from dotenv import load_dotenv, dotenv_values
from django.forms.models import model_to_dict
from dotenv import load_dotenv, dotenv_values
from .models import User
import json
import os
import cryptocode


def create_user_obj(data):
    if User.objects.filter(username=data["username"]).exists():
        return {"error": "User already exists", "status": 304}
    bio = ''
    if 'bio' in data:
        bio = data['bio']
    interests = None
    if 'interests' in data:
        interests = data['interests']
    load_dotenv()
    try:
        user = User.create(data['username'], cryptocode.encrypt(data['password'], os.getenv("ENCRYPTION_KEY")),
                           data['name'], bio, data['grad_year'], data['major'])
        user.save()
    except Exception as e:
        return {'error': "Internal Server Error: " + str(type(e)) + str(e), "status": 500}
    ret_obj = model_to_dict(user)
    ret_obj['password'] = cryptocode.decrypt(retObj['password'], os.getenv("ENCRYPTION_KEY"))
    return ret_obj


def find_user_obj(username, password):
    load_dotenv()
    target = User.objects.filter(username=username).first()
    if not target:
        return {"error": "Invalid Login Credentials!", 'status': 404}
    target = model_to_dict(target)
    target['password'] = cryptocode.decrypt(target['password'], os.getenv("ENCRYPTION_KEY"))
    if target['password'] == password:
        return target
    else:
        return {"error": "Invalid Login Credentials!", 'status': 404}
