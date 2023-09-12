from .base import *

DEBUG = False

SECRET_KEY=env("PRO_SECRET_KEY")

ALLOWED_HOSTS = [
    "django-render-6agw.onrender.com"
]

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
DEFAULT_FROM_EMAIL = 't.saga@yahoo.ne.jp'    #送信元のアドレスを指定
EMAIL_HOST = 'ymobilesmtp.mail.yahoo.ne.jp' 
EMAIL_PORT = 465                            
EMAIL_HOST_USER = 't.saga@yahoo.ne.jp'   
EMAIL_HOST_PASSWORD = 'saga2497'           
EMAIL_USE_TLS = True    
