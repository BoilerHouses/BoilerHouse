from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime
from .models import User, LoginPair, Club, Rating
from .user_controller import find_user_obj, save_login_pair, generate_token, verify_token, edit_user_obj, resetPasswordEmail, send_club_approved_email, send_email_to_club_members
from .bucket_controller import find_buckets
import json
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
from .tokens import account_activation_token, reset_password_token
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.forms.models import model_to_dict
from dotenv import load_dotenv
from django.conf import settings
import numpy as np
from scipy.linalg import svd
from sklearn import preprocessing
import math
import uuid
import os
import boto3
import cryptocode
from django.utils import timezone
from dateutil import parser




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
        "major":json.loads(user.major),
        "interests":json.loads(user.interests),
        "grad_year":user.grad_year,
    }
    return Response(data, status=200)



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
    data = {"token":token, "profile": user.created_profile, "username":user.username}
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
   user = User.objects.filter(username=request.query_params['username']).first()
   data = {
       "name":user.name,
       "email":user.username,
       "bio":user.bio,
       "major": user.major,
       "interests": user.interests,
       "profile_picture": user.profile_picture,
       "grad_year": user.grad_year,
       "availability": user.availability
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

@api_view(['GET'])
def approve_club(request):
    if 'club_id' not in request.query_params:
        return Response("Missing parameters!", status=400)
    token = request.headers.get('Authorization')
    user = verify_token(token)
    if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
    if not user.is_admin:
        return Response({'error': 'Cannot Access this Resource'}, status=403)
    club = Club.objects.filter(pk=request.query_params['club_id']).first()
    if not club:
        return Response("No such club!", status=404)
    try:
        club.is_approved = True
        #send email to user saying their club was approved
        send_club_approved_email(list(club.officers.all())[0], club.name)
        club.save()
        return Response({'Approved'}, status=200)
    except Exception as ex:
        return Response({"error": str(ex)}, status=500)

@api_view(['GET'])
def verify(request):
    token = request.headers.get('Authorization')
    user = verify_token(token)
    if user:
        return Response({'admin': user.is_admin}, status=200)
    else:
        return Response({'error': 'Invalid Token'}, status=400)

@api_view(['GET'])
def deny_club(request):
    if 'club_id' not in request.query_params:
        return Response("Missing parameters!", status=400)
    token = request.headers.get('Authorization')
    user = verify_token(token)
    if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
    if not user.is_admin:
        return Response({'error': 'Cannot Access this Resource'}, status=403)
    club = Club.objects.filter(pk=request.query_params['club_id']).first()
    if not club:
        return Response("No such club!", status=404)
    try:
        club.delete()
        return Response(status=200)
    except Exception as ex:
        return Response({"error": str(ex)}, status=500)

@api_view(['POST'])
def save_club_information(request):
    token = request.headers.get('Authorization')
    user = verify_token(token)
    if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
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
        name = data.get('name')
        icon = data.get('icon')
        file_name = f'{name}/icon/{uuid.uuid4()}.{icon.name.split(".")[-1]}'
        s3_client.upload_fileobj(
                data.get('icon'),
                settings.AWS_STORAGE_BUCKET_NAME,
                file_name,
                ExtraArgs={'ACL': 'public-read', 'ContentType': data.get('icon').content_type}
        )
        gallery_images = []
        i = 0
        while(data.get(f'gallery[{i}]')):
            gallery_images.append(data.get(f'gallery[{i}]'))
            i+=1
        gallery_image_urls = []
        for image in gallery_images:
            gallery_file_name = f'{name}/gallery/{uuid.uuid4()}_{image.name.split(".")[-1]}'
            s3_client.upload_fileobj(
                image,
                settings.AWS_STORAGE_BUCKET_NAME,
                gallery_file_name,
                ExtraArgs={'ACL': 'public-read', 'ContentType': image.content_type}
            )
            gallery_image_urls.append(f'https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{gallery_file_name}')
        
        
        club = Club.create(name=data.get('name'), 
                           description=data.get('description'),
                           interests=interests, 
                           culture=data.get('culture'),
                           time_commitment=data.get('time_commitment'),
                           targetedAudience=data.get('targetedAudience'),
                           owner=user,
                           icon=f'https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{file_name}',
                           gallery=gallery_image_urls)

        club.save()
        ret_club = model_to_dict(club)
        ret_club['officers'] = [model_to_dict(x) for x in ret_club['officers']]
        ret_club['members'] = [model_to_dict(x) for x in ret_club['members']]
        ret_club['pending_members'] = []
        return Response({'club': ret_club}, status=200)
    except Exception as e:
        print(e)
        return Response("Error: " + str(e), status=500)

@api_view(['GET'])
def get_all_clubs(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
    if 'approved' not in request.query_params:
        return Response({'error': 'Missing Parameters'}, status=400)
    approved = request.query_params['approved']
    if not user.is_admin and approved == 'False':
        return Response({'error': 'Cannot Access this Resource'}, status=403)
    club_list = Club.objects.filter(is_approved=approved)

    scores, users = get_club_recs(user)

    clubs = []
    for x in club_list:
        if (x.officers.count() <= 0):
            continue


        members = x.members.count()
        t = model_to_dict(x)
        t['officers'] = []
        t['members'] = []
        t['pending_members'] = []
        t['pending_officers'] = []
        t['banned_members'] = []
        t['paid_dues'] = []
        t['owner'] = list(x.officers.all())[0].username
        t['k'] = x.pk
        t['num_members'] = members
        t['recommended'] = x.pk in scores and scores[x.pk] >= 0.75
        t['joined'] = user in x.members.all() or user in x.pending_members.all()
        clubs.append(t)


    return Response({'clubs': clubs, 'user_list': users}, 200)

@api_view(['GET'])
def get_example_clubs(request):
    club_list = Club.objects.filter(is_approved=True)
    clubs = []
    for x in club_list:
        t = model_to_dict(x)
        t['officers'] = [model_to_dict(a) for a in x.officers.all()]
        t['owner'] = t['officers'][0]
        t['members'] = [model_to_dict(a) for a in x.members.all()]
        t['pending_members'] = [model_to_dict(a) for a in x.pending_members.all()]
        t['pending_officers'] = []
        t['banned_members'] = []
        t['paid_dues'] = []
        t['k'] = x.pk
        clubs.append(t)
    return Response({'clubs': clubs}, 200)

@api_view(['GET'])
def join_club(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'Invalid Auth Token'}, status=400)
    if 'club_name' not in request.query_params:
        return Response({'error': 'Missing Parameters'}, status=400)
    
    club = Club.objects.filter(name=request.query_params['club_name']).first()
    if (not club.is_approved):
        return Response({'error': 'Club is not Active!'}, status=400)

    if user in club.banned_members.all():
        return Response({'error': 'You are banned from this club and cannot join.'}, status=403)

    if (user not in list(club.members.all()) and user not in list(club.pending_members.all())):
        club.pending_members.add(user)
    club.save()

    ret_club = model_to_dict(club)
    officer_list = []
    for i in ret_club['officers']:
        officer_list.append((i.pk, i.name, i.profile_picture, i.username))
    member_list = []
    for i in ret_club['members']:
        member_list.append((i.pk, i.name, i.profile_picture, i.username))
    pending_list = []
    for i in ret_club['pending_members']:
        pending_list.append((i.pk, i.name, i.profile_picture, i.username))
    ret_club['officers'] = officer_list
    ret_club['members'] = member_list
    ret_club['pending_members'] = pending_list

    return Response({'club': ret_club}, 200)

@api_view(['GET'])
def update_password(request, uidb64, token):
    load_dotenv()
    user = None
    loginPair = None
    if "newPassword" not in request.query_params:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.filter(pk=uid).first()
        loginPair = LoginPair.objects.filter(pk=uid).first()
    except:
        return Response("An error occurred", status=400)
    
    if user is None or loginPair is None:
        return Response("Unable to reset password because requested user does not exist", status=401)
    
    if not reset_password_token.check_token(user, token):
        return Response("invalid reset password link", status=403) 
    
    password = request.query_params['newPassword']
    newPassword = cryptocode.encrypt(password, os.getenv("ENCRYPTION_KEY"))

    user.password = newPassword
    user.save()

    loginPair.password = newPassword
    loginPair.save()

    return Response("password updated", status=200) 


@api_view(['GET'])
def set_availability(request):
    if "email" not in request.query_params or "availability" not in request.query_params:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    
    email = request.query_params['email']
    user = User.objects.filter(username=email).first()

    if not user:
        return Response({"error": "User does not exist"}, status=404)

    availability_json = request.query_params['availability']

    # Try parsing JSON data
    try:
        availability_json = json.loads(availability_json) 
    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON format"}, status=403)
    
    user.availability = availability_json
    user.save()

    return Response(status=200) 


@api_view(['GET'])
def delete_rating(request, rating_id):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'Invalid Auth Token'}, status=400)
    rating = Rating.objects.filter(pk=rating_id).first()
    if not rating:
        return Response({'error': 'Rating not found'}, status=404)
    if user != rating.author:
        return Response({'error': 'You can only delete your own ratings!'}, status=400)
    rating.delete()
    return Response('Success!', status=200)
    

