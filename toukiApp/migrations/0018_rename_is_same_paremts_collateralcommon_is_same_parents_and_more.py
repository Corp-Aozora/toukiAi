# Generated by Django 4.2.5 on 2023-12-19 12:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('toukiApp', '0017_alter_ascendant_prefecture_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='collateralcommon',
            old_name='is_same_paremts',
            new_name='is_same_parents',
        ),
        migrations.RenameField(
            model_name='descendantcommon',
            old_name='is_same_paremts',
            new_name='is_same_parents',
        ),
        migrations.AlterField(
            model_name='collateralcommon',
            name='count',
            field=models.IntegerField(default=0, verbose_name='兄弟姉妹の数'),
        ),
    ]
