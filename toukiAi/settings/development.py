from .base import *
from toukiApp.company_data import CompanyData

DEBUG = False

SECRET_KEY=env("DEV_SECRET_KEY")

ALLOWED_HOSTS = [
    "toukiai-6ctj.onrender.com",
]

DEFAULT_FROM_EMAIL = CompanyData.DEBUG_MAIL_ADDRESS
EMAIL_HOST_USER = CompanyData.DEBUG_MAIL_ADDRESS
EMAIL_HOST_PASSWORD = env("DEBUG_EMAIL_HOST_PASSWORD")

FINCODE_PUBLIC_KEY = env('FINCODE_TEST_PUBLIC_KEY')
FINCODE_SECRET_KEY = env('FINCODE_TEST_SECRET_KEY')
FINCODE_BASE_URL = 'https://api.test.fincode.jp'

DATABASES = {
    'default':{
        'ENGINE':'django.db.backends.postgresql',
        'NAME':'souzokutoukikun_4fnm',
        'USER':'souzokutoukikun',
        'PASSWORD':'sjfzZCGZI7L3yZrb0VgR8sO2uo2XQIo0',
        'HOST':'dpg-craejjrtq21c73bvou3g-a',
        # 'HOST':'dpg-cndci6f79t8c738dmkl0-a.singapore-postgres.render.com',
        'PORT':'5432',
    }
}

CSRF_FAILURE_VIEW = 'accounts.views.csrf_failure'
