# Generated by Django 4.2.5 on 2024-05-23 02:40

import common.validations
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0019_user_last_login_session_key'),
    ]

    operations = [
        migrations.AddField(
            model_name='optionrequest',
            name='is_card',
            field=models.BooleanField(default=False, verbose_name='カード決済'),
        ),
        migrations.AlterField(
            model_name='optionrequest',
            name='payer',
            field=models.CharField(blank=True, max_length=30, null=True, validators=[common.validations.validate_katakana], verbose_name='支払名義人'),
        ),
    ]
