from django.urls import path
from .views import ping, try_bucket, log_in, register_account, activate
from .views import forgot_password, activate_forgot_password, edit_account
<<<<<<< HEAD
from .views import get_user_profile, save_club_information, get_all_clubs, set_availability, update_password, get_club_information, get_all_users, delete_user
=======
from .views import get_user_profile, save_club_information, get_all_clubs, set_availability, update_password, get_club_information, delete_user, get_all_users
>>>>>>> 6bc18a5eae60b692f9dce401ded089bf1050b374

urlpatterns = [
    path('ping/', ping, name='ping'),
    path('buckets/', try_bucket, name='tryBucket'),
    path('loginUser/', log_in, name='getUser'),
    path('registerAccount/', register_account, name='registerAccount'),
    path('user/edit/', edit_account, name='editUser'),
    path('profile/', get_user_profile, name='getProfile'),
    path('club/save/', save_club_information, name='saveClub'),
    path('clubs/', get_all_clubs, name='getAllClubs'),
    path('activate/<uidb64>/<token>', activate, name="activate"),
    path('forgotPassword/', forgot_password, name="forgotPassword"),
    path('forgotPassword/<uidb64>/<token>', activate_forgot_password, name="activateForgotPassword"),
    path('getAllUsers', get_all_users, name="getAllUsers"),
    path('deleteUser', delete_user, name="deleteUser"),
    path('updatePassword/<uidb64>/<token>', update_password, name="updatePassword"),
    path('get_user_profile', get_user_profile, name="get_user_profile"),
    path('setAvailability/', set_availability, name="setAvailability"),
    path('club/', get_club_information, name="get_club_information"),
]