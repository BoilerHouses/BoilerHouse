from dotenv import load_dotenv, dotenv_values
from django.forms.models import model_to_dict
from dotenv import load_dotenv, dotenv_values
from .models import User, LoginPair
import json
import os
import cryptocode


# Create User Object
def create_user_obj(data):
    # Check if user account already exists
    if User.objects.filter(username=data["username"]).exists():
        return {"error": "User Already Exists!", 'status': 400}
    # Since bio and interests are optional, pull them out if present
    bio = ''
    if 'bio' in data:
        bio = data['bio']
    interests = None
    if 'interests' in data:
        interests = data['interests']

    # Attempt to create and save the user object
    load_dotenv()
    pair = LoginPair.objects.filter(username=data['username']).first()
    if not pair:
        return {'error': "User not found", "status": 404}
    try:
        user = User.create(username=data['username'],
                           password=pair['password'],
                           name=data['name'], bio=bio, interests=interests, grad_year=data['grad_year'],
                           major=data['major'])
        user.save()
    except Exception as e:
        return {'error': "Internal Server Error: " + str(type(e)) + str(e), "status": 500}
    # Decrypt password and return it
    ret_obj = model_to_dict(user)
    ret_obj['password'] = cryptocode.decrypt(ret_obj['password'], os.getenv("ENCRYPTION_KEY"))
    return ret_obj


def save_login_pair(username, password):
    load_dotenv()
    password = cryptocode.encrypt(password, os.getenv("ENCRYPTION_KEY"))
    try:
        pair = LoginPair.create(username=username, password=password)
        pair.save()
        return model_to_dict(pair)
    except Exception as e:
        return {'error': "Internal Server Error: " + str(type(e)) + str(e), "status": 500}


# Find a user given username and password
def find_user_obj(username, password):
    load_dotenv()
    target = User.objects.filter(username=username).first()
    # If no user found return error
    if not target:
        return {"error": "Invalid Login Credentials!", 'status': 404}

    # Check if password matches and return if it does
    target = model_to_dict(target)
    target['password'] = cryptocode.decrypt(target['password'], os.getenv("ENCRYPTION_KEY"))
    if target['password'] == password:
        return target
    else:
        return {"error": "Invalid Login Credentials!", 'status': 404}
