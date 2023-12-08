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
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# お問い合わせ内容
# 質問者のメールアドレス/件名/質問内容/回答内容/回答者/質問日/回答日
class OpenInquiry(CommonModel):
    created_by = models.EmailField(verbose_name="メールアドレス")
    subject_list = (
        ("サポート内容", "サポート内容"),
        ("オプション", "オプション"),
        ("提携司法書士", "提携司法書士"),
        ("運営者", "運営者"),
        ("その他", "その他"),
    )
    subject = models.CharField(verbose_name="件名", max_length=20, choices=subject_list, null=False, blank=False)
    content = models.TextField(verbose_name="内容", max_length=300, null=False, blank=False)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終回答者",
        on_delete = models.CASCADE,
        null=True,
        blank=True,
        related_name = "open_inquiry_updated_by",
        limit_choices_to={"is_staff": True},
    )
    
    fields = ["created_by", "subject", "content"]
    
    class Meta:
        verbose_name = _("一般お問い合わせ")
        verbose_name_plural = _("一般お問い合わせ")

# 被相続人
# 親：ユーザー
# 子：親族、不動産
class Decedent(CommonModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="ユーザー",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="decedant",
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
        related_name = "decedent_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "decedent_update_by",
    )
    
    step_one_fields =["user", "name", "death_year", "death_month", "prefecture", "city", "domicile_prefecture", "domicile_city"]
    
    class Meta:
        verbose_name = _("被相続人")
        verbose_name_plural = _("被相続人")

# 配偶者
# 外部キー：被相続人、配偶者、卑属、尊属、傍系のいずれかのモデルとid
class Spouse(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="spouse",
    )
    content_type = models.ForeignKey(ContentType, verbose_name="配偶者", on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField(verbose_name="配偶者id")
    content_object = GenericForeignKey('content_type', 'object_id')
    name = models.CharField(verbose_name="氏名", max_length=30, blank=True, null=True)
    is_heir = models.BooleanField(verbose_name="相続人", default=False)
    is_refuse = models.BooleanField(verbose_name="相続放棄", null=True)
    is_exist = models.BooleanField(verbose_name="死亡時存在", null=True)
    is_live = models.BooleanField(verbose_name="手続時存在", null=True)
    is_japan = models.BooleanField(verbose_name="日本在住", null=True)
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
        related_name = "spouse_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "spouse_update_by"
    )
    
    step_one_fields = ["decedent", "content_type", "object_id", "name", "is_exist", "is_live", "is_heir", "is_refuse", "is_japan"]
    
    class Meta:
        verbose_name = _("配偶者")
        verbose_name_plural = _("配偶者")
        
# 卑属
# 外部キー２つ：被相続人、配偶者、卑属、尊属、傍系のいずれかのモデルとidが２つ
class Descendant(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="descendant",
    )
    content_type1 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="descendant1", verbose_name="親1")
    object_id1 = models.PositiveIntegerField(verbose_name="親1id")
    content_object1 = GenericForeignKey('content_type1', 'object_id1')
    content_type2 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="descendant2", verbose_name="親2")
    object_id2 = models.PositiveIntegerField(verbose_name="親2id")
    content_object2 = GenericForeignKey('content_type2', 'object_id2')
    name = models.CharField(verbose_name="氏名", max_length=30, default="")
    is_heir = models.BooleanField(verbose_name="相続人", default=False)
    is_refuse = models.BooleanField(verbose_name="相続放棄", null=True)
    is_exist = models.BooleanField(verbose_name="死亡時存在", null=True)
    is_live = models.BooleanField(verbose_name="手続時存在", null=True)
    is_japan = models.BooleanField(verbose_name="日本在住", null=True)
    is_adult = models.BooleanField(verbose_name="成人", null=True)
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
        related_name = "descendant_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "descendant_update_by"
        
    )
    
    step_one_fields = ["content_type1", "object_id1", "content_type2", "object_id2", "name", "decedent", "is_live", "is_exist", "is_refuse", "is_adult", "is_japan", "is_heir",]
    
    class Meta:
        verbose_name = _("卑属")
        verbose_name_plural = _("卑属")

# 尊属
# 外部キー１つ：子のモデルとid
class Ascendant(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="ascendant",
    )
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, verbose_name="子")
    object_id = models.PositiveIntegerField(verbose_name="子id")
    content_object = GenericForeignKey('content_type', 'object_id')
    name = models.CharField(verbose_name="氏名", max_length=30, default="")
    is_heir = models.BooleanField(verbose_name="相続人", default=False)
    is_refuse = models.BooleanField(verbose_name="相続放棄", null=True)
    is_exist = models.BooleanField(verbose_name="死亡時存在", null=True)
    is_live = models.BooleanField(verbose_name="手続時存在", null=True)
    is_japan = models.BooleanField(verbose_name="日本在住", null=True)
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
        related_name = "ascendant_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "ascendant_update_by"
    )
    
    step_one_fields = ["content_type", "object_id", "name", "decedent", "is_live", "is_exist", "is_refuse", "is_japan", "is_heir",]
    
    class Meta:
        verbose_name = _("尊属")
        verbose_name_plural = _("尊属")

# 傍系
# 外部キー２つ：被相続人、配偶者、卑属、尊属、傍系のいずれかのモデルとidが２つ
class Collateral(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="collateral",
    )
    content_type1 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="collateral1", verbose_name="親1")
    object_id1 = models.PositiveIntegerField(verbose_name="親1id")
    content_object1 = GenericForeignKey('content_type1', 'object_id1')
    content_type2 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="collateral2", verbose_name="親2")
    object_id2 = models.PositiveIntegerField(verbose_name="親2id")
    content_object2 = GenericForeignKey('content_type2', 'object_id2')
    name = models.CharField(verbose_name="氏名", max_length=30, default="")
    is_heir = models.BooleanField(verbose_name="相続人", default=False)
    is_refuse = models.BooleanField(verbose_name="相続放棄", null=True)
    is_exist = models.BooleanField(verbose_name="死亡時存在", null=True)
    is_live = models.BooleanField(verbose_name="手続時存在", null=True)
    is_japan = models.BooleanField(verbose_name="日本在住", null=True)
    is_adult = models.BooleanField(verbose_name="成人", null=True)
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
        related_name = "collateral_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "collateral_update_by"
    )
    
    step_one_fields = ["content_type1", "object_id1", "content_type2", "object_id2", "name", "decedent", "is_live", "is_exist", "is_refuse", "is_adult", "is_japan", "is_heir",]
    
    class Meta:
        verbose_name = _("傍系")
        verbose_name_plural = _("傍系")

# 更新情報
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
    
    def validate_staff(value):
        is_staff = User.objects.filter(pk = value).exists()
        
        if is_staff == False:
            raise ValidationError("スタッフ権限がありません", params={"value": value})

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
    