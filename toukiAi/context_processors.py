from django.conf import settings
import os

def media(request):
    return {'MEDIA_URL': settings.MEDIA_URL}

def custom_settings_processor(request):
    return {
        'DEBUG': settings.DEBUG,
        "DJANGO_SETTINGS_MODULE": os.getenv('DJANGO_SETTINGS_MODULE', 'toukiAi.settings.local')
    }