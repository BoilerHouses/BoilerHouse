from django.urls import path
from .views import ping, try_bucket, log_in, create_account, register_account, activate, upload_profile_picture

urlpatterns = [
    path('ping/', ping, name='ping'),
    path('buckets/', try_bucket, name='tryBucket'),
    path('loginUser/', log_in, name='getUser'),
    path('registerAccount/', register_account, name='register_account'),
    path('user/create/', create_account, name='createUser'),
    path('activate/<uidb64>/<token>', activate, name="activate"),
    path('upload-profile-picture/', upload_profile_picture, name='upload_profile_picture'),
]