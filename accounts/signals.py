from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.signals import email_confirmed,  user_logged_out
from django.dispatch import receiver
from django.contrib.auth import login

@receiver(email_confirmed)
def login_on_email_confirmation(request, email_address, **kwargs):
    user = email_address.user
    user.backend = 'django.contrib.auth.backends.ModelBackend'
    login(request, user)
