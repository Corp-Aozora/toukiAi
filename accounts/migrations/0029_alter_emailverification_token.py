# Generated by Django 4.2.5 on 2024-06-04 14:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0028_emailverification_is_verified'),
    ]

    operations = [
        migrations.AlterField(
            model_name='emailverification',
            name='token',
            field=models.PositiveIntegerField(max_length=100, unique=True, verbose_name='トークン'),
        ),
    ]
