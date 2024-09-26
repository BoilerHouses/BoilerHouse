from django.urls import path
from .views import ping, try_bucket, log_in, create_account

urlpatterns = [
    path('ping/', ping, name='ping'),
    path('buckets/', try_bucket, name='tryBucket'),
    path('user/', log_in, name='getUser'),
    path('user', create_account, name='createUser')

]