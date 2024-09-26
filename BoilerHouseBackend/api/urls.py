from django.urls import path
from .views import ping, tryBucket, getUser, createUser

urlpatterns = [
    path('ping/', ping, name='ping'),
    path('buckets/', tryBucket, name='tryBucket'),
    path('user/', getUser, name='getUser'),
    path('user', createUser, name='createUser')

]