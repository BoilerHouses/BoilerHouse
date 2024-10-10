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
from .tokens import account_activation_token, reset_password_token
import json
from django.db import IntegrityError
import boto3
import uuid
from django.conf import settings
import jwt
from jwt import DecodeError, ExpiredSignatureError


# Create User Object
def edit_user_obj(user, data):
    # Check if user account already exists
    if not user:
        return {"error": "User Does Not Exist!", 'status': 400}
    # Since bio and interests are optional, pull them out if present
    bio = user.bio
    print(data)
    if data.get('bio'):
        bio = data.get('bio')
    i = 0
    interests = user.interests
    if (data.get(f'interest[{i}]')):
        interests = []
    while(data.get(f'interest[{i}]')):
        interests.append(data.get(f'interest[{i}]'))
        i+=1
    name = user.name
    if data.get('name'):
        name = data.get('name')
    major = user.major
    i = 0
    if (data.get(f'major[{i}]')):
        major = []
    while(data.get(f'major[{i}]')):
        major.append(data.get(f'major[{i}]'))
        i+=1
    grad_year = user.grad_year
    if data.get('grad_year'):
        grad_year = data.get('grad_year')
    # Attempt to create and save the user object
    load_dotenv()
    try:
        user.name = name
        user.interests = interests
        user.major = major
        user.bio = bio
        user.grad_year = grad_year
        user.created_profile = True
        profile_picture = data.get('profile_picture')
        if profile_picture: 
            s3_client = boto3.client('s3',
                        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"))
            file_name = f'{user.username}/profile_picture/{uuid.uuid4()}.{profile_picture.name.split(".")[-1]}'
            s3_client.upload_fileobj(
                profile_picture,
                settings.AWS_STORAGE_BUCKET_NAME,
                file_name,
                ExtraArgs={'ACL': 'public-read', 'ContentType': profile_picture.content_type}
            )
            user.profile_picture = f'https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{file_name}'
        print(model_to_dict(user))
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

def resetPasswordEmail(request, user, to_email):
    mail_subject = "Reset your password."

    message = render_to_string("forgot_password.html", {
        'user': user.username, 
        'domain': 'localhost:5173',
        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
        'token': reset_password_token.make_token(user),
        "protocol": 'https' if request.is_secure() else 'http'
    })

    email = EmailMessage(mail_subject, message, to={to_email})
    if not email.send():
        return {"error": "Error occurred while sending email", 'status': 401}
    
    return "success"

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
