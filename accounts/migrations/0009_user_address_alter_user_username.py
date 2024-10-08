# Generated by Django 4.2.5 on 2024-04-25 08:24

import common.validations
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_alter_user_basic_date_alter_user_option1_date_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='address',
            field=models.CharField(default='', max_length=100, verbose_name='住所'),
        ),
        migrations.AlterField(
            model_name='user',
            name='username',
            field=models.CharField(default='', max_length=30, validators=[common.validations.JapaneseOnlyValidator()], verbose_name='氏名'),
        ),
    ]
