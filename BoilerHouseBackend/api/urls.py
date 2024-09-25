from django.urls import path
from .views import ping, tryBucket

urlpatterns = [
    path('ping/', ping, name='ping'),
    path('buckets/', tryBucket, name='tryBucket')
]