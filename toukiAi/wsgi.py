"""
WSGI config for toukiAi project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os
from pathlib import Path
import environ
from django.core.wsgi import get_wsgi_application

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env = environ.Env()
env_file = BASE_DIR / ".env"
env.read_env(env_file)
os.environ.setdefault(env('DJANGO_SETTINGS_MODULE'), 'toukiAi.settings.local')

application = get_wsgi_application()
