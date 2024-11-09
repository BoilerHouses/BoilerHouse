from django.urls import path
from .views import ping, try_bucket, log_in, register_account, activate
from .views import forgot_password, activate_forgot_password, edit_account
from .views import get_user_profile, save_club_information, get_all_clubs, set_availability, approve_club, join_club, set_questions, get_questions
from .views import update_password, get_club_information, get_all_users, delete_user, deny_club, verify, get_example_clubs, modify_user_to_club
from .views import set_answers, get_answers, get_meeting_times, set_meeting_times, set_deletion, get_club_details_for_edit, update_club_info, get_clubs_for_officer, send_email_to_members
from .views import set_accepting_applications, set_officer_questions, get_officer_questions, set_officer_answers, get_officer_answers, modify_user_to_officer, leave_club, update_contact_info
from .views import update_club_dues

urlpatterns = [
    path('ping/', ping, name='ping'),
    path('buckets/', try_bucket, name='tryBucket'),
    path('loginUser/', log_in, name='getUser'),
    path('registerAccount/', register_account, name='registerAccount'),
    path('user/edit/', edit_account, name='editUser'),
    path('profile/', get_user_profile, name='getProfile'),
    path('verify_token/', verify, name='verify'),
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
    path('club/join/', join_club, name="join_club"),
    path('club/delete/vote/', set_deletion, name="delete_club"),
    path('club/join/approval/', modify_user_to_club, name="modify_user_club"),
    path('club/questions/save/', set_questions, name="set_questions"),
    path('club/questions/fetch/', get_questions, name="get_questions"),
    path('clubs/responses/add/', set_answers, name='answers'),
    path('clubs/responses/fetch/', get_answers, name='get_answers'),
    path('club/approve/', approve_club, name="approve_club"),
    path('club/delete/', deny_club, name="approve_club"),
    path("clubs/examples/", get_example_clubs, name="get_example_clubs"),
    path("clubs/getMeetingTimes/", get_meeting_times, name="get_meeting_times"),
    path("clubs/setMeetingTimes/", set_meeting_times, name="set_meeting_times"),
    path('club/update/', update_club_info, name='update_club_info'),
    path('club/officer/toggle/<int:club_id>/', set_accepting_applications, name='setAccept'),
    path('club/officer/<int:club_id>/questions/set/', set_officer_questions, name='setOfficerQ'),
    path('club/officer/<int:club_id>/questions/get/', get_officer_questions, name='getOfficerQ'),
    path('club/officer/answers/<int:club_id>/set/', set_officer_answers, name='setOfficerA'),
    path('club/officer/answers/<int:club_id>/<username>/', get_officer_answers, name='getOfficerA'),
    path('club/officer/set/<int:club_id>/', modify_user_to_officer, name='setOfficers'),
    path('club/<int:club_id>/edit/', get_club_details_for_edit, name='get_club_details_for_edit'),
    path("get_clubs_for_officer/", get_clubs_for_officer, name="get_clubs_for_officer"),
    path("send_email_to_members/", send_email_to_members, name="send_email_to_members"),
    path("leaveClub/", leave_club, name="leave_club"),
    path("club/<int:club_id>/defaultContact", update_contact_info, name="update_contact_info"),
    path("club/<int:club_id>/clubDues", update_club_dues, name="update_club_dues"),
]