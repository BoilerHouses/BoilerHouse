from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from datetime import datetime
import json


class User(models.Model):
    username = models.CharField(max_length=255, unique=True)
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

    @classmethod
    def create(cls, username, password, name, bio, interests, grad_year, major):
        user = cls(username=username, password=password, name=name, bio=bio, grad_year=grad_year)
        if interests:
            user.setInterests(interests)
        else:
            user.setInterests([])
        user.setMajor(major)
        # do something with the book
        return user

    def getMajors(self):
        return json.loads(self.major)

    def addMajor(self, major):
        self.major = json.dumps(json.loads(self.major).append(major))

    def setMajor(self, majors):
        self.major = json.dumps(majors)

    def getInterests(self):
        return json.loads(self.interests)

    def addInterest(self, interest):
        self.interests = json.dumps(json.loads(self.interests).append(interest))

    def setInterests(self, interest):
        self.interests = json.dumps(interest)
# Create your models here.
