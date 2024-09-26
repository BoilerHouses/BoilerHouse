from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from .models import User
from .user_controller import create_user_obj, find_user_obj
from .bucket_controller import find_buckets
import json

'''
Look at the examples dir for examples of api requests, we can share a postman collection on a later day as well

General structure of a request: Do request validations and then call the method
'''
@api_view(['GET'])
def ping(request):
    return Response("Up and Running: " + str(datetime.now()))


@api_view(['GET'])
def try_bucket(request):
    try:
        return Response(find_buckets())
    except Exception as ex:
        return Response({'error': "Internal Server Error: " + str(type(e)) + str(e)}, status=500)
    return Response(lst)


@api_view(['GET'])
def log_in(request):
    if "user" not in request.query_params or "password" not in request.query_params:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    ret = find_user_obj(request.query_params['user'], request.query_params['password'])
    if 'error' in ret:
        return Response({'error': ret['error']}, status=ret['status'])
    return Response(ret, status=200)


@api_view(['POST'])
def create_account(request):
    data = {}
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON Document"}, status=422)
    if ('username' not in data or 'password' not in data or
            'name' not in data or 'grad_year' not in data or 'major' not in data):
        return Response({"error": "Invalid Request Missing Parameters"}, status=400)
    ret = create_user_obj(data)
    if 'error' in ret:
        print(Response({'error': ret['error']}, status=ret['status']))
        return Response({'error': ret['error']}, status=ret['status'])
    return Response(retObj, status=200)
