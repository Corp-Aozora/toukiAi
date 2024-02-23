"""
ASGI config for toukiAi project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""
import os
from pathlib import Path
import environ
import os
from django.core.asgi import get_asgi_application

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env()
env_file = BASE_DIR / ".env"
env.read_env(env_file)
print("aaaaaaaaaaaaaaaaaaaaaaaaa")
print(env)
os.environ.setdefault(env('DJANGO_SETTINGS_MODULE'), 'toukiAi.settings.local')

application = get_asgi_application()
