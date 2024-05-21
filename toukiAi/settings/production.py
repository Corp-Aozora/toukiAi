from .base import *
from toukiApp.company_data import CompanyData

DEBUG = False

SECRET_KEY=env("PRO_SECRET_KEY")

ALLOWED_HOSTS = [
    "toukiai.onrender.com",
    'aozoratouki.com', 
    'www.aozoratouki.com'
]

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
DEFAULT_FROM_EMAIL = CompanyData.MAIL_ADDRESS    #送信元のアドレスを指定
EMAIL_HOST_USER = CompanyData.MAIL_ADDRESS
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")

DATABASES = {
    'default':{
        'ENGINE':'django.db.backends.postgresql',
        'NAME':'souzokutoukikun_pro',
        'USER':'aozorasaga',
        'PASSWORD':'ki3BPE6I0zzZ9zxKyhtFdMEJHo0RmNvW',
        'HOST':'dpg-corihn7sc6pc73dojung-a',
        # 'HOST':'dpg-cndci6f79t8c738dmkl0-a.singapore-postgres.render.com',
        'PORT':'5432',
    }
}

CSRF_FAILURE_VIEW = 'accounts.views.csrf_failure'