@api_view(['GET'])
def get_club_information(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'Invalid Auth Token'}, status=400)
    inClub = False
    isPending = False
    isOfficer = False
    try:
        club = Club.objects.filter(pk=request.query_params['club_id']).first()
        ret_club = model_to_dict(club)
        major_frequencies = {}
        interest_frequencies = {}
        grad_year_frequencies = {}
        num_members = club.members.count()
        officer_list = []
        for i in ret_club['officers']:
            isOfficer = ((i.username == user.username) or isOfficer)
            officer_list.append((i.pk, i.name, i.profile_picture, i.username))
        member_list = []
        for i in ret_club['members']:
            inClub = ((i.username == user.username) or inClub)
            member_list.append((i.pk, i.name, i.profile_picture, i.username, i.interests, i.grad_year, i.major, i in list(club.pending_officers.all())))
            for major in i.major:
                major_frequencies[major] = 1 + major_frequencies.get(major, 0)

            for interest in i.interests:
                interest_frequencies[interest] = 1 + interest_frequencies.get(interest, 0)

            grad_year_frequencies[i.grad_year] = 1 + grad_year_frequencies.get(i.grad_year, 0)
        pending_list = []
        for i in ret_club['pending_members']:
            isPending = ((i.username == user.username) or isPending)
            submittedForm = False
            if i.username in club.responses:
                submittedForm = True
            pending_list.append((i.pk, i.name, i.profile_picture, i.username, submittedForm))
        rating_list = []

        for i in club.ratings.all():
            rating_list.append({'id': i.pk, 'review': i.review, 'rating': i.rating, 'author': i.author.username, 'portrait': i.author.profile_picture})
        ret_club['officers'] = officer_list
        ret_club['members'] = member_list
        ret_club['pending_members'] = pending_list
        ret_club['pending_officers'] = []
        ret_club['banned_members'] = []
        ret_club['paid_dues'] = []
        ret_club['ratings'] = rating_list
        rating, reccomended_users = get_rec_for_club(user, club.pk)
        ret_club['rating'] = rating
        deleted = user.username in club.deletion_votes
        if user.username in club.deletion_votes:
            deleted = deleted and club.deletion_votes[user.username]
        officer_names = [a.username for a in list(club.officers.all())]
        voted_count = 0
        for a in club.deletion_votes:
            if a in officer_names and club.deletion_votes[a]:
                voted_count += 1

        max_majors = 5 if len(major_frequencies) >= 5 else len(major_frequencies)
        max_interests = 5 if len(interest_frequencies) >=5 else len(interest_frequencies)
        max_grad_years = 5 if len(grad_year_frequencies) >=5 else len(grad_year_frequencies)

        most_common_majors = []
        most_common_interests = []
        most_common_grad_years = []

        if max_majors > 0:
            most_common_majors = sorted(list(major_frequencies.items()), key = lambda x: x[1], reverse=True)[:max_majors]

        if max_interests > 0:
            most_common_interests = sorted(list(interest_frequencies.items()), key = lambda x: x[1], reverse=True)[:max_interests]

        if max_grad_years > 0:
            most_common_grad_years = sorted(list(grad_year_frequencies.items()), key = lambda x: x[1], reverse=True)[:max_grad_years]

        major_pairs = []
        interest_pairs = []
        grad_year_pairs = []

        for major, freq in most_common_majors:
            major_pairs.append((major, round((freq/num_members) * 100, 2)))

        for interest, freq in most_common_interests:
            interest_pairs.append((interest, round((freq/num_members) * 100, 2)))

        for year, freq in most_common_grad_years:
            grad_year_pairs.append((year, round((freq/num_members) * 100, 2)))

        return Response({'club': ret_club, "joined": (inClub or isPending), "officer": isOfficer, "deleted": deleted, "deleted_count": voted_count, "officer_count": len(officer_names), "common_majors": major_pairs, 'common_interests': interest_pairs, 'common_grad_years': grad_year_pairs, "pending": isPending, "user_list": reccomended_users}, status=200)
    except Club.DoesNotExist:
        return Response({"error": "Club not found"}, status=404)

