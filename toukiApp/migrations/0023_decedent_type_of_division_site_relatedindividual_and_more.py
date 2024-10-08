# Generated by Django 4.2.5 on 2024-01-31 09:44

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('toukiApp', '0022_remove_register_file_register_extension_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='decedent',
            name='type_of_division',
            field=models.CharField(choices=[('通常', '通常'), ('換価分割', '換価分割')], default='通常', max_length=30, verbose_name='遺産分割協議書の種類'),
        ),
        migrations.CreateModel(
            name='Site',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='作成日')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='最終更新日')),
                ('land_num', models.IntegerField(blank=True, default='', null=True, verbose_name='土地の符号')),
                ('land_type', models.CharField(blank=True, default='', null=True, verbose_name='敷地権の種類')),
                ('land_purparty', models.CharField(blank=True, default='', null=True, verbose_name='敷地権の割合')),
                ('price', models.IntegerField(default='', verbose_name='固定資産評価額')),
                ('building', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='site_house', to='toukiApp.decedent', verbose_name='建物')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='site_created_by', to=settings.AUTH_USER_MODEL, verbose_name='作成者')),
                ('decedent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='site', to='toukiApp.decedent', verbose_name='被相続人')),
                ('updated_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='site_update_by', to=settings.AUTH_USER_MODEL, verbose_name='最終更新者')),
            ],
            options={
                'verbose_name': '敷地',
                'verbose_name_plural': '敷地',
            },
        ),
        migrations.CreateModel(
            name='RelatedIndividual',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='作成日')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='最終更新日')),
                ('object_id', models.PositiveIntegerField(verbose_name='前配偶者又は子id')),
                ('name', models.CharField(default='', max_length=30, verbose_name='氏名')),
                ('Relationship', models.CharField(default='', max_length=30, verbose_name='続柄')),
                ('content_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.contenttype', verbose_name='前配偶者又は子')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='related_indivisual_created_by', to=settings.AUTH_USER_MODEL, verbose_name='作成者')),
                ('decedent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='related_indivisual', to='toukiApp.decedent', verbose_name='被相続人')),
                ('updated_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='related_indivisual_update_by', to=settings.AUTH_USER_MODEL, verbose_name='最終更新者')),
            ],
            options={
                'verbose_name': '関係者',
                'verbose_name_plural': '関係者',
            },
        ),
        migrations.CreateModel(
            name='Land',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='作成日')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='最終更新日')),
                ('number', models.CharField(default='', max_length=100, verbose_name='不動産番号')),
                ('address', models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='所在地')),
                ('type', models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='地目')),
                ('size', models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='地積')),
                ('purparty', models.CharField(default='', max_length=100, verbose_name='持ち分')),
                ('price', models.IntegerField(default='', verbose_name='固定資産評価額')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='land_created_by', to=settings.AUTH_USER_MODEL, verbose_name='作成者')),
                ('decedent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='land', to='toukiApp.decedent', verbose_name='被相続人')),
                ('register', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='land_register', to='toukiApp.decedent', verbose_name='不動産登記簿')),
                ('updated_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='land_update_by', to=settings.AUTH_USER_MODEL, verbose_name='最終更新者')),
            ],
            options={
                'verbose_name': '土地',
                'verbose_name_plural': '土地',
            },
        ),
        migrations.CreateModel(
            name='House',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='作成日')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='最終更新日')),
                ('number', models.CharField(default='', max_length=100, verbose_name='不動産番号')),
                ('address', models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='所在地')),
                ('purpose', models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='種類')),
                ('type', models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='構造')),
                ('first_floor_size', models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='１階面積')),
                ('second_floor_size', models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='２階面積')),
                ('third_floor_size', models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='３階面積')),
                ('fourth_floor_size', models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='４階面積')),
                ('fifth_floor_size', models.CharField(blank=True, default='', max_length=100, null=True, verbose_name='５階面積')),
                ('purparty', models.CharField(default='', max_length=100, verbose_name='持ち分')),
                ('price', models.IntegerField(default='', verbose_name='固定資産評価額')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='house_created_by', to=settings.AUTH_USER_MODEL, verbose_name='作成者')),
                ('decedent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='house', to='toukiApp.decedent', verbose_name='被相続人')),
                ('register', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='house_register', to='toukiApp.decedent', verbose_name='不動産登記簿')),
                ('updated_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='house_update_by', to=settings.AUTH_USER_MODEL, verbose_name='最終更新者')),
            ],
            options={
                'verbose_name': '建物',
                'verbose_name_plural': '建物',
            },
        ),
    ]
