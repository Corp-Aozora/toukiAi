# Generated by Django 4.2.5 on 2024-04-27 09:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0017_alter_optionrequest_charge'),
    ]

    operations = [
        migrations.AlterField(
            model_name='optionrequest',
            name='address',
            field=models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='住所'),
        ),
    ]
