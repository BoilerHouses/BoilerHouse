from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MaxValueValidator, MinValueValidator
from datetime import datetime
import json


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


    '''
    Use the major and interest methods below to access/modify majors and interests
    '''

    # Constructor type method
    @classmethod
    def create(cls, username, password, name, bio, grad_year, is_admin):
        user = cls(username=username, password=password, name=name, bio=bio, grad_year=grad_year, is_admin=is_admin, major=[], interests=[], created_profile=False)
        return user



class LoginPair(models.Model):
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)


    @classmethod
    def create(cls, username, password, is_admin):
        pair = cls(username=username, password=password, is_admin=is_admin)
        return pair

class Club(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name="admin_of_clubs")
    members = models.ManyToManyField(User, through="ClubMembership", related_name="clubs")
    
    def __str__(self):
        return self.name


# New ClubMembership Model
class ClubMembership(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('member', 'Member'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    club = models.ForeignKey(Club, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.name} - {self.club.name} ({self.role})"