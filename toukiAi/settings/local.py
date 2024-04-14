from .base import *
from toukiApp.company_data import CompanyData


DEBUG = True

SECRET_KEY=env("LOCAL_SECRET_KEY")

# INSTALLED_APPS += [
#     "debug_toolbar",
# ]

# MIDDLEWARE += [
#     'debug_toolbar.middleware.DebugToolbarMiddleware',
# ]

INTERNAL_IPS = ['127.0.0.1']

ALLOWED_HOSTS = [
    '.localhost', '127.0.0.1', '[::1]'
]

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend' # ローカルでの開発のためメールをコンソールで表示する
DEFAULT_FROM_EMAIL = CompanyData.DEBUG_MAIL_ADDRESS
EMAIL_HOST_USER = CompanyData.DEBUG_MAIL_ADDRESS
EMAIL_HOST_PASSWORD = env("DEBUG_EMAIL_HOST_PASSWORD")


DATABASES = {
    'default':{
        'ENGINE':'django.db.backends.postgresql',
        'NAME':'toukiai',
        'USER':'tatsuyasaga',
        'PASSWORD':'saga2497',
        'HOST':'localhost',
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
            'encoding': 'utf-8',  # ログファイルのエンコーディングを指定
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'DEBUG',
    },
}