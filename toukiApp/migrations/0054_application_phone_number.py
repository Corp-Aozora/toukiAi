# Generated by Django 4.2.5 on 2024-03-14 06:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('toukiApp', '0053_alter_openinquiry_subject_alter_site_land_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='application',
            name='phone_number',
            field=models.CharField(blank=True, default='', max_length=13, null=True, verbose_name='申請人電話番号'),
        ),
    ]
