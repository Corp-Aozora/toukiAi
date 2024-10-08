# Generated by Django 4.2.5 on 2024-04-26 12:54

import common.validations
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0015_remove_optionrequest_is_phone_required_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='optionrequest',
            name='phone_number',
            field=models.CharField(max_length=11, validators=[common.validations.validate_no_hyphen_phone_number], verbose_name='電話番号'),
        ),
    ]
