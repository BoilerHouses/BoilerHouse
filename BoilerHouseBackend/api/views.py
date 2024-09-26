from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from dotenv import load_dotenv, dotenv_values
from django.forms.models import model_to_dict
from .models import User
import json
import os
import boto3
import cryptocode

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
    if ("user" not in request.query_params or "password" not in request.query_params):
        return Response({"Error": "Invalid Request, Missing Parameters!"}, status=400)
    a = model_to_dict(User.objects.filter(username=request.query_params["user"]).first())
    target = User.objects.filter(username=request.query_params["user"]).first()
    if not target:
        return Response({"Error": "Invalid Login Credentials!"}, status=404)
    target = model_to_dict(target)
    target['password'] = cryptocode.decrypt(target['password'], os.getenv("ENCRYPTION_KEY"))
    if target['password'] == request.query_params['password']:
        return Response(target, status=200)
    else:
        return Response({"Error": "Invalid Login Credentials!"}, status=404)


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
    try:
        user = User.create(data['username'], cryptocode.encrypt(data['password'],os.getenv("ENCRYPTION_KEY")), data['name'], bio,
                           interests, data['grad_year'], data['major'])
        user.save()
    except Exception as e:
        return Response({'Error': "Internal Server Error: " + str(type(e)) + str(e)}, 500)
    retObj = model_to_dict(user)
    retObj['password'] = cryptocode.decrypt(retObj['password'],os.getenv("ENCRYPTION_KEY"))
    return Response(retObj, status=200)
