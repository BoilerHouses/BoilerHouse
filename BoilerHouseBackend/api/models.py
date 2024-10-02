from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from datetime import datetime
import json


class User(models.Model):
    username = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    password = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    bio = models.CharField(max_length=2048)
    interests = models.CharField(max_length=2048)
    grad_year = models.IntegerField(
        default=int(datetime.now().year),
        validators=[
            MinValueValidator(2024)
        ]
    )
    major = models.CharField(max_length=2048)

    '''
    Use the major and interest methods below to access/modify majors and interests
    '''

    # Constructor type method
    @classmethod
    def create(cls, username, password, name, bio, interests, grad_year, major):
        user = cls(username=username, password=password, name=name, bio=bio, grad_year=grad_year)
        if interests:
            user.set_interests(interests)
        else:
            user.set_interests([])
        user.set_major(major)
        # do something with the book
        return user

    def get_majors(self):
        return json.loads(self.major)

    def add_major(self, major):
        self.major = json.dumps(json.loads(self.major).append(major))

    def set_major(self, majors):
        self.major = json.dumps(majors)

    def get_interests(self):
        return json.loads(self.interests)

    def add_interest(self, interest):
        self.interests = json.dumps(json.loads(self.interests).append(interest))

    def set_interests(self, interest):
        self.interests = json.dumps(interest)


class LoginPair(models.Model):
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)

    @classmethod
    def create(cls, username, password):
        pair = cls(username=username, password=password)
        return pair
