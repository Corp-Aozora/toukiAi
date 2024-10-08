# Generated by Django 4.2.5 on 2024-02-11 08:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('toukiApp', '0034_remove_ascendant_percentage_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='spouse',
            name='address',
            field=models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='住所の町域・番地'),
        ),
        migrations.AlterField(
            model_name='spouse',
            name='bldg',
            field=models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='住所の建物'),
        ),
        migrations.AlterField(
            model_name='spouse',
            name='city',
            field=models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='住所の市区町村'),
        ),
    ]
