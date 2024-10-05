from dotenv import load_dotenv, dotenv_values
from django.forms.models import model_to_dict
from dotenv import load_dotenv, dotenv_values
from .models import User, LoginPair
import os
import cryptocode
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.core.mail import EmailMessage
from .tokens import account_activation_token
import json
from django.db import IntegrityError

from django.conf import settings
import jwt
from jwt import DecodeError, ExpiredSignatureError


# Create User Object
def create_user_obj(data):
    # Check if user account already exists
    if User.objects.filter(email=data["email"]).exists():
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
    pair = LoginPair.objects.filter(email=data['email']).first()
    if not pair:
        return {'error': "User not found", "status": 404}
    try:
        user = User.create(email=data['email'],
                           password=model_to_dict(pair)['password'],
                           name=data['name'], bio=bio, interests=interests, grad_year=data['grad_year'],
                           major=data['major'], is_admin=data['is_admin'])
        user.save()
    except Exception as e:
        return {'error': "Internal Server Error: " + str(type(e)) + str(e), "status": 500}
    # Decrypt password and return it
    ret_obj = model_to_dict(user)
    ret_obj['password'] = cryptocode.decrypt(ret_obj['password'], os.getenv("ENCRYPTION_KEY"))
    return ret_obj

# Create User Object
def edit_user_obj(user, data):
    # Check if user account already exists
    if not user:
        return {"error": "User Does Not Exist!", 'status': 400}
    # Since bio and interests are optional, pull them out if present
    bio = ''
    if 'bio' in data:
        bio = data['bio']
    interests = []
    if 'interests' in data:
        interests = data['interests']
    print(user)
    print(model_to_dict(user))
    # Attempt to create and save the user object
    load_dotenv()
    try:
        user.name = data['name']
        user.interests = json.dumps(interests)
        user.major = json.dumps(data['major'])
        user.bio = bio
        user.grad_year = data['grad_year']
        user.created_profile = True
        user.save()
    except Exception as e:
        return {'error': "Internal Server Error: " + str(type(e)) + str(e), "status": 500}
    # Decrypt password and return it
    ret_obj = model_to_dict(user)
    ret_obj['password'] = cryptocode.decrypt(ret_obj['password'], os.getenv("ENCRYPTION_KEY"))
    return ret_obj

def activate_email(request, user):
    try:
        mail_subject = "Activate your user account."
        message = render_to_string("activate_account.html", {
            'user': user.username,
            'domain': 'localhost:5173',
            'uid': urlsafe_base64_encode(force_bytes(user.pk)),
            'token': account_activation_token.make_token(user),
            "protocol": 'https' if request.is_secure() else 'http'

        })
        email = EmailMessage(mail_subject, message, to={user.username})
        if email.send():
            return "working"
        else:
            return "error"
    except Exception as e:
        return "error"


def save_login_pair(request, email, password, is_admin):
    load_dotenv()
    password = cryptocode.encrypt(password, os.getenv("ENCRYPTION_KEY"))
    try:
        pair = LoginPair.create(username=email, password=password, is_admin=is_admin)
        pair.save()
        s = activate_email(request, pair)
        if "error" in s:
            pair.delete()
            raise Exception("Email not sent, try creating account again")
        return model_to_dict(pair)

    except IntegrityError as e:
        return {'error': "Integrity Error: " + str(type(e)) + str(e), "status": 409}

    except Exception as e:
        return {'error': "Internal Server Error: " + str(type(e)) + str(e), "status": 500}


# Find a user given email and password
def find_user_obj(email, password):
    load_dotenv()

    target = LoginPair.objects.filter(username=email).first()

    # User hasn't registered with that email yet
    if not target:
        return {"error": "That email is not associated with an account", 'status': 401}
    
    # Check if password matches and return if it does
    target = model_to_dict(target)
    target['password'] = cryptocode.decrypt(target['password'], os.getenv("ENCRYPTION_KEY"))
    if target['password'] == password:

        # User hasn't verified account yet
        user = User.objects.filter(username=email).first()

        if not user:
            return {"error": "Please verify your account to be able to login", 'status': 403}

        return target
    else:
        return {"error": "Incorrect password", 'status': 401}



def generate_token(user):
    secret_key = settings.SECRET_KEY
    payload = {'username':user.username, 'is_admin':user.is_admin}
    token = jwt.encode(payload, secret_key, algorithm='HS256')
    return token

def verify_token(token):
    secret_key = settings.SECRET_KEY
    try:
        # Decode the token
        decoded = jwt.decode(token, secret_key, algorithms=['HS256'])
        user = User.objects.filter(username=decoded['username']).first()
        return user
    except DecodeError:
        return "Invalid token"
