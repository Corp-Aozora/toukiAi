from django.apps import AppConfig
from django.core.management import call_command

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        import accounts.signals  # noqa
        
        # try:
        #     call_command('superuser')
        # except Exception as e:
        #     print(f"Error creating superuser: {e}")

        # # 定期的なジョブを実行する場合
        # try:
        #     call_command('regular_job')
        # except Exception as e:
        #     print(f"Error running regular_job: {e}")