from datetime import timedelta
from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User, EmailChange, OptionRequest, EmailVerification

class Command(BaseCommand):
    help = 'アカウント関連の定期処理'

    def handle(self, *args, **options):
        one_week_ago = timezone.now() - timedelta(days=7)
        one_day_ago = timezone.now() - timedelta(days=1)
        
        """
            仮登録データの削除処理(1週間) ※当面使用しないため一旦コメントアウト
        """
        # unconfirmed_users = User.objects.filter(is_active=False, date_joined__lt=one_week_ago)
        # count = unconfirmed_users.count()
        # unconfirmed_users.delete()
        # self.stdout.write(self.style.SUCCESS(f'1週間以上メール認証されていないユーザー{count}件を削除しました'))
        
        """
            メールアドレス変更申請の削除処理(1日)
        """
        expired_email_changes = EmailChange.objects.filter(updated_at__lt=one_day_ago)
        email_change_count = expired_email_changes.count()
        expired_email_changes.delete()
        self.stdout.write(self.style.SUCCESS(f'1日以上更新されていないメールアドレス変更申請{email_change_count}件を削除しました'))
        
        """
            オプションの利用申込みの削除処理(1週間)
        """
        old_requests = OptionRequest.objects.filter(
            updated_at__lte=one_week_ago,
            recieved_date__isnull=True
        )

        # 削除処理
        count = old_requests.count()
        old_requests.delete()

        # 終了メッセージ
        self.stdout.write(self.style.SUCCESS(f'オプションの利用申込みから1週間以内に支払いがされていないデータ{count}件を削除しました'))
        
        """
            メールアドレス認証の削除処理(ユーザーがいない、かつ1日経過)
        """
        deleted_count, _ = EmailVerification.objects.filter(user__isnull=True, created_at__lt=one_day_ago).delete()
        self.stdout.write(self.style.SUCCESS(f'メールアドレス認証の一時コード発行からユーザー登録なく1日経過したデータ{deleted_count}件を削除しました'))
        