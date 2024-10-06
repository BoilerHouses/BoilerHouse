from django.urls import path
from .views import ping, try_bucket, log_in, create_account, register_account, activate, forgot_password, activate_forgot_password, edit_account

urlpatterns = [
    path('ping/', ping, name='ping'),
    path('buckets/', try_bucket, name='tryBucket'),
    path('loginUser/', log_in, name='getUser'),
    path('registerAccount/', register_account, name='registerAccount'),
    path('user/create/', create_account, name='createUser'),
    path('user/edit/', edit_account, name='editUser'),
    path('activate/<uidb64>/<token>', activate, name="activate"),
    path('forgotPassword/', forgot_password, name="forgotPassword"),
    path('forgotPassword/<uidb64>/<token>', activate_forgot_password, name="activateForgotPassword"),

]