@api_view(['POST'])
def set_questions(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
    data = {}
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON Document"}, status=422)
    if 'club' not in data or 'useQuestions' not in data or 'questions' not in data:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    club = Club.objects.filter(pk=data['club']).first()
    if not club:
        return Response({"error": "Club does not exist"}, status=404)
    club.useQuestions = data['useQuestions']
    club.questionnaire = data['questions']
    club.save()
    return Response({'questions': club.questionnaire}, status=200)

@api_view(['POST'])
def set_officer_questions(request, club_id):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
    data = {}
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON Document"}, status=422)
    if 'questions' not in data:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    club = Club.objects.filter(pk=club_id).first()
    if not club:
        return Response({"error": "Club does not exist"}, status=404)
    club.officerQuestionnaire = data['questions']
    club.save()
    return Response({'questions': club.officerQuestionnaire}, status=200)

@api_view(['GET'])
def get_officer_questions(request, club_id):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
    club = Club.objects.filter(pk=club_id).first()
    if not club:
        return Response({"error": "Club does not exist"}, status=404)
    return Response({'questions': club.officerQuestionnaire}, status=200)

@api_view(['GET'])
def get_questions(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
    if 'club' not in request.query_params:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    club = Club.objects.filter(pk=request.query_params['club']).first()
    if not club:
        return Response({"error": "Club does not exist"}, status=404)
    return Response({'questions': club.questionnaire, 'on': club.useQuestions}, status=200)


@api_view(['POST'])
def set_answers(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
    data = {}
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON Document"}, status=422)
    if 'club' not in data or 'response' not in data:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    club = Club.objects.filter(pk=data['club']).first()
    if not club:
        return Response({"error": "Club does not exist"}, status=404)
    if (user not in list(club.members.all()) and user not in list(club.pending_members.all())):
        club.pending_members.add(user)
        club.responses[user.username] = data['response']
    club.save()
    return Response('Sucess!', status=200)


@api_view(['POST'])
def set_officer_answers(request, club_id):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
    data = {}
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON Document"}, status=422)
    if 'response' not in data:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    club = Club.objects.filter(pk=club_id).first()
    if not club:
        return Response({"error": "Club does not exist"}, status=404)
    if (user not in list(club.officers.all()) and user in list(club.members.all())):
        club.pending_officers.add(user)
        club.officerResponses[user.username] = data['response']
    club.save()
    return Response('Sucess!', status=200)

@api_view(['GET'])
def get_officer_answers(request, club_id, username):
    club = Club.objects.filter(pk=club_id).first()
    if not club:
        return Response({"error": "Club does not exist"}, status=404)
    if username in club.officerResponses:
        return Response(club.officerResponses[username] , status=200)
    else:
        return Response([], status=200)

@api_view(['GET'])
def get_answers(request):
    if 'club' not in request.query_params or 'username' not in request.query_params:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    username = request.query_params['username']
    club = Club.objects.filter(pk=request.query_params['club']).first()
    if not club:
        return Response({"error": "Club does not exist"}, status=404)
    if username in club.responses:
        return Response(club.responses[username] , status=200)
    else:
        return Response([], status=200)

@api_view(['GET'])
def set_deletion(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
    if 'club' not in request.query_params:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    club = Club.objects.filter(pk=request.query_params['club']).first()
    if not club:
        return Response({"error": "Club does not exist"}, status=404)
    if (user not in list(club.officers.all())):
        return Response({"error": "Invalid Request, Missing Permissions!"}, status=403)
    if user.username not in club.deletion_votes:
        club.deletion_votes[user.username] = True
    else:
        club.deletion_votes[user.username] = not club.deletion_votes[user.username]
    club.save()
    to_del = True
    for i in list(club.officers.all()):
        to_del = to_del and i.username in club.deletion_votes
        if i.username in club.deletion_votes:
            to_del = to_del and club.deletion_votes[i.username]
    if to_del:
        club.delete()
        return Response({'deleted': True}, status=200)
    else:
        voted_count = 0
        officer_names = [a.username for a in list(club.officers.all())]
        for a in club.deletion_votes:
            if a in officer_names and club.deletion_votes[a]:
                voted_count += 1
        return Response({'deleted': False, 'vote': club.deletion_votes[user.username], "deleted_count": voted_count, "officer_count": len(officer_names)}, status=200)


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
def modify_user_to_club(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
    if 'club' not in request.query_params or 'user' not in request.query_params:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    club = Club.objects.filter(pk=request.query_params['club']).first()
    if user.username not in [x.username for x in list(club.officers.all())]:
        return Response({"error": "Invalid Permissions, cannot access club!"}, status=403)
    if not club or request.query_params['user'] not in [x.username for x in list(club.pending_members.all())]:
        return Response({"error": "User or Club does not exist"}, status=404)
    member = User.objects.filter(username=request.query_params['user']).first()
    if ('approved' in request.query_params):
        if (request.query_params['approved'] == 'Y'):
            #send email to member notifying that they are now in the club
            subject = f"Update on your application to {club.name}"
            content = f"You application to join {club.name} has been approved!"
            try:
                email = EmailMessage(subject, content, to={member.username})
                email.send()
            except Exception as e:
                print(e)
                return Response("error", 400)
            club.members.add(member)
        else:
            subject = f"Update on your application to {club.name}"
            content = f"You application to join {club.name} has been denied."
            try:
                email = EmailMessage(subject, content, to={member.username})
                email.send()
            except Exception as e:
                print(e)
                return Response("error", 400)
    club.pending_members.remove(member)
    club.responses.pop(member.username, None)
    club.save()
    return Response("Success!", 200)


@api_view(['GET'])
def modify_user_to_officer(request, club_id):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
       return Response({'error': 'Invalid Auth Token'}, status=400)
    if 'username' not in request.query_params:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)
    club = Club.objects.filter(pk=club_id).first()
    if user.username not in [x.username for x in list(club.officers.all())]:
        return Response({"error": "Invalid Permissions, cannot access club!"}, status=403)
    username = request.query_params['username']
    if not club or username not in [x.username for x in list(club.pending_officers.all())]:
        return Response({"error": "User or Club does not exist"}, status=404)
    member = User.objects.filter(username=username).first()
    club.pending_officers.remove(member)
    club.officerResponses.pop(member.username, None)
    if ('approved' in request.query_params and request.query_params['approved'] == 'Y'):
        club.officers.add(member)
    club.save()
    return Response("Sucess!", 200)


@api_view(['GET'])
def delete_user(request):
   user = verify_token(request.headers.get('Authorization'))
   if not user.is_admin:
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

@api_view(['GET'])
# gets meeting clubs based on the club id
def get_meeting_times(request):
    if "clubId" not in request.query_params:
       return Response({'error': 'missing clubId parameter'}, status=400)
    
    club = Club.objects.filter(pk=request.query_params['clubId']).first()

    if not club:
        return Response({'error': 'no club found with the associated clubId'}, status=400)

    meetings = club.meetings
    return Response(meetings, status=200)


@api_view(['GET'])
# gets meeting clubs based on the club id
def set_meeting_times(request):
    if "clubId" not in request.query_params or "meetings" not in request.query_params or "sendEmail" not in request.query_params or "relevant_meetings" not in request.query_params or "action" not in request.query_params:
       return Response({'error': 'missing  parameters'}, status=400)
    
    club = Club.objects.filter(pk=request.query_params['clubId']).first()

    if not club:
        return Response({'error': 'no club found with the associated clubId'}, status=400)
    
    meetings_data = json.loads(request.query_params["meetings"])
    relevant_meetings  = json.loads(request.query_params["relevant_meetings"])
    club.meetings = meetings_data
    club.save()

    # send emails to club members about new meeting that was created
    if request.query_params['sendEmail'] == 'true':
        subject = ""
        if request.query_params['action'] == 'deleted':
            subject = f"Meeting Canceled For {club.name}"
        elif request.query_params['action'] == 'created':
            subject = f"Meeting Created For {club.name}"
        elif request.query_params['action'] == 'updated':
            subject = f"Meeting Updated For {club.name}"

        meeting_name = relevant_meetings[0]['meetingName']
        meeting_location = relevant_meetings[0]['meetingLocation']
        meeting_agenda = relevant_meetings[0]['meetingAgenda']
        dates = [relevant_meetings[i]['date'] for i in range(len(relevant_meetings))]
        startTime = relevant_meetings[0]['startTime']
        endTime = relevant_meetings[0]['endTime']
        content = f"""
        Meeting Name: {meeting_name} \n
        Meeting Location: {meeting_location} \n
        Meeting Agenda: {meeting_agenda} \n
        Meeting Dates: {','.join(dates)} \n
        Meeting Start Time: {startTime} \n
        Meeting End Time: {endTime} \n
        """

        # send email to all club members
        if send_email_to_club_members(subject, content, club):

            return Response("success", status=200)
        else:
            return Response("error", status=400)
    return Response("success", status=200)


@api_view(['PUT'])
def update_club_info(request):
    #Updates club culture and time commitment so far
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'Invalid Auth Token'}, status=400)

    try:
        club = Club.objects.get(pk=request.data.get('club_id'))
    except Club.DoesNotExist:
        return Response({"error": "Club not found"}, status=404)

    if user not in club.officers.all():
        return Response({"error": "Invalid Permissions, cannot modify club!"}, status=403)

    try:
        if request.data.get('culture'):
            club.culture = request.data.get('culture')
        if request.data.get('time_commitment'):
            club.time_commitment = request.data.get('time_commitment')
        if request.data.get('targetedAudience'):
            club.targetedAudience = request.data.get('targetedAudience')
        club.save()
        return Response({"message": "Club information updated successfully"}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def set_accepting_applications(request, club_id):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'Invalid Auth Token'}, status=400)
    if 'accept' not in request.query_params:
       return Response({'error': 'missing  parameters'}, status=400)
    try:
        club = Club.objects.get(pk=club_id)
        # Check if the user is an officer of the club
        if user not in club.officers.all():
            return Response({"error": "You don't have permission to edit this club"}, status=403)
        print(request.query_params.get('accept'))
        print(type(request.query_params.get('accept')))
        club.acceptingApplications = (request.query_params.get('accept') != 'true')
        club.save()
        return Response({'accepting': club.acceptingApplications}, status=200)
    except Club.DoesNotExist:
        return Response({"error": "Club not found"}, status=404)
    except Exception as e:
        return Response("error", status=500)

@api_view(['GET'])
def get_club_details_for_edit(request, club_id):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'Invalid Auth Token'}, status=400)

    try:
        club = Club.objects.get(pk=club_id)
        
        # Check if the user is an officer of the club
        if user not in club.officers.all():
            return Response({"error": "You don't have permission to edit this club"}, status=403)

        club_data = {
            "name": club.name,
            "culture": club.culture,
            "time_commitment": club.time_commitment,
            "clubDues": club.clubDues,
            "dueName": club.dueName,
            "dueDate": club.dueDate,
            # Add any other fields you want to make editable
        }
        
        return Response(club_data, status=200)
    except Club.DoesNotExist:
        return Response({"error": "Club not found"}, status=404)
    
