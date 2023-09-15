from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
 
app_name = 'accounts'

urlpatterns = [
    path("signup/is_new_email", views.is_new_email, name="is_new_email"),
    path("password/reset/is_user_email", views.is_user_email, name="is_user_email"),
    path("password/reset/done/is_user_email", views.is_user_email, name="is_user_email"),
    path('confirm-email/resend_confirmation', views.resend_confirmation, name='resend_confirmation'),
    path('password/change/is_oldpassword', views.is_oldpassword, name='is_oldpassword'),
]
