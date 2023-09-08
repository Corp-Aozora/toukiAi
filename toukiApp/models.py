from django.db import models
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.core.mail import send_mail
from django.utils import timezone
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from .company_data import Service
import datetime
from django.conf import settings
from .customDate import *
from .prefectures import *
from .common_model import *
from accounts.models import User


# 被相続人
# 親：ユーザー
# 子：親族、不動産
class Decendant(CommonModel):
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="ユーザー",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="decendant",
    )
    
    name = models.CharField(verbose_name="氏名", max_length=30, default="")
    domicile_prefecture = models.CharField(verbose_name="本籍地の都道府県" ,max_length=20, choices=PREFECTURES)
    domicile_city = models.CharField(verbose_name="本籍地の市区町村", max_length=100, default="")
    domicile_address = models.CharField(verbose_name="本籍地の町域・番地", max_length=100, default="")
    prefecture = models.CharField(verbose_name="住所の都道府県", max_length=20, choices=PREFECTURES)
    city = models.CharField(verbose_name="住所の市区町村", max_length=100, default="")
    address = models.CharField(verbose_name="住所の町域・番地", max_length=100, default="")
    bldg = models.CharField(verbose_name="住所の建物", max_length=100, default="")
    resistry_prefecture = models.CharField(verbose_name="登記上の都道府県", max_length=20, default="")
    resistry_city = models.CharField(verbose_name="登記上の市区町村", max_length=100, default="")
    resistry_address = models.CharField(verbose_name="登記上の町域・番地", max_length=100, default="")
    resistry_bldg = models.CharField(verbose_name="登記上の建物", max_length=100, default="")
    death_year = models.CharField(verbose_name="死亡年", max_length=20, choices=CustomDateReturn.years_with_jc, default="")
    death_month = models.CharField(verbose_name="死亡月", max_length=2, choices=CustomDateReturn.months)
    death_date = models.CharField(verbose_name="死亡日", max_length=2, choices=CustomDateReturn.days)
    birth_year = models.CharField(verbose_name="誕生年", max_length=20, choices=CustomDateReturn.years_with_jc)
    birth_month = models.CharField(verbose_name="誕生月", max_length=2, choices=CustomDateReturn.months)
    birth_date = models.CharField(verbose_name="誕生日", max_length=2, choices=CustomDateReturn.days)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "decendant_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "decendant_update_by",
    )
    
    step_one_fields =["user", "name", "death_year", "death_month", "prefecture", "city", "domicile_prefecture", "domicile_city"]
    
    class Meta:
        verbose_name = _("被相続人")
        verbose_name_plural = _("被相続人")

# 親族
# 親：被相続人
# 子：相続人
class Relation(CommonModel):
    decendant = models.ForeignKey(
        Decendant,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="relation",
    )
    relation = models.CharField(verbose_name="続柄", max_length=30)
    name = models.CharField(verbose_name="氏名", max_length=30, default="")
    exist_list = (
        (0, "いる"),
        (1, "いない"),
        (2, "逝去"),
    )
    exist = models.CharField(max_length=10, choices=exist_list)
    is_live = models.BooleanField(verbose_name="今も健在", default=True)
    is_japan = models.BooleanField(verbose_name="日本在住", default=True)
    is_adult = models.BooleanField(verbose_name="成人", default=True)
    prefecture = models.CharField(verbose_name="住所の都道府県", max_length=20, default="")
    city = models.CharField(verbose_name="住所の市区町村", max_length=100, default="")
    address = models.CharField(verbose_name="住所の町域・番地", max_length=100, default="")
    bldg = models.CharField(verbose_name="住所の建物", max_length=100, default="")
    death_year = models.CharField(verbose_name="死亡年", max_length=20, choices=CustomDateReturn.years_with_jc, default="")
    death_month = models.CharField(verbose_name="死亡月", max_length=2, choices=CustomDateReturn.months, default="")
    death_date = models.CharField(verbose_name="死亡日", max_length=2, choices=CustomDateReturn.days, default="")
    birth_year = models.CharField(verbose_name="誕生年", max_length=20, choices=CustomDateReturn.years_with_jc, default="")
    birth_month = models.CharField(verbose_name="誕生月", max_length=2, choices=CustomDateReturn.months, default="")
    birth_date = models.CharField(verbose_name="誕生日", max_length=2, choices=CustomDateReturn.days, default="")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "relation_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "relation_update_by"
    )
    
    step_one_fields = ["decendant", "relation", "name", "exist", "is_live", "is_japan", "is_adult"]
    
    class Meta:
        verbose_name = _("親族")
        verbose_name_plural = _("親族")

# 更新情報
def validate_staff(value):
    is_staff = User.objects.filter(pk = value).exists()
    
    if is_staff == False:
        raise ValidationError("スタッフ権限がありません", params={"value": value})

class UpdateArticle(CommonModel):
    title = models.CharField(verbose_name="タイトル", max_length=20)
    article = models.TextField(verbose_name="記事", max_length=100)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "update_article_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "update_article_update_by"
    )

    class Meta:
        verbose_name = _("更新情報")
        verbose_name_plural = _("更新情報")
        
# 不動産
# 親：被相続人
# 子：土地、建物、区分建物

# 土地
# 親：不動産
# 子：

# 建物
# 親：不動産
# 子：

# 区分建物
# 親：不動産
# 子：敷地

# 敷地
# 親：区分建物
# 子：

# 申請情報
# 親：ユーザー
# 子：被相続人、相続人、不動産  
    