@api_view(['GET'])
def get_clubs_for_officer(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'invalid token'}, status=400)
    clubs = user.officer_list.all().values_list('name', flat=True)

    if len(clubs) == 0:
        return Response({'error': 'user is not a club officer'}, status = 400)
    return Response(clubs, status=200)

@api_view(['GET'])
def  send_email_to_members(request):
    user = verify_token(request.headers.get('Authorization'))
    if user is None or user == 'Invalid token':
        return Response({'error': 'invalid token'}, status=400)
    if "club_name" not in request.query_params:
        return Response({'error': 'club_name not included'}, status=400)
    if "subject" not in request.query_params:
        return Response({'error':'subject not included'}, status = 400)
    if "content" not in request.query_params:
        return Response({'error': 'content not included'}, status=400)
    club_name = request.query_params['club_name']
    subject = request.query_params['subject']
    content = request.query_params['content']
    club = Club.objects.filter(name=club_name).first()
    if send_email_to_club_members(subject, content, club):
        return Response("success", status=200)
    else:
        return Response("error", status=400)

@api_view(['GET'])
def leave_club(request):
    user = verify_token(request.headers.get('Authorization'))
    if user is None or user == 'Invalid token':
        return Response({'error': 'invalid token'}, status=400)
    if "club_name" not in request.query_params:
        return Response({'error': 'club_name not included'}, status=400)
    club_name = request.query_params['club_name']
    club = Club.objects.filter(name=club_name).first()
    if user in club.officers.all():
        club.deletion_votes = {}
        club.officers.remove(user)
    if user in club.members.all():
        club.members.remove(user)
    if user in club.pending_members.all():
        club.pending_members.remove(user)
    club.save()
    return Response("success", status = 200)


