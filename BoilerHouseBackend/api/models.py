from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator, MinValueValidator
from datetime import datetime


class User(models.Model):
    username = models.CharField(max_length=255, unique=True)
    is_admin = models.BooleanField(default=False)
    password = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    bio = models.CharField(max_length=2048)
    interests = ArrayField(models.CharField(max_length=255))
    created_profile = models.BooleanField(default=False)
    profile_picture = models.CharField(max_length=2048, default='')
    grad_year = models.IntegerField(
        default=int(datetime.now().year),
        validators=[
            MinValueValidator(2024)
        ]
    )
    major = ArrayField(models.CharField(max_length=255))
    availability = models.JSONField(default=dict)

    '''
    Use the major and interest methods below to access/modify majors and interests
    '''
    # Constructor type method
    @classmethod
    def create(cls, username, password, name, bio, grad_year, is_admin):
        user = cls(username=username, password=password, name=name, bio=bio, grad_year=grad_year, is_admin=is_admin, major=[], interests=[], created_profile=False)
        return user

class Club(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.CharField(max_length=2048)
    culture = models.CharField(max_length=2048, default='')
    time_commitment = models.CharField(max_length=255, default='')
    interests = ArrayField(models.CharField(max_length=255))
    icon = models.CharField(max_length=2048, default='')
    gallery = ArrayField(models.CharField(max_length=2048, default=''))
    is_approved = models.BooleanField(default=False)
    officers = models.ManyToManyField(User, related_name='officer_list')
    members = models.ManyToManyField(User, related_name='member_list')
    pending_members = models.ManyToManyField(User, related_name='pending_list')
    useQuestions = models.BooleanField(default=False)
    questionnaire = models.JSONField(default=dict)
    responses = models.JSONField(default=dict)
    meetings = ArrayField(models.JSONField(default=dict), default = list)
    deletion_votes = models.JSONField(default=dict)
    officerQuestionnaire = models.JSONField(default=dict)
    officerResponses = models.JSONField(default=dict)
    acceptingApplications = models.BooleanField(default=True)
    clubPhoneNumber = models.CharField(max_length=100, default='')
    clubEmail = models.CharField(max_length=100, default='')
    pending_officers = models.ManyToManyField(User, related_name='pending_officer_list')
    targetedAudience = models.CharField(max_length=2048, default='')
    clubDues = models.CharField(max_length=2048, default='')
    dueName = models.CharField(max_length=2048, default='')
    dueDate = models.DateField(null=True, blank=True)
    paid_dues = models.ManyToManyField(User, related_name='clubs_with_paid_dues')



    @classmethod
    def create(cls, name, description, culture, time_commitment, targetedAudience, interests, owner, icon, gallery):
        club = cls(name=name, description=description, culture=culture, time_commitment=time_commitment, targetedAudience=targetedAudience, interests=interests, icon=icon, gallery=gallery, officerQuestionnaire=[{'text': "What's your name?", 'required': True}])
        club.save()
        club.officers.add(owner)
        club.members.add(owner)
        return club

class Rating(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="ratings")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ratings")
    review = models.CharField(max_length=1000, default='')
    rating = models.FloatField(default=2.5)

    @classmethod
    def create(cls, author, club, review, rating):
        rating = cls(author=author, club=club, review=review, rating=rating)
        rating.save()
        return rating



class LoginPair(models.Model):
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)


    @classmethod
    def create(cls, username, password, is_admin):
        pair = cls(username=username, password=password, is_admin=is_admin)
        return pair