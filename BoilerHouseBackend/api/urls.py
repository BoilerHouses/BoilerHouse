from django.urls import path
from .views import ping, try_bucket, log_in, register_account, activate, edit_account, get_user_profile

urlpatterns = [
    path('ping/', ping, name='ping'),
    path('buckets/', try_bucket, name='tryBucket'),
    path('loginUser/', log_in, name='getUser'),
    path('registerAccount/', register_account, name='register_account'),
    path('user/edit/', edit_account, name='editUser'),
    path("profile/", get_user_profile, name="profile"),
    path('activate/<uidb64>/<token>', activate, name="activate")
]