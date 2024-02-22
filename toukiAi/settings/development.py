from .base import *

DEBUG = False

SECRET_KEY=env("DEV_SECRET_KEY")

# INSTALLED_APPS += [
#     "debug_toolbar",
# ]

# MIDDLEWARE += [
#     'debug_toolbar.middleware.DebugToolbarMiddleware',
# ]

ALLOWED_HOSTS = [
    "0.0.0.0"
]

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# # DEFAULT_FROM_EMAIL = 't.saga@yahoo.ne.jp'    #送信元のアドレスを指定
# EMAIL_HOST = 'smtp.mail.yahoo.co.jp' 
# EMAIL_PORT = 465                            
# EMAIL_HOST_USER = 't.saga@yahoo.ne.jp'   
# EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
# EMAIL_USE_SSL = True   

DEFAULT_FROM_EMAIL = 'toukiaidev@gmail.com'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'toukiaidev@gmail.com'
EMAIL_HOST_PASSWORD = 'dmpwozrseacxyagh'
EMAIL_USE_TLS = True 

# DATABASES = {
#     'default':{
#         'ENGINE':'django.db.backends.postgresql',
#         'NAME':'django_render_db_63qk',
#         'USER':'django_user',
#         'PASSWORD':'wmWQekZ8WodiGi2g5fdjZ5J0orMqUWMi',
#         'HOST':'dpg-cjv53lh5mpss7397ds40-a',
#         'PORT':'5432',
#     }
# }