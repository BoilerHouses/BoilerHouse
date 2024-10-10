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
    interests = ArrayField(models.CharField(max_length=255))
    icon = models.CharField(max_length=2048, default='')
    gallery = ArrayField(models.CharField(max_length=2048, default=''))
    is_approved = models.BooleanField(default=False)
    officers = ArrayField(models.IntegerField())
    members = ArrayField(models.IntegerField())
    @classmethod
    def create(cls, name, description, interests, officers, members, icon):
        club = cls(name=name, description=description, interests=interests, officers=officers, members=members, icon=icon, gallery=[])
        return club



class LoginPair(models.Model):
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)


    @classmethod
    def create(cls, username, password, is_admin):
        pair = cls(username=username, password=password, is_admin=is_admin)
        return pair
