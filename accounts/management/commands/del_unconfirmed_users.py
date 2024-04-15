from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User

class Command(BaseCommand):
    help = '1週間以上メール認証していないユーザーを削除する'

    def handle(self, *args, **options):
        one_week_ago = timezone.now() - timedelta(days=7)
        unconfirmed_users = User.objects.filter(is_active=False, date_joined__lt=one_week_ago)
        count = unconfirmed_users.count()
        unconfirmed_users.delete()
        self.stdout.write(self.style.SUCCESS(f'1週間以上メール認証されていないユーザー{count}件を削除しました'))