@api_view(['GET'])
def find_similar_users(request):
    user = verify_token(request.headers.get('Authorization'))
    if user is None or user == 'Invalid token':
        return Response({'error': 'invalid token'}, status=400)
    user_list = [x for x in User.objects.all() if x.pk != user.pk]
    word_dict = {}
    for x in user_list:
        for i in x.interests:
            word_dict[i] = True
    for i in user.interests:
        word_dict[i] = True
    document_list = []
    for x in user_list:
        vector = []
        for word in word_dict.keys():
            vector.append(x.interests.count(word))
        document_list.append(vector)
    document_list = np.transpose(np.array(document_list))
    qT = []
    for word in word_dict.keys():
        qT.append(user.interests.count(word))
    U, S, V = svd(document_list, full_matrices= False)
    k = 35
    U_k = U[:,:k]
    S_inv = []
    VT_k = np.transpose(V)[:, :k]
    for i in range(0, k):
        t = [0] * k
        t[i] = 1/ S[i]
        S_inv.append(t)
    temp = np.matmul(qT, U_k)
    new_q = np.matmul(temp, S_inv)
    cosine_list = []
    user_dict = {}
    for d in VT_k:
        t = np.dot(new_q, d) / (np.linalg.norm(new_q) * np.linalg.norm(d))
        cosine_list.append(-1 if np.isnan(t) else t)
    for i in range(0, len(cosine_list)):
        user_dict[user_list[i].username] = cosine_list[i]
    return Response({"user_list": user_dict }, status=200)



