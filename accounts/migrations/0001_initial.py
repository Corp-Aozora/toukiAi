# Generated by Django 4.2.5 on 2023-09-06 23:40

import accounts.models
import django.contrib.auth.validators
import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(max_length=20, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='お名前')),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='メールアドレス')),
                ('phone_number', models.CharField(default='', max_length=11, validators=[django.core.validators.RegexValidator(message='ハイフンなしの10桁又は11桁で入力してください', regex='^[0-9]+$')], verbose_name='電話番号')),
                ('option1', models.BooleanField(default=False, verbose_name='オプション1の利用状況')),
                ('option1_date', models.DateTimeField(null=True, verbose_name='オプション1利用開始日')),
                ('option2', models.BooleanField(default=False, verbose_name='オプション2の利用状況')),
                ('option2_date', models.DateTimeField(null=True, verbose_name='オプション2利用開始日')),
                ('option3', models.BooleanField(default=False, verbose_name='オプション3の利用状況')),
                ('option3_date', models.DateTimeField(null=True, verbose_name='オプション3利用開始日')),
                ('option4', models.BooleanField(default=False, verbose_name='オプション4の利用状況')),
                ('option4_date', models.DateTimeField(null=True, verbose_name='オプション4利用開始日')),
                ('option5', models.BooleanField(default=False, verbose_name='オプション5の利用状況')),
                ('option5_date', models.DateTimeField(null=True, verbose_name='オプション5利用開始日')),
                ('option6', models.BooleanField(default=False, verbose_name='オプション6の利用状況')),
                ('option6_date', models.DateTimeField(null=True, verbose_name='オプション6利用開始日')),
                ('payment', models.CharField(choices=[(0, '振込'), (1, 'カード')], default=2, max_length=30, verbose_name='支払方法')),
                ('pay_amount', models.PositiveIntegerField(default=0, verbose_name='支払額')),
                ('progress', models.CharField(choices=[(0, 'step1'), (1, 'step2'), (2, 'step3'), (3, 'step4'), (4, 'step5'), (5, 'step6')], default=1, max_length=30, verbose_name='進捗')),
                ('agreement', models.BooleanField(default=False, verbose_name='利用条件確認')),
                ('last_update', models.DateTimeField(auto_now=True, verbose_name='最終更新日')),
                ('is_staff', models.BooleanField(default=False, verbose_name='スタッフ権限')),
                ('is_active', models.BooleanField(default=True, verbose_name='利用状況')),
                ('date_joined', models.DateTimeField(auto_now_add=True, verbose_name='利用開始日')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'ユーザー',
                'verbose_name_plural': 'ユーザー',
            },
            managers=[
                ('objects', accounts.models.UserManager()),
            ],
        ),
    ]
