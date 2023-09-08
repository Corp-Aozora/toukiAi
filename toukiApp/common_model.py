from django.db import models
from django.conf import settings

class CommonModel(models.Model):
    class Meta:
        # マイグレーション時にテーブルを作成しないModelは以下のオプションが必要
        abstract = True

    # 以下、「お約束カラム」
    created_at = models.DateTimeField(verbose_name="作成日", auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name="最終更新日", auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
    )