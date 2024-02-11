# Generated by Django 4.2.5 on 2024-02-11 12:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('toukiApp', '0035_alter_spouse_address_alter_spouse_bldg_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='typeofdivision',
            name='type_of_division',
            field=models.CharField(blank=True, choices=[('通常', '通常'), ('換価分割', '換価分割')], max_length=30, null=True, verbose_name='遺産分割協議書の種類'),
        ),
    ]
