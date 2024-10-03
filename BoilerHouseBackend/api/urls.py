from django.urls import path
from .views import ping, try_bucket, log_in, create_account, register_account, activate, test_email_auth

urlpatterns = [
    path('ping/', ping, name='ping'),
    path('buckets/', try_bucket, name='tryBucket'),
    path('loginUser/', log_in, name='getUser'),
    path('registerAccount/', register_account, name='register_account'),
    path('user/create/', create_account, name='createUser'),
    path('activate/<uidb64>/<token>', activate, name="activate"),
    path('testemailauth', test_email_auth, name="test_email_auth")
]