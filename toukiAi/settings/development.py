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
    "toukikun.azurewebsites.net"
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

DATABASES = {
    'default':{
        'ENGINE':'django.db.backends.postgresql',
        'NAME':'postgres',
        'USER':'souzokutoukikun',
        'PASSWORD':'BDOPTXBQ46O7L3SU',
        'HOST':'souzokutoukikun.postgres.database.azure.com',
        'PORT':'5432',
    }
}

# 以下、GCP用に生成したものの
# データベース情報
# instance_name: toukiai
# project: toukiai-development
# database-version: POSTGRES_15
# tier: db-f1-micro
# region: asia-northeast1
# name: toukiai-development
# https://sqladmin.googleapis.com/sql/v1beta4/projects/toukiai-development/instances/toukiai
# users: toukiai-development_tatsuyasaga
# password: saga2497

# Cloud Storageバケット情報
# region:asia-northeast1
# gs://toukiai-development_souzokutoukikun