@api_view(['POST'])
def create_rating(request, club_id):
    user = verify_token(request.headers.get('Authorization'))
    if user is None or user == 'Invalid token':
        return Response({'error': 'invalid token'}, status=400)
    data = {}
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return Response({"error": "Invalid JSON Document"}, status=422)
    if 'rating' not in data or 'review' not in data:
        return Response({"error": "Invalid Request, Missing Parameters!"}, status=400)

    club = Club.objects.filter(pk=club_id).first()
    if not club:
        return Response({'error': 'club not found!'}, status=404)
    if user not in club.members.all():
        return Response({'error': 'Only users in the can leave ratings!'}, status=403)
    try:
        if 'id' in data:
            rating = Rating.objects.filter(pk=data['id']).first()
            if not rating:
               return Response({'error': 'Rating not found!'}, status=404) 
            rating.rating = data['rating']
            rating.review = data['review']
            rating.save()
            return Response(status=200)
        else:
            Rating.create(author=user, club=club, rating=data['rating'], review=data['review'])
            return Response(status=200)
    except Exception as e:
        print(e)
        return Response({"error": str(e)}, status=500)


@api_view(['PUT'])
def update_contact_info(request, club_id):
    #Updates default club contact info
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'Invalid Auth Token'}, status=400)
    try:
        club = Club.objects.get(pk=request.data.get('club_id'))
    except Club.DoesNotExist:
        return Response({"error": "Club not found"}, status=404)
    if user not in club.officers.all():
        return Response({"error": "Invalid Permissions, cannot modify club!"}, status=403)
    try:
        if request.data.get('clubPhoneNumber'):
            club.clubPhoneNumber = request.data.get('clubPhoneNumber')
        if request.data.get('clubEmail'):
            club.clubEmail = request.data.get('clubEmail')
        club.save()
        return Response({"message": "Club information updated successfully"}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['PUT'])
def update_club_dues(request, club_id):
    #Updates default club contact info
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'Invalid Auth Token'}, status=400)
    try:
        club = Club.objects.get(pk=request.data.get('club_id'))
    except Club.DoesNotExist:
        return Response({"error": "Club not found"}, status=404)
    if user not in club.officers.all():
        return Response({"error": "Invalid Permissions, cannot modify club!"}, status=403)
    try:
        club.clubDues = '' if request.data.get('clubDues') == 0 else request.data.get('clubDues')
        print(club.clubDues)
        club.dueName = request.data.get('dueName')
        club.dueDate = request.data.get('dueDate')
        subject = f"Update to club dues for {club.name} "
        content = f"Club Name: {club.name}\n Amount: {club.clubDues}\n Due Date: {club.dueDate}\n Description: {club.dueName}"
        if not send_email_to_club_members(subject, content, club):
            return Response({"error"}, status=500)
        club.save()
        return Response({"message": "Club information updated successfully"}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def update_paid_dues(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'Invalid Auth Token'}, status=400)
    if "club_id" not in request.query_params:
        return Response({"error": "Missing club id"}, status=400)
    if "email" not in request.query_params:
        return Response({"error": "Missing user email"}, status=400)
    if "did_pay" not in request.query_params:
        return Response({"error": "Missing did pay"}, status=400)
    club = Club.objects.filter(pk=request.query_params.get('club_id')).first()
    did_pay = request.query_params.get('did_pay')
    if user not in club.officers.all():
        return Response({"error": "Invalid Permissions, cannot modify club!"}, status=400)
    target_user = User.objects.filter(username=request.query_params.get('email')).first()
    if did_pay == "true":
        club.paid_dues.add(target_user)
    else:
        club.paid_dues.remove(target_user)
    club.save()
    return Response("success", status=200)



@api_view(['POST'])
def kick_member(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'Invalid Auth Token'}, status=400)

    club_id = request.data.get('club_id')
    member_username = request.data.get('member_username')

    club = Club.objects.filter(pk=club_id).first()
    if not club:
        return Response({"error": "Club not found"}, status=404)

    if user not in club.officers.all():
        return Response({"error": "Permission denied"}, status=403)

    member = User.objects.filter(username=member_username).first()
    if not member or member not in club.members.all():
        return Response({"error": "User not found in club members"}, status=404)

    if user.username == member_username:
        return Response({"error": "You cannot kick yourself from the club"}, status=400)
    club.members.remove(member)
    if member in list(club.officers.all()):
        club.officers.remove(member)
    club.save()

    return Response({"message": f"{member_username} has been kicked from the club"}, status=200)

@api_view(['POST'])
def ban_member(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'Invalid Auth Token'}, status=400)

    club_id = request.data.get('club_id')
    member_username = request.data.get('member_username')

    club = Club.objects.filter(pk=club_id).first()
    if not club:
        return Response({"error": "Club not found"}, status=404)

    if user not in club.officers.all():
        return Response({"error": "Permission denied"}, status=403)

    member = User.objects.filter(username=member_username).first()
    if not member or member not in club.members.all():
        return Response({"error": "User not found in club members"}, status=404)

    if user.username == member_username:
        return Response({"error": "You cannot ban yourself from the club"}, status=400)


    club.members.remove(member)
    if member in list(club.officers.all()):
        club.officers.remove(member)

    club.banned_members.add(member)
    club.save()

    return Response({"message": f"{member_username} has been kicked from the club"}, status=200)


@api_view(['GET'])
def get_recommendations(request):
    user = verify_token(request.headers.get('Authorization'))
    if user is None or user == 'Invalid token':
        return Response({'error': 'invalid token'}, status=400)
    club_recs, user_recs = get_club_recs(user)
    return Response({"club_list": club_recs }, status=200)


@api_view(['GET'])
def get_dues_information(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'Invalid Auth Token'}, status=400)

    club_id = request.query_params.get('club_id')
    club = Club.objects.filter(pk=club_id).first()
    member_list = []
    for member in club.members.all():
        name = member.name
        email = member.username
        did_pay = False
        if member in club.paid_dues.all():
            did_pay = True
        member_list.append({'name': name, 'email':email, 'did_pay':did_pay})
    return Response({"dues_information":member_list}, status= 200)

@api_view(['GET'])
def get_upcoming_meetings(request):
    user = verify_token(request.headers.get('Authorization'))
    if user == 'Invalid token':
        return Response({'error': 'Invalid Auth Token'}, status=400)
    user_clubs = Club.objects.filter(members=user)

    upcoming_meetings = []

    for club in user_clubs:
        for meeting in club.meetings:
            try:
                meeting_date = parser.parse(meeting['date'])
                if meeting_date.tzinfo is None:
                    meeting_date = timezone.make_aware(meeting_date)

                if meeting_date >= timezone.now():
                    upcoming_meetings.append({
                    'id': meeting.get('id', ''),
                    'club_name': club.name,
                    'name' : meeting.get('meetingName',''),
                    'date': meeting['date'],
                    'startTime': meeting.get('startTime', ''),
                    'endTime': meeting.get('endTime', ''),
                    'location': meeting.get('meetingLocation', ''),
                    'description': meeting.get('meetingAgenda', '')
                })
            except ValueError:
                continue

        # Sort meetings by date
    upcoming_meetings.sort(key=lambda x: (parser.parse(x['date']), x['startTime']))

        # Limit to 10 upcoming meetings
    upcoming_meetings = upcoming_meetings[:10]

    return Response(upcoming_meetings, status=200)


