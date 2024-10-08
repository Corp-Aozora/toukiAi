# Generated by Django 4.2.5 on 2024-03-06 01:44

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('toukiApp', '0046_rename_building_site_house_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Application',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='作成日')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='最終更新日')),
                ('object_id', models.PositiveIntegerField(blank=True, null=True, verbose_name='申請人id')),
                ('is_agent', models.BooleanField(blank=True, default=None, null=True, verbose_name='代理人の有無')),
                ('agent_name', models.CharField(default='', max_length=100, verbose_name='代理人氏名')),
                ('agent_address', models.CharField(default='', max_length=100, verbose_name='代理人住所')),
                ('agent_phone_number', models.CharField(default='', max_length=100, verbose_name='代理人電話番号')),
                ('is_return', models.BooleanField(blank=True, default=None, null=True, verbose_name='原本還付の有無')),
                ('is_mail', models.BooleanField(blank=True, default=None, null=True, verbose_name='郵送の有無')),
                ('content_type', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='application_content_type', to='contenttypes.contenttype', verbose_name='申請人')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='application_created_by', to=settings.AUTH_USER_MODEL, verbose_name='作成者')),
                ('decedent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='application', to='toukiApp.decedent', verbose_name='被相続人')),
                ('updated_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='application_update_by', to=settings.AUTH_USER_MODEL, verbose_name='最終更新者')),
            ],
            options={
                'verbose_name': '申請情報',
                'verbose_name_plural': '申請情報',
            },
        ),
        migrations.AlterField(
            model_name='relatedindividual',
            name='content_type',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.contenttype', verbose_name='卑属又は傍系'),
        ),
        migrations.AlterField(
            model_name='relatedindividual',
            name='object_id',
            field=models.PositiveIntegerField(verbose_name='卑属又は傍系のid'),
        ),
        migrations.CreateModel(
            name='DestinationOffice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='作成日')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='最終更新日')),
                ('code', models.BooleanField(blank=True, default=None, null=True, verbose_name='法務局コード')),
                ('name', models.CharField(default='', max_length=100, verbose_name='名称')),
                ('post_number', models.CharField(default='', max_length=100, verbose_name='郵便番号')),
                ('address', models.CharField(default='', max_length=100, verbose_name='住所')),
                ('application', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='destination_office_application', to='toukiApp.application', verbose_name='申請情報')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='destination_office_created_by', to=settings.AUTH_USER_MODEL, verbose_name='作成者')),
                ('decedent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='destination_office', to='toukiApp.decedent', verbose_name='被相続人')),
                ('updated_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='destination_office_update_by', to=settings.AUTH_USER_MODEL, verbose_name='最終更新者')),
            ],
            options={
                'verbose_name': '申請先法務局',
                'verbose_name_plural': '申請先法務局',
            },
        ),
    ]
