from .base import *

DEBUG = True

SECRET_KEY=env("LOCAL_SECRET_KEY")

INSTALLED_APPS += [
    "debug_toolbar",
]

MIDDLEWARE += [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

INTERNAL_IPS = ['127.0.0.1']

ALLOWED_HOSTS = [
    '.localhost', '127.0.0.1', '[::1]'
]

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend' # ローカルでの開発のためメールをコンソールで表示する
# DEFAULT_FROM_EMAIL = '誰でも相続登記 <t.saga@yahoo.ne.jp>'    #送信元のアドレスを指定
# EMAIL_HOST = 'smtp.mail.yahoo.co.jp' 
# EMAIL_PORT = 465                            
# EMAIL_HOST_USER = 't.saga@yahoo.ne.jp'   
# EMAIL_HOST_PASSWORD = 'saga2497'           
# EMAIL_USE_TLS = True    

# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
DEFAULT_FROM_EMAIL = 'そうぞくとうきくん <toukiaidev@gmail.com>'    #送信元のアドレスを指定
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'toukiaidev@gmail.com'
EMAIL_HOST_PASSWORD = 'dmpwozrseacxyagh'
EMAIL_USE_TLS = True 

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