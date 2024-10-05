from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime
from .models import User, LoginPair
from .user_controller import create_user_obj, find_user_obj, resetPasswordEmail, save_login_pair
from .bucket_controller import find_buckets
import json
from .tokens import generate_token
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.forms.models import model_to_dict
from dotenv import load_dotenv
import os


'''
Look at the examples dir for examples of api requests, we can share a postman collection on a later day as well

General structure of a request: Do request validations and then call the method
'''
        
@api_view(['GET'])
def activate(request, uidb64, token):
    user = None
    uid = None
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = LoginPair.objects.get(pk=uid)
    except:
        return Response("unable to activate user because user not found", status=401)
    
    if User.objects.filter(username=user.username).first() is not None:
        return Response("Account already activated", status=202)

    if generate_token.check_token(user, token):
        user.is_active = True
        profile = User.create(username=user.username,
                           password=user.password,
                           name='', bio='', interests=None, grad_year=-1,
                           major='', is_admin=user.is_admin)
        profile.save()
    else:
        user.delete()
        return Response("unable to activate user", status=400) 
    return Response({"message": "Activated Account", "profile": model_to_dict(profile)}, status = 200)

    
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
def register_account(request):
    load_dotenv()
    if "email" not in request.query_params or "password" not in request.query_params:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    
    isAdmin = False
    if "adminKey" in request.query_params and request.query_params['adminKey'] != os.getenv("ADMIN_KEY"):
        return Response(status=401)
    
    if "adminKey" in request.query_params and request.query_params['adminKey'] == os.getenv("ADMIN_KEY"):
        isAdmin = True

    ret = save_login_pair(request, request.query_params['email'], request.query_params['password'], isAdmin)

    if 'error' in ret:
        return Response({'error': ret['error']}, status=ret['status'])
    return Response(ret, status=200)


@api_view(['GET'])
def log_in(request):
    if "username" not in request.query_params or "password" not in request.query_params:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    ret = find_user_obj(request.query_params['username'], request.query_params['password'])
    if 'error' in ret:
        return Response({'error': ret['error']}, status=ret['status'])
    # generate JWT token for user
    user = User.objects.filter(username=ret['username']).first()
    token = generate_token(user)
    data = {"token":token}
    return Response(data, status=200)


@api_view(['POST'])
def create_account(request):
    data = {}
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON Document"}, status=422)
    if ('username' not in data or
            'name' not in data or 'grad_year' not in data or 'major' not in data or "is_admin" not in data):
        return Response({"error": "Invalid Request Missing Parameters"}, status=400)
    ret = create_user_obj(data)
    if 'error' in ret:
        return Response({'error': ret['error']}, status=ret['status'])
    return Response(ret, status=200)

@api_view(['GET']) 
def forgot_password(request):
    if "email" not in request.query_params:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    
    email = request.query_params["email"]
    user = LoginPair.objects.filter(username=email).first()

    if not user:
        return Response({"error": "That email is not associated with an account"}, status=401)

    resetPasswordEmail(request, user, to_email=email)
    return Response({"message": "Email sent successfully!"}, status=200)