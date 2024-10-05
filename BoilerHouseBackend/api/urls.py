from django.urls import path
from .views import ping, try_bucket, log_in, create_account, register_account, activate, edit_account, get_user_profile

urlpatterns = [
    path('ping/', ping, name='ping'),
    path('buckets/', try_bucket, name='tryBucket'),
    path('loginUser/', log_in, name='getUser'),
    path('registerAccount/', register_account, name='register_account'),
    path('user/create/', create_account, name='createUser'),
    path('user/edit/', edit_account, name='editUser'),
    path('activate/<uidb64>/<token>', activate, name="activate"),
    path('get_user_profile', get_user_profile, name="get_user_profile")
]