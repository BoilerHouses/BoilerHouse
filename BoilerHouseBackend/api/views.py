from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime
from .models import User, LoginPair, Club
from .user_controller import find_user_obj, save_login_pair, generate_token, verify_token, edit_user_obj, resetPasswordEmail
from .bucket_controller import find_buckets
import json
from .tokens import account_activation_token, reset_password_token
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.forms.models import model_to_dict
from dotenv import load_dotenv
from django.conf import settings
import uuid
import os
import boto3


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

    if account_activation_token.check_token(user, token):
        user.is_active = True
        profile = User.create(username=user.username,
                           password=user.password,
                           name='', bio='', grad_year=-1, is_admin=user.is_admin)
        profile.save()
    else:
        user.delete()
        return Response("unable to activate user", status=400) 
    return Response({"message": "Activated Account", "profile": model_to_dict(profile)}, status = 200)

    
@api_view(['GET'])
def ping(request):
    return Response("Up and Running: " + str(datetime.now()))

@api_view(['GET'])
def get_user_profile(request):
   token = request.headers.get('Authorization')
   user = verify_token(token)
   if user == "Invalid token":
       return Response({'error':"Auth token invalid"}, status = 500)
   data = {
       "name":user.name,
       "email":user.username,
       "bio":user.bio,
       "major": user.major,
       "interests": user.interests,
       "grad_year": user.grad_year,
   }
   return Response(data, status=200)

@api_view(['GET'])
def try_bucket(request):
    try:
        return Response(find_buckets())
    except Exception as e:
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
    data = {"token":token, "profile": user.created_profile}
    return Response(data, status=200)





@api_view(['POST'])
def edit_account(request):
    user = verify_token(request.headers.get('Authorization'))

    ret = edit_user_obj(user, request.data)
    if 'error' in ret:
        return Response({'error': ret['error']}, status=ret['status'])
    return Response(ret, status=200)


@api_view(['GET']) 
def forgot_password(request):
    if "email" not in request.query_params:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    
    email = request.query_params["email"]
    user = User.objects.filter(username=email).first()

    if not user:
        return Response({"error": "That email is not associated with an account"}, status=401)

    resetPasswordEmail(request, user, to_email=email)
    return Response({"message": "Email sent successfully!"}, status=200)

@api_view(['GET'])
def get_user_profile(request):
   token = request.headers.get('Authorization')
   user = verify_token(token)
   if user == "Invalid token":
       return Response({'error':"Auth token invalid"}, status = 500)
   data = {
       "name":user.name,
       "email":user.username,
       "bio":user.bio,
       "major": user.major,
       "interests": user.interests,
       "profile_picture": user.profile_picture,
       "grad_year": user.grad_year,
   }
   return Response(data, status=200)

@api_view(['GET'])
def activate_forgot_password(request, uidb64, token):
    user = None

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.filter(pk=uid).first()
    except:
        return Response("An error occurred", status=400)
    
    if user is None:
        return Response("Unable to reset password because requested user does not exist", status=401)
    
    if not reset_password_token.check_token(user, token):
        return Response("invalid reset password link", status=402) 

    return Response("verified password reset link", status=200) 

@api_view(['POST'])
def save_club_information(request):
    token = request.headers.get('Authorization')
    user = verify_token(token)
    if 'name' not in request.data or 'icon' not in request.data or 'description' not in request.data:
        return Response("Missing parameters!", status=400)
    data = request.data
    if(Club.objects.filter(name=data.get('name')).exists()):
        return Response("Club with that name already exists!", status=409)
    load_dotenv()
    club = None
    try:
        interests = []
        i = 0
        while(data.get(f'interest[{i}]')):
            interests.append(data.get(f'interest[{i}]'))
            i+=1
        s3_client = boto3.client('s3',
                        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"))
        file_name = f'{data.get('name')}/icon/{uuid.uuid4()}.{data.get('icon').name.split(".")[-1]}'
        s3_client.upload_fileobj(
                data.get('icon'),
                settings.AWS_STORAGE_BUCKET_NAME,
                file_name,
                ExtraArgs={'ACL': 'public-read', 'ContentType': data.get('icon').content_type}
        )
        club = Club.create(name=data.get('name'), 
                           description=data.get('description'), 
                           interests=interests, 
                           icon=f'https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{file_name}', 
                           officers=[user.pk], members=[user.pk])
        club.save()
        return Response({'club': model_to_dict(club)}, status=200)
    except Exception as e:
        return Response("Error: " + str(e), status=500)
    
@api_view(['GET'])
def get_all_users(request):
   user = verify_token(request.headers.get('Authorization'))
   if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
   if not user.is_admin:
       return Response({'error': 'User is not an admin'}, status=400)
   #get all users
   all_users = User.objects.values('name', 'username')
   return Response(all_users, status=200)




@api_view(['GET'])
def delete_user(request):
   print(request.data)
   user = verify_token(request.headers.get('Authorization'))
   if not user.is_admin:
       print("here1")
       return Response({'error': 'User is not an admin'}, status=400)


   if "username" not in request.query_params:
       return Response({'error': 'username of user not included'}, status=400)
   #delete user in database
   user = User.objects.filter(username=request.query_params['username']).first()
   pair = LoginPair.objects.filter(username = request.query_params['username']).first()
   if user:
       user.delete()
   if pair:
       pair.delete()
   return Response("success", status=200)
