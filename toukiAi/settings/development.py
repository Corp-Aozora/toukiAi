from .base import *

DEBUG = False

SECRET_KEY=env("DEV_SECRET_KEY")

INSTALLED_APPS += [
    "debug_toolbar",
]

MIDDLEWARE += [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

ALLOWED_HOSTS = [
    "django-render-6agw.onrender.com"
]

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# # DEFAULT_FROM_EMAIL = 't.saga@yahoo.ne.jp'    #送信元のアドレスを指定
# EMAIL_HOST = 'smtp.mail.yahoo.co.jp' 
# EMAIL_PORT = 465                            
# EMAIL_HOST_USER = 't.saga@yahoo.ne.jp'   
# EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
# EMAIL_USE_SSL = True   

# DEFAULT_FROM_EMAIL = 'toukiaidev@gmail.com'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'toukiaidev@gmail.com'
EMAIL_HOST_PASSWORD = 'dmpwozrseacxyagh'
EMAIL_USE_TLS = True 