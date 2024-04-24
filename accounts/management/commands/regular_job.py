from datetime import timedelta
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User, EmailChange

class Command(BaseCommand):
    help = '1週間以上メール認証していないユーザーと1日以上の古いメールアドレス変更申請を削除する'

    def handle(self, *args, **options):
        one_week_ago = timezone.now() - timedelta(days=7)
        unconfirmed_users = User.objects.filter(is_active=False, date_joined__lt=one_week_ago)
        count = unconfirmed_users.count()
        unconfirmed_users.delete()
        self.stdout.write(self.style.SUCCESS(f'1週間以上メール認証されていないユーザー{count}件を削除しました'))
        
        # EmailChangeの削除処理
        one_day_ago = timezone.now() - timedelta(days=1)
        expired_email_changes = EmailChange.objects.filter(updated_at__lt=one_day_ago)
        email_change_count = expired_email_changes.count()
        expired_email_changes.delete()
        self.stdout.write(self.style.SUCCESS(f'1日以上更新されていないメールアドレス変更申請{email_change_count}件を削除しました'))