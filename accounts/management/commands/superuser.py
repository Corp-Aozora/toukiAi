from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class Command(BaseCommand):
    def handle(self, *args, **options):
        
        if not User.objects.filter(email=settings.SUPERUSER_EMAIL).exists():
            User.objects.create_superuser(
                username=settings.SUPERUSER_NAME,
                email=settings.SUPERUSER_EMAIL,
                password=settings.SUPERUSER_PASSWORD
            )
            print(f"スーパーユーザー作成\n{settings.SUPERUSER_NAME}\n{settings.SUPERUSER_EMAIL}\n{settings.SUPERUSER_PASSWORD}")