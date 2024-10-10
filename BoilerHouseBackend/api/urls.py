from django.urls import path
from .views import ping, try_bucket, log_in, create_account, register_account, activate, forgot_password, activate_forgot_password, edit_account, update_password, get_user_profile, set_availability

urlpatterns = [
    path('ping/', ping, name='ping'),
    path('buckets/', try_bucket, name='tryBucket'),
    path('loginUser/', log_in, name='getUser'),
    path('registerAccount/', register_account, name='registerAccount'),
    path('user/edit/', edit_account, name='editUser'),
    path('profile/', get_user_profile, name='getProfile'),
    path('activate/<uidb64>/<token>', activate, name="activate"),
    path('forgotPassword/', forgot_password, name="forgotPassword"),
    path('forgotPassword/<uidb64>/<token>', activate_forgot_password, name="activateForgotPassword"),
    path('updatePassword/<uidb64>/<token>', update_password, name="updatePassword"),
    path('get_user_profile', get_user_profile, name="get_user_profile"),
    path('setAvailability/', set_availability, name="setAvailability")
]