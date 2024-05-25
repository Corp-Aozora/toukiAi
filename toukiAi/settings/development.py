from .base import *
from toukiApp.company_data import CompanyData

DEBUG = False

SECRET_KEY=env("DEV_SECRET_KEY")

ALLOWED_HOSTS = [
    "django-render-6agw.onrender.com",
]

DEFAULT_FROM_EMAIL = CompanyData.DEBUG_MAIL_ADDRESS
EMAIL_HOST_USER = CompanyData.DEBUG_MAIL_ADDRESS
EMAIL_HOST_PASSWORD = env("DEBUG_EMAIL_HOST_PASSWORD")

DATABASES = {
    'default':{
        'ENGINE':'django.db.backends.postgresql',
        'NAME':'souzokutoukikun',
        'USER':'souzokutoukikun',
        'PASSWORD':'FYamYIRWv3826xBsE1w9NIY0yXQ9kuwF',
        'HOST':'dpg-cndci6f79t8c738dmkl0-a',
        # 'HOST':'dpg-cndci6f79t8c738dmkl0-a.singapore-postgres.render.com',
        'PORT':'5432',
    }
}

CSRF_FAILURE_VIEW = 'accounts.views.csrf_failure'
