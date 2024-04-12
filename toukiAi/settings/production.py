from .base import *
from toukiApp.company_data import CompanyData

DEBUG = False

SECRET_KEY=env("PRO_SECRET_KEY")

ALLOWED_HOSTS = [
    "django-render-6agw.onrender.com"
]

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
DEFAULT_FROM_EMAIL = CompanyData.MAIL_ADDRESS    #送信元のアドレスを指定
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = CompanyData.MAIL_ADDRESS
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
EMAIL_USE_TLS = True  

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

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': './logfile.log',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'ERROR',
    },
}