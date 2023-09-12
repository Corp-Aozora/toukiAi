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
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# DEFAULT_FROM_EMAIL = 't.saga@yahoo.ne.jp'    #送信元のアドレスを指定
# EMAIL_HOST = 'ymobilesmtp.mail.yahoo.ne.jp' 
# EMAIL_PORT = 465                            
# EMAIL_HOST_USER = 't.saga@yahoo.ne.jp'   
# EMAIL_HOST_PASSWORD = 'saga2497'           
# EMAIL_USE_TLS = True    