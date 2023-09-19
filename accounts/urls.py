from django.urls import path
from . import views
from django.contrib.auth import views as auth_views
 
app_name = 'accounts'

urlpatterns = [
    path("signup/is_new_email", views.is_new_email, name="is_new_email"),
    path("password/reset/is_user_email", views.is_user_email, name="is_user_email"),
    path("password/reset/is_valid_email_pattern", views.is_valid_email_pattern, name="is_valid_email_pattern"),
    path("password/reset/done/is_user_email", views.is_user_email, name="is_user_email"),
    path('confirm-email/resend_confirmation', views.resend_confirmation, name='resend_confirmation'),
    path('password/change/is_oldpassword', views.is_oldpassword, name='is_oldpassword'),
    path("change_email", views.change_email, name="change_email"),
    path("is_new_email", views.is_new_email, name="is_new_email"),
    path('confirm/<str:token>/', views.confirm_email, name='confirm_email'),
]