def get_club_recs(user):
    user_list = [x for x in User.objects.all() if x.pk != user.pk]
    word_dict = {}
    for x in user_list:
        for i in x.interests:
            word_dict[i] = True
    for i in user.interests:  
        word_dict[i] = True
    document_list = []
    for x in user_list:
        vector = []
        for word in word_dict.keys():
            vector.append(x.interests.count(word))
        document_list.append(vector)
    document_list = np.transpose(np.array(document_list))
    qT = []
    for word in word_dict.keys():
        qT.append(user.interests.count(word))
    U, S, V = svd(document_list, full_matrices= False)
    k = 35
    U_k = U[:,:k]
    S_inv = []
    VT_k = np.transpose(V)[:, :k]
    for i in range(0, k):
        t = [0] * k
        t[i] = 1/ S[i]
        S_inv.append(t)
    temp = np.matmul(qT, U_k)
    new_q = np.matmul(temp, S_inv)
    cosine_list = []
    for d in VT_k:
        t = np.dot(new_q, d) / (np.linalg.norm(new_q) * np.linalg.norm(d))
        cosine_list.append(-1 if np.isnan(t) else t)
    user_scores = []
    user_dict = {}
    for i in range(0, len(cosine_list)):
        user_scores.append((user_list[i], cosine_list[i]))
        user_dict[user_list[i].username] = cosine_list[i]
    user_scores = sorted(user_scores, key=lambda x: x[1], reverse=True)
    user_scores = user_scores[:20]
    user_vectors = []
    for i in range(len(user_scores)):
        user_vectors.append([0] * len(Club.objects.all()))
    count = 0
    total_members = 0
    club_list = []
    for club in Club.objects.all():
        club_list.append(club.pk)
        total_members += len(club.members.all())
        for i in range(len(user_scores)):
            if user_scores[i][0] in club.members.all():
                user_vectors[i][count] = 1
        count+=1
    for i in range(len(user_vectors)):
        vector = user_vectors[i]
        avg_rating = np.mean(vector)
        user_vectors[i] = [x - avg_rating for x in vector]
    user_vectors = np.array(user_vectors)
    club_vectors = np.transpose(user_vectors)
    club_weighted_ratings = []
    for club in club_vectors:
        total_similarity = 0
        total_rating = 0
        for j in range(len(club)):
            total_similarity += user_scores[j][1]
            total_rating += user_scores[j][1] * club[j]
        club_weighted_ratings.append(total_rating / total_similarity)
    global_average = total_members / len(User.objects.all())
    club_final_ratings = [x + global_average for x in club_weighted_ratings]
    final_score = {}
    for i in range(len(club_list)):
        final_score[club_list[i]] = club_final_ratings[i]
    return final_score, user_dict

def get_rec_for_club(user, club_id):
    user_list = [x for x in User.objects.all() if x.pk != user.pk]
    word_dict = {}
    for x in user_list:
        for i in x.interests:
            word_dict[i] = True
    for i in user.interests:   
        word_dict[i] = True
    document_list = []
    for x in user_list:
        vector = []
        for word in word_dict.keys():
            vector.append(x.interests.count(word))
        document_list.append(vector)
    document_list = np.transpose(np.array(document_list))
    qT = []
    for word in word_dict.keys():
        qT.append(user.interests.count(word))
    U, S, V = svd(document_list, full_matrices= False)
    k = 35
    U_k = U[:,:k]
    S_inv = []
    VT_k = np.transpose(V)[:, :k]
    for i in range(0, k):
        t = [0] * k
        t[i] = 1/ S[i]
        S_inv.append(t)
    temp = np.matmul(qT, U_k)
    new_q = np.matmul(temp, S_inv)
    cosine_list = []
    for d in VT_k:
        t = np.dot(new_q, d) / (np.linalg.norm(new_q) * np.linalg.norm(d))
        cosine_list.append(-1 if np.isnan(t) else t)
    user_scores = []
    user_dict = {}
    for i in range(0, len(cosine_list)):
        user_scores.append((user_list[i], cosine_list[i]))
        user_dict[user_list[i].username] = cosine_list[i]
    user_scores = sorted(user_scores, key=lambda x: x[1], reverse=True)
    user_scores = user_scores[:20]
    user_vectors = []
    for i in range(len(user_scores)):
        user_vectors.append([0] * len(Club.objects.all()))
    count = 0
    total_members = 0
    club_list = []
    for club in Club.objects.all():
        club_list.append(club.pk)
        total_members += len(club.members.all())
        for i in range(len(user_scores)):
            if user_scores[i][0] in club.members.all():
                user_vectors[i][count] = 1
        count+=1
    for i in range(len(user_vectors)):
        vector = user_vectors[i]
        avg_rating = np.mean(vector)
        user_vectors[i] = [x - avg_rating for x in vector]
    user_vectors = np.array(user_vectors)
    club_vectors = np.transpose(user_vectors)
    club_weighted_rating = 0
    selected_vector = club_vectors[club_list.index(club_id)]
    total_similarity = 0
    total_rating = 0
    for j in range(len(selected_vector)):
        total_similarity += user_scores[j][1]
        total_rating += user_scores[j][1] * selected_vector[j]
    club_weighted_rating = total_rating / total_similarity
    global_average = total_members / len(User.objects.all())
    club_final_rating = global_average + club_weighted_rating
    return club_final_rating, user_dict