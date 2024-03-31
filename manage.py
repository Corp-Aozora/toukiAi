#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

environment = os.getenv("ENVIRONMENT", "windows")

if environment == "windows":
    # os.add_dll_directory は Python 3.8 以降の Windows でのみ利用可能
    if sys.platform == "win32" and hasattr(os, 'add_dll_directory'):
        os.add_dll_directory(r"C:\Program Files\PostgreSQL\16rc1\bin")

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'toukiAi.settings.local')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
