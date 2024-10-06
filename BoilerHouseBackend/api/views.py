from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime
from .models import User, LoginPair
from .user_controller import create_user_obj, find_user_obj, save_login_pair
from .bucket_controller import find_buckets
import json
import boto3
from .tokens import account_activation_token
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMessage
from django.forms.models import model_to_dict
from django.http import HttpResponse
from dotenv import load_dotenv, dotenv_values
from django.conf import settings
import os



'''
Look at the examples dir for examples of api requests, we can share a postman collection on a later day as well

General structure of a request: Do request validations and then call the method
'''

def activateEmail(request, user, to_email):
    mail_subject = "Activate your user account."
    message = render_to_string("activate_account.html", {
        'user':user.name, 
        'domain': 'localhost:5173',
        'uid':urlsafe_base64_encode(force_bytes(user.pk)),
        'token':account_activation_token.make_token(user),
        "protocol": 'https' if request.is_secure() else 'http'

    })
    email = EmailMessage(mail_subject, message, to={to_email})
    if email.send():
        return Response("email sent.")
    else:
        Response("email was not sent due to some error.")

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

    if account_activation_token.check_token(user, token):
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

def email_auth(request):
    # check if user already exists
    # if it does, then don't create a new user object
    if "email" not in request.query_params or "name" not in request.query_params:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    
    email = request.query_params['email']
    name = request.query_params['name']
    user = User.objects.filter(username=email).first()

    if not user:
        user = User()
        user.username = email
        user.name = name
        user.save()

    activateEmail(request, user, to_email=email)
    return HttpResponse("email sent")
    
@api_view(['GET'])
def ping(request):
    return Response("Up and Running: " + str(datetime.now()))


@api_view(['GET'])
def try_bucket(request):
    try:
        return Response(find_buckets())
    except Exception as e:
        return Response({'error': "Internal Server Error: " + str(type(e)) + str(e)}, status=500)


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
    return Response(ret, status=200)


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

@api_view(['POST'])
def upload_profile_picture(request):
    load_dotenv()
    request_body = request.body
    print("Request body:", request.body)
    print("Content-Type header:", request.headers.get('Content-Type'))
    user_id = request.data.get('username')
    print("User ID:", user_id)
    print("Files:", request.FILES)  

    if not user_id or 'profile_picture' not in request.FILES:
        return Response({"error": "Invalid request, missing parameters!"}, status=400)

    try:
        user = User.objects.filter(username=user_id).first()
    except User.DoesNotExist:
        return Response({"error": "User not found!"}, status=404)

    profile_picture = request.FILES['profile_picture']
    s3_client = boto3.client('s3',
                      aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                      aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"))

    try:
        # Create a unique filename (using UUID)
        import uuid
        file_name = f'{user_id}/profile_picture/{uuid.uuid4()}.{profile_picture.name.split(".")[-1]}'

        # Upload the file to S3
        s3_client.upload_fileobj(
            profile_picture,
            settings.AWS_STORAGE_BUCKET_NAME,
            file_name,
            ExtraArgs={'ACL': 'public-read', 'ContentType': profile_picture.content_type}
        )

        # Update the user's profile picture URL
        user.profile_picture = f'https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{file_name}'
        user.save()

        return Response({"message": "Profile picture uploaded successfully!", "profile_picture": user.profile_picture}, status=200)

    except Exception as e:
        print("Error uploading to S3:", e)
        return Response({'error': f"Error uploading to S3: {str(e)}"}, status=500)