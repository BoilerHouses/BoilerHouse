from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from dotenv import load_dotenv, dotenv_values
from cryptography.fernet import Fernet
from django.forms.models import model_to_dict

from .models import User

import json
import os
import boto3

'''
Look at the examples dir for examples of api requests, we can share a postman collection on a later day as well
'''
@api_view(['GET'])
def ping(request):
    return Response("Up and Running: " + str(datetime.now()))


@api_view(['GET'])
def tryBucket(request):
    load_dotenv()
    s3 = boto3.client('s3',
                      aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                      aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"))

    lst = [bucket['Name'] for bucket in s3.list_buckets()['Buckets']]
    return Response(lst)


@api_view(['GET'])
def getUser(request):
    load_dotenv()
    fernet = Fernet(os.getenv("ENCRYPTION_KEY"))
    if ("user" not in request.query_params or "password" not in request.query_params):
        return Response({"Error": "Invalid Request, Missing Parameters!"}, status=400)
    target = User.objects.filter(username=request.query_params["user"]).filter(
        password=fernet.encrypt(request.query_params['password'].encode()).decode()).first()
    if target:
        return Response(target, status=200)
    else:
        return Response({"Error": "Requested User Not Found!"}, status=404)


@api_view(['POST'])
def createUser(request):
    data = {}
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return Response({"Error": "Invalid JSON Document"}, status=400)
    if ('username' not in data or 'password' not in data or
            'name' not in data or 'grad_year' not in data or 'major' not in data):
        return Response({"Error": "Invalid Request Missing Parameters"}, status=400)
    if User.objects.filter(username=data["username"]).exists():
        return Response({"Error": "User already exists"})
    bio = ''
    if 'bio' in data:
        bio = data['bio']
    interests = None
    if 'interests' in data:
        interests = data['interests']
    load_dotenv()
    fernet = Fernet(os.getenv("ENCRYPTION_KEY"))
    try:
        user = User.create(data['username'], fernet.encrypt(data['password'].encode()).decode(), data['name'], bio,
                           interests, data['grad_year'], data['major'])
    except Exception as e:
        return Response({'Error': "Internal Server Error: " + str(type(e)) + str(e)}, 500)
    return Response(model_to_dict(user))
