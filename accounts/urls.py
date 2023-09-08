from django.urls import path
from . import views
 
app_name = 'accounts'

urlpatterns = [
    path("signup/email_check", views.email_check, name="email_check"),
]
