# Generated by Django 4.2.5 on 2024-04-26 13:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0016_alter_optionrequest_phone_number'),
    ]

    operations = [
        migrations.AlterField(
            model_name='optionrequest',
            name='charge',
            field=models.CharField(default='０', max_length=7, verbose_name='支払額'),
        ),
    ]
