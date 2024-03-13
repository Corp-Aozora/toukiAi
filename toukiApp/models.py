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
from .landCategorys import *
from accounts.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.validators import MinValueValidator, MaxValueValidator

# お問い合わせ内容
# 質問者のメールアドレス/件名/質問内容/回答内容/回答者/質問日/回答日
class OpenInquiry(CommonModel):
    created_by = models.EmailField(verbose_name="メールアドレス")
    subject_list = (
        ("サポート内容", "サポート内容"),
        ("料金", "料金"),
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
        related_name="decedent",
    )
    progress = models.DecimalField(verbose_name="進捗", null=False, blank=False, default=1, max_digits=3, decimal_places=1, validators=[MinValueValidator(1.0), MaxValueValidator(6.0)])
    name = models.CharField(verbose_name="氏名", max_length=30, default="")
    domicile_prefecture = models.CharField(verbose_name="本籍地の都道府県" ,max_length=20, choices=PREFECTURES, default=None, null=True, blank=True)
    domicile_city = models.CharField(verbose_name="本籍地の市区町村", max_length=100, default=None, null=True, blank=True)
    domicile_address = models.CharField(verbose_name="本籍地の町域・番地", max_length=100, default="", null=True, blank=True)
    prefecture = models.CharField(verbose_name="住所の都道府県", max_length=20, choices=PREFECTURES, default=None, null=True, blank=True)
    city = models.CharField(verbose_name="住所の市区町村", max_length=100, default=None, null=True, blank=True)
    address = models.CharField(verbose_name="住所の町域・番地", max_length=100, default="", null=True, blank=True)
    bldg = models.CharField(verbose_name="住所の建物", max_length=100, default="", null=True, blank=True)
    death_year = models.CharField(verbose_name="死亡年", max_length=20, choices=CustomDateReturn.years_with_jc, default=None, null=True, blank=True)
    death_month = models.CharField(verbose_name="死亡月", max_length=2, choices=CustomDateReturn.months, default=None, null=True, blank=True)
    death_date = models.CharField(verbose_name="死亡日", max_length=2, choices=CustomDateReturn.days, default=None, null=True, blank=True)
    birth_year = models.CharField(verbose_name="誕生年", max_length=20, choices=CustomDateReturn.years_with_jc, default=None, null=True, blank=True)
    birth_month = models.CharField(verbose_name="誕生月", max_length=2, choices=CustomDateReturn.months, default=None, null=True, blank=True)
    birth_date = models.CharField(verbose_name="誕生日", max_length=2, choices=CustomDateReturn.days, default=None, null=True, blank=True)
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
    
    step_one_fields =[
        "progress", 
        "user", 
        "name", 
        "death_year", 
        "death_month", 
        "prefecture", 
        "city", 
        "domicile_prefecture", 
        "domicile_city"
    ]
    
    step_three_fields =[
        "progress",
        "user",
        "name",
        "death_year",
        "death_month",
        "death_date",
        "birth_year",
        "birth_month",
        "birth_date",
        "prefecture",
        "city",
        "address",
        "bldg",
        "domicile_prefecture",
        "domicile_city",
        "domicile_address",
    ]
    
    class Meta:
        verbose_name = _("被相続人")
        verbose_name_plural = _("被相続人")
        
class RegistryNameAndAddress(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="registry_name_and_address",
    )
    name = models.CharField(verbose_name="氏名", max_length=30, default="")
    prefecture = models.CharField(verbose_name="登記上の都道府県", max_length=20, choices=PREFECTURES, default=None, null=True, blank=True)
    city = models.CharField(verbose_name="登記上の市区町村", max_length=100, default=None, null=True, blank=True)
    address = models.CharField(verbose_name="登記上の町域・番地", max_length=100, default="", null=True, blank=True)
    bldg = models.CharField(verbose_name="登記上の建物", max_length=100, default="", null=True, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "registry_name_and_address_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "registry_name_and_address_update_by",
    )
    
    step_three_fields=[
        "name",
        "prefecture",
        "city",
        "address",
        "bldg",
    ]
    
    class Meta:
        verbose_name = _("登記簿上の住所氏名")
        verbose_name_plural = _("登記簿上の住所")

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
    name = models.CharField(verbose_name="氏名", max_length=30, default="", null=True, blank=True)
    is_heir = models.BooleanField(verbose_name="相続人", null=True, blank=True, default=None)
    is_refuse = models.BooleanField(verbose_name="相続放棄", null=True, blank=True, default=None)
    is_exist = models.BooleanField(verbose_name="死亡時存在", null=True, blank=True, default=None)
    is_live = models.BooleanField(verbose_name="手続時存在", null=True, blank=True, default=None)
    is_japan = models.BooleanField(verbose_name="日本在住", null=True, blank=True, default=None)
    prefecture = models.CharField(verbose_name="住所の都道府県", max_length=20, choices=PREFECTURES, default=None, null=True, blank=True)
    city = models.CharField(verbose_name="住所の市区町村", max_length=100, default="", null=True, blank=True)
    address = models.CharField(verbose_name="住所の町域・番地", max_length=100, default="", null=True, blank=True)
    bldg = models.CharField(verbose_name="住所の建物", max_length=100, default="", null=True, blank=True)
    death_year = models.CharField(verbose_name="死亡年", max_length=20, choices=CustomDateReturn.years_with_jc, default=None, null=True, blank=True)
    death_month = models.CharField(verbose_name="死亡月", max_length=2, choices=CustomDateReturn.months, default=None, null=True, blank=True)
    death_date = models.CharField(verbose_name="死亡日", max_length=2, choices=CustomDateReturn.days, default=None, null=True, blank=True)
    birth_year = models.CharField(verbose_name="誕生年", max_length=20, choices=CustomDateReturn.years_with_jc, default=None, null=True, blank=True)
    birth_month = models.CharField(verbose_name="誕生月", max_length=2, choices=CustomDateReturn.months, default=None, null=True, blank=True)
    birth_date = models.CharField(verbose_name="誕生日", max_length=2, choices=CustomDateReturn.days, default=None, null=True, blank=True)
    is_acquire = models.BooleanField(verbose_name="不動産取得", null=True, blank=True, default=None)
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
    
    step_one_fields = [
        "decedent",
        "content_type",
        "object_id",
        "name",
        "is_exist",
        "is_live",
        "is_heir",
        "is_refuse",
        "is_japan"
    ]
    
    step_three_fields = [
        "decedent",
        "name",
        "death_year",
        "death_month",
        "death_date",
        "birth_year",
        "birth_month",
        "birth_date",
        "is_acquire",
        "prefecture",
        "city",
        "address",
        "bldg",
        "is_refuse",
        "is_japan",
        "content_type",
        "object_id",
        "is_exist",
        "is_live",
        "is_heir",
    ]
    
    class Meta:
        verbose_name = _("配偶者")
        verbose_name_plural = _("配偶者")

# 卑属共通
# 親キーとして被相続人のidを取得する
class DescendantCommon(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="descendant_common",
    )
    is_exist = models.BooleanField(verbose_name="死亡時存在", null=True, blank=True, default=None)
    count = models.IntegerField(verbose_name="子の数", default=0, null=True, blank=True)
    is_same_parents = models.BooleanField(verbose_name="同じ両親", null=True, blank=True, default=None)
    is_live = models.BooleanField(verbose_name="手続時存在", null=True, blank=True, default=None)
    is_refuse = models.BooleanField(verbose_name="相続放棄", null=True, blank=True, default=None)
    is_adult = models.BooleanField(verbose_name="成人", null=True, blank=True, default=None)
    is_japan = models.BooleanField(verbose_name="日本在住", null=True, blank=True, default=None)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "descendant_common_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "descendant_common_update_by"
        
    )
    
    step_one_fields = ["decedent", "is_exist", "count", "is_same_parents", "is_live", "is_refuse", "is_adult", "is_japan"]
    
    class Meta:
        verbose_name = _("卑属共通")
        verbose_name_plural = _("卑属共通")

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
    content_type1 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="descendant1", verbose_name="親1", null=True, blank=True)
    object_id1 = models.PositiveIntegerField(verbose_name="親1id", null=True, blank=True)
    content_object1 = GenericForeignKey('content_type1', 'object_id1')
    content_type2 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="descendant2", verbose_name="親2", null=True, blank=True)
    object_id2 = models.PositiveIntegerField(verbose_name="親2id", null=True, blank=True)
    content_object2 = GenericForeignKey('content_type2', 'object_id2')
    name = models.CharField(verbose_name="氏名", max_length=30, default="", null=True, blank=True)
    is_heir = models.BooleanField(verbose_name="相続人", null=True, blank=True, default=None)
    is_refuse = models.BooleanField(verbose_name="相続放棄", null=True, blank=True, default=None)
    is_exist = models.BooleanField(verbose_name="死亡時存在", null=True, blank=True, default=None)
    is_live = models.BooleanField(verbose_name="手続時存在", null=True, blank=True, default=None)
    is_japan = models.BooleanField(verbose_name="日本在住", null=True, blank=True, default=None)
    is_adult = models.BooleanField(verbose_name="成人", null=True, blank=True, default=None)
    prefecture = models.CharField(verbose_name="住所の都道府県", max_length=20, choices=PREFECTURES, default=None, null=True, blank=True)
    city = models.CharField(verbose_name="住所の市区町村", max_length=100, default="", null=True, blank=True)
    address = models.CharField(verbose_name="住所の町域・番地", max_length=100, default="", null=True, blank=True)
    bldg = models.CharField(verbose_name="住所の建物", max_length=100, default="", null=True, blank=True)
    death_year = models.CharField(verbose_name="死亡年", max_length=20, choices=CustomDateReturn.years_with_jc, default=None, null=True, blank=True)
    death_month = models.CharField(verbose_name="死亡月", max_length=2, choices=CustomDateReturn.months, default=None, null=True, blank=True)
    death_date = models.CharField(verbose_name="死亡日", max_length=2, choices=CustomDateReturn.days, default=None, null=True, blank=True)
    birth_year = models.CharField(verbose_name="誕生年", max_length=20, choices=CustomDateReturn.years_with_jc, default=None, null=True, blank=True)
    birth_month = models.CharField(verbose_name="誕生月", max_length=2, choices=CustomDateReturn.months, default=None, null=True, blank=True)
    birth_date = models.CharField(verbose_name="誕生日", max_length=2, choices=CustomDateReturn.days, default=None, null=True, blank=True)
    is_acquire = models.BooleanField(verbose_name="不動産取得", null=True, blank=True, default=None)
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
    
    step_one_fields = [
        "content_type1",
        "object_id1",
        "content_type2",
        "object_id2",
        "name",
        "decedent",
        "is_live",
        "is_exist",
        "is_refuse",
        "is_adult",
        "is_japan",
        "is_heir",
    ]
    
    step_three_fields = [
        "decedent",
        "name",
        "death_year",
        "death_month",
        "death_date",
        "birth_year",
        "birth_month",
        "birth_date",
        "is_acquire",
        "prefecture",
        "city",
        "address",
        "bldg",
        "is_refuse",
        "is_japan",
        "is_adult",
        "content_type1",
        "object_id1",
        "content_type2",
        "object_id2",
        "is_exist",
        "is_live",
        "is_heir",
    ]
    
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
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, verbose_name="子", null=True, blank=True)
    object_id = models.PositiveIntegerField(verbose_name="子id", null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    name = models.CharField(verbose_name="氏名", max_length=30, default="", null=True, blank=True)
    is_heir = models.BooleanField(verbose_name="相続人", null=True, blank=True, default=None)
    is_refuse = models.BooleanField(verbose_name="相続放棄", null=True, blank=True, default=None)
    is_exist = models.BooleanField(verbose_name="死亡時存在", null=True, blank=True, default=None)
    is_live = models.BooleanField(verbose_name="手続時存在", null=True, blank=True, default=None)
    is_japan = models.BooleanField(verbose_name="日本在住", null=True, blank=True, default=None)
    prefecture = models.CharField(verbose_name="住所の都道府県", max_length=20, choices=PREFECTURES, default=None, null=True, blank=True)
    city = models.CharField(verbose_name="住所の市区町村", max_length=100, default="", null=True, blank=True)
    address = models.CharField(verbose_name="住所の町域・番地", max_length=100, default="", null=True, blank=True)
    bldg = models.CharField(verbose_name="住所の建物", max_length=100, default="", null=True, blank=True)
    death_year = models.CharField(verbose_name="死亡年", max_length=20, choices=CustomDateReturn.years_with_jc, default=None, null=True, blank=True)
    death_month = models.CharField(verbose_name="死亡月", max_length=2, choices=CustomDateReturn.months, default=None, null=True, blank=True)
    death_date = models.CharField(verbose_name="死亡日", max_length=2, choices=CustomDateReturn.days, default=None, null=True, blank=True)
    birth_year = models.CharField(verbose_name="誕生年", max_length=20, choices=CustomDateReturn.years_with_jc, default=None, null=True, blank=True)
    birth_month = models.CharField(verbose_name="誕生月", max_length=2, choices=CustomDateReturn.months, default=None, null=True, blank=True)
    birth_date = models.CharField(verbose_name="誕生日", max_length=2, choices=CustomDateReturn.days, default=None, null=True, blank=True)
    is_acquire = models.BooleanField(verbose_name="不動産取得", null=True, blank=True, default=None)
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
    
    step_one_fields = [
        "content_type",
        "object_id",
        "name",
        "decedent",
        "is_live",
        "is_exist",
        "is_refuse",
        "is_japan",
        "is_heir",
    ]
    
    step_three_fields = [
        "decedent",
        "name",
        "death_year",
        "death_month",
        "death_date",
        "birth_year",
        "birth_month",
        "birth_date",
        "is_acquire",
        "prefecture",
        "city",
        "address",
        "bldg",
        "is_refuse",
        "is_japan",
        "content_type",
        "object_id",
        "is_exist",
        "is_live",
        "is_heir",
    ]
    
    class Meta:
        verbose_name = _("尊属")
        verbose_name_plural = _("尊属")

# 傍系共通
# 親キーとして被相続人のidを取得する
class CollateralCommon(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="collateral_common",
    )
    is_exist = models.BooleanField(verbose_name="死亡時存在", null=True, blank=True, default=None)
    count = models.IntegerField(verbose_name="兄弟姉妹の数", null=True, blank=True, default=0)
    is_same_parents = models.BooleanField(verbose_name="同じ両親", null=True, blank=True, default=None)
    is_live = models.BooleanField(verbose_name="手続時存在", null=True, blank=True, default=None)
    is_refuse = models.BooleanField(verbose_name="相続放棄", null=True, blank=True, default=None)
    is_adult = models.BooleanField(verbose_name="成人", null=True, blank=True, default=None)
    is_japan = models.BooleanField(verbose_name="日本在住", null=True, blank=True, default=None)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "collateral_common_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "collateral_common_update_by"
        
    )
    
    step_one_fields = ["decedent", "is_exist", "count", "is_same_parents", "is_live", "is_refuse", "is_adult", "is_japan"]
    
    class Meta:
        verbose_name = _("傍系共通")
        verbose_name_plural = _("傍系共通")

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
    content_type1 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="collateral1", verbose_name="親1", null=True, blank=True)
    object_id1 = models.PositiveIntegerField(verbose_name="親1id", null=True, blank=True)
    content_object1 = GenericForeignKey('content_type1', 'object_id1')
    content_type2 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="collateral2", verbose_name="親2", null=True, blank=True)
    object_id2 = models.PositiveIntegerField(verbose_name="親2id", null=True, blank=True)
    content_object2 = GenericForeignKey('content_type2', 'object_id2')
    name = models.CharField(verbose_name="氏名", max_length=30, default="", null=True, blank=True)
    is_heir = models.BooleanField(verbose_name="相続人", null=True, blank=True, default=None)
    is_refuse = models.BooleanField(verbose_name="相続放棄", null=True, blank=True, default=None)
    is_exist = models.BooleanField(verbose_name="死亡時存在", null=True, blank=True, default=None)
    is_live = models.BooleanField(verbose_name="手続時存在", null=True, blank=True, default=None)
    is_japan = models.BooleanField(verbose_name="日本在住", null=True, blank=True, default=None)
    is_adult = models.BooleanField(verbose_name="成人", null=True, blank=True, default=None)
    prefecture = models.CharField(verbose_name="住所の都道府県", max_length=20, choices=PREFECTURES, default=None, null=True, blank=True)
    city = models.CharField(verbose_name="住所の市区町村", max_length=100, default="", null=True, blank=True)
    address = models.CharField(verbose_name="住所の町域・番地", max_length=100, default="", null=True, blank=True)
    bldg = models.CharField(verbose_name="住所の建物", max_length=100, default="", null=True, blank=True)
    death_year = models.CharField(verbose_name="死亡年", max_length=20, choices=CustomDateReturn.years_with_jc, default=None, null=True, blank=True)
    death_month = models.CharField(verbose_name="死亡月", max_length=2, choices=CustomDateReturn.months, default=None, null=True, blank=True)
    death_date = models.CharField(verbose_name="死亡日", max_length=2, choices=CustomDateReturn.days, default=None, null=True, blank=True)
    birth_year = models.CharField(verbose_name="誕生年", max_length=20, choices=CustomDateReturn.years_with_jc, default=None, null=True, blank=True)
    birth_month = models.CharField(verbose_name="誕生月", max_length=2, choices=CustomDateReturn.months, default=None, null=True, blank=True)
    birth_date = models.CharField(verbose_name="誕生日", max_length=2, choices=CustomDateReturn.days, default=None, null=True, blank=True)
    is_acquire = models.BooleanField(verbose_name="不動産取得", null=True, blank=True, default=None)
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
    
    step_one_fields = [
        "content_type1", 
        "object_id1", 
        "content_type2", 
        "object_id2", 
        "name", 
        "decedent",
        "is_live",
        "is_exist",
        "is_refuse", 
        "is_adult",
        "is_japan",
        "is_heir",
    ]
    
    step_three_fields = [
        "decedent",
        "name",
        "death_year",
        "death_month",
        "death_date",
        "birth_year",
        "birth_month",
        "birth_date",
        "is_acquire",
        "prefecture",
        "city",
        "address",
        "bldg",
        "is_refuse",
        "is_japan",
        "is_adult",
        "content_type1",
        "object_id1",
        "content_type2",
        "object_id2",
        "is_exist",
        "is_live",
        "is_heir",
    ]
    
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

# アップロードされるファイルを5MBかつpdf形式に制限する
def validate_file(value):
    filesize = value.size
    if filesize > 5000000:
        raise ValidationError("アップロード可能なサイズは5MBまでです。")
    valid_extensions = ['pdf']
    if not value.name.endswith(tuple(valid_extensions)):
        raise ValidationError("無効なファイル形式です。PDFファイルのみアップロード可能です。")
    return value

# 登記情報
# 親：被相続人
class Register(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="register",
    )
    
    title = models.CharField(verbose_name="タイトル", max_length=100, null=False, blank=False, default="")
    path = models.CharField(verbose_name="パス", max_length=100, null=False, blank=False, default="")
    file_size = models.IntegerField(verbose_name="サイズ",null=False, blank=False)
    extension = models.CharField(verbose_name="拡張子", max_length=100 ,null=False, blank=False, default="pdf")
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "register_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "register_update_by"
    )
    
    step_two_fields = []
    
    class Meta:
        verbose_name = _("不動産登記簿")
        verbose_name_plural = _("不動産登記簿")

# 遺産分割方法
class TypeOfDivision(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="type_of_division",
    )
    TYPE_OF_DIVISION_CHOICES = [
        ('通常', '通常'),
        ('換価分割', '換価分割'),
    ]
    type_of_division = models.CharField(verbose_name="遺産分割協議書の種類", max_length=30, choices=TYPE_OF_DIVISION_CHOICES, null=True, blank=True)
    PROPERTY_ALLOCATION_CHOICES = [
        ('全て法定相続', '全て法定相続'),
        ('その他', 'その他'),
    ]
    property_allocation = models.CharField(verbose_name="不動産の分配方法", max_length=30, choices=PROPERTY_ALLOCATION_CHOICES, null=True, blank=True)
    content_type1 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="type_of_division1", verbose_name="不動産全取得者", null=True, blank=True)
    object_id1 = models.PositiveIntegerField(verbose_name="不動産全取得者id", null=True, blank=True)
    content_object1 = GenericForeignKey('content_type1', 'object_id1')
    CASH_ALLOCATION_CHOICES = [
        ('全て一人', '全て一人'),
        ('全て法定相続', '全て法定相続'),
        ('その他', 'その他'),
    ]
    cash_allocation = models.CharField(verbose_name="換価した金銭の分配方法", max_length=30, choices=CASH_ALLOCATION_CHOICES, null=True, blank=True)
    content_type2 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="type_of_division2", verbose_name="金銭全取得者", null=True, blank=True)
    object_id2 = models.PositiveIntegerField(verbose_name="金銭全取得者id", null=True, blank=True)
    content_object2 = GenericForeignKey('content_type2', 'object_id2')
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "type_of_division_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "type_of_division_update_by"
    )
    
    step_three_fields = [
        "decedent",
        "type_of_division",
        "property_allocation",
        "content_type1",
        "object_id1",
        "cash_allocation",
        "content_type2",
        "object_id2",
    ]
    
    class Meta:
        verbose_name = _("遺産分割方法")
        verbose_name_plural = _("遺産分割方法")

# 不動産の数
# 親：被相続人
class NumberOfProperties(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="number_of_properties",
    )
    land = models.IntegerField(verbose_name="土地の数", null=True, blank=True, default=0)
    house = models.IntegerField(verbose_name="建物の数", null=True, blank=True, default=0)
    bldg = models.IntegerField(verbose_name="区分建物の数", null=True, blank=True, default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "number_of_properties_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "number_of_properties_update_by"
    )
    
    step_three_fields = [
        "decedent",
        "land",
        "house",
        "bldg",
    ]
    
    class Meta:
        verbose_name = _("不動産の数")
        verbose_name_plural = _("不動産の数")

# 土地
# 親：被相続人
class Land(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="land",
    )
    register = models.ForeignKey(
        Decedent,
        verbose_name="不動産登記簿",
        on_delete=models.CASCADE,
        null = True,
        blank = True,
        related_name="land_register",
    )
    number = models.CharField(verbose_name="不動産番号", max_length=100, null=False, blank=False, default="")
    address = models.CharField(verbose_name="所在地", max_length=100, null=True, blank=True, default="")
    land_number = models.CharField(verbose_name="地番", max_length=100, null=True, blank=True, default="")
    type = models.CharField(verbose_name="地目", max_length=100, choices=LANDCATEGORYS , null=True, blank=True, default="")
    size = models.CharField(verbose_name="地積", max_length=100, null=True, blank=True, default="")
    purparty = models.CharField(verbose_name="持ち分", max_length=100, null=False, blank=False, default="")
    price = models.CharField(verbose_name="固定資産評価額", max_length=13, null=False, blank=False, default="")
    is_exchange = models.BooleanField(verbose_name="換価対象", null=True, blank=True, default=None)
    office = models.CharField(verbose_name="法務局", max_length=30, null=True, blank=True, default="")
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "land_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "land_update_by"
    )
    
    step_three_fields = [
        "decedent",
        "register",
        "number",
        "address",
        "land_number",
        "type",
        "size",
        "purparty",
        "office",
        "price",
        "is_exchange",
    ]
    
    class Meta:
        verbose_name = _("土地")
        verbose_name_plural = _("土地")

# 建物
# 親：被相続人
class House(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="house",
    )
    register = models.ForeignKey(
        Decedent,
        verbose_name="不動産登記簿",
        on_delete=models.CASCADE,
        null = True,
        blank = True,
        related_name="house_register",
    )
    number = models.CharField(verbose_name="不動産番号", max_length=100, null=False, blank=False, default="")
    address = models.CharField(verbose_name="所在地", max_length=100, null=True, blank=True, default="")
    house_number = models.CharField(verbose_name="家屋番号", max_length=100, null=True, blank=True, default="")
    purpose = models.CharField(verbose_name="種類", max_length=100, null=True, blank=True, default="")
    type = models.CharField(verbose_name="構造", max_length=100, null=True, blank=True, default="")
    first_floor_size = models.CharField(verbose_name="１階面積", max_length=100, null=True, blank=True, default="")
    second_floor_size = models.CharField(verbose_name="２階面積", max_length=100, null=True, blank=True, default="")
    third_floor_size = models.CharField(verbose_name="３階面積", max_length=100, null=True, blank=True, default="")
    fourth_floor_size = models.CharField(verbose_name="４階面積", max_length=100, null=True, blank=True, default="")
    fifth_floor_size = models.CharField(verbose_name="５階面積", max_length=100, null=True, blank=True, default="")
    purparty = models.CharField(verbose_name="持ち分", max_length=100 ,null=False, blank=False, default="")
    price = models.CharField(verbose_name="固定資産評価額", max_length=13, null=False, blank=False, default="")
    is_exchange = models.BooleanField(verbose_name="換価対象", null=True, blank=True, default=None)
    office = models.CharField(verbose_name="法務局", max_length=30, null=True, blank=True, default="")
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "house_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "house_update_by"
    )
    
    step_three_fields = [
        "decedent",
        "register",
        "number",
        "address",
        "house_number",
        "purpose",
        "type",
        "first_floor_size",
        "second_floor_size",
        "third_floor_size",
        "fourth_floor_size",
        "fifth_floor_size",
        "purparty",
        "office",
        "price",
        "is_exchange",        
    ]
    
    class Meta:
        verbose_name = _("建物")
        verbose_name_plural = _("建物")

#敷地権
class Site(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="site",
    )
    house = models.ForeignKey(
        Decedent,
        verbose_name="建物",
        on_delete=models.CASCADE,
        null = True,
        blank = True,
        related_name="site_house",
    )
    land_num = models.IntegerField(verbose_name="土地の符号", null=True, blank=True, default="")
    land_type = models.CharField(verbose_name="敷地権の種類", null=True, blank=True, default="")
    land_purparty = models.CharField(verbose_name="敷地権の割合", null=True, blank=True, default="")
    price = models.CharField(verbose_name="固定資産評価額", max_length=13,null=False, blank=False, default="")
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "site_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "site_update_by"
    )
    
    step_three_fields = []
    
    class Meta:
        verbose_name = _("敷地")
        verbose_name_plural = _("敷地")

# 関係者
class RelatedIndividual(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="related_indivisual",
    )
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, verbose_name="卑属又は傍系")
    object_id = models.PositiveIntegerField(verbose_name="卑属又は傍系のid")
    content_object = GenericForeignKey('content_type', 'object_id')
    name = models.CharField(verbose_name="氏名", max_length=30, default="")
    relationship = models.CharField(verbose_name="続柄", max_length=30, default="")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "related_indivisual_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "related_indivisual_update_by"
    )
    
    step_three_fields = []
    
    class Meta:
        verbose_name = _("関係者")
        verbose_name_plural = _("関係者")

# 不動産取得者
class PropertyAcquirer(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="property_acquirer",
    )
    content_type1 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="property_acquirer1", verbose_name="不動産", null=True, blank=True)
    object_id1 = models.PositiveIntegerField(verbose_name="不動産id", null=True, blank=True)
    content_object1 = GenericForeignKey('content_type1', 'object_id1')
    content_type2 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="property_acquirer2", verbose_name="相続人", null=True, blank=True)
    object_id2 = models.PositiveIntegerField(verbose_name="相続人id", null=True, blank=True)
    content_object2 = GenericForeignKey('content_type2', 'object_id2')
    percentage = models.CharField(verbose_name="取得割合", max_length=100 ,null=False, blank=False, default="")
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "property_acquirer_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "property_acquirer_update_by"
    )
    
    step_three_fields = [
        "decedent",
        "content_type1",
        "object_id1",
        "content_type2",
        "object_id2",
        "percentage",
    ]
    
    class Meta:
        verbose_name = _("不動産の取得者")
        verbose_name_plural = _("不動産の取得者")

#金銭取得者     
class CashAcquirer(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="cash_acquirer",
    )
    content_type1 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="cash_acquirer1", verbose_name="不動産", null=True, blank=True)
    object_id1 = models.PositiveIntegerField(verbose_name="不動産id", null=True, blank=True)
    content_object1 = GenericForeignKey('content_type1', 'object_id1')
    content_type2 = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="cash_acquirer2", verbose_name="相続人", null=True, blank=True)
    object_id2 = models.PositiveIntegerField(verbose_name="相続人id", null=True, blank=True)
    content_object2 = GenericForeignKey('content_type2', 'object_id2')
    percentage = models.CharField(verbose_name="取得割合", max_length=100 ,null=False, blank=False, default="")
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "cash_acquirer_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "cash_acquirer_update_by"
    )
    
    step_three_fields = [
        "decedent",
        "content_type1",
        "object_id1",
        "content_type2",
        "object_id2",
        "percentage",
    ]
    
    class Meta:
        verbose_name = _("金銭の取得者")
        verbose_name_plural = _("金銭の取得者")
        
# 申請情報
class Application(CommonModel):
    decedent = models.ForeignKey(
        Decedent,
        verbose_name="被相続人",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="application",
    )
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name="application_content_type", verbose_name="申請人", null=True, blank=True)
    object_id = models.PositiveIntegerField(verbose_name="申請人id", null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    is_agent = models.BooleanField(verbose_name="代理人の有無", null=True, blank=True, default=None)
    agent_name = models.CharField(verbose_name="代理人氏名", max_length=30 ,null=True, blank=True, default="")
    agent_address = models.CharField(verbose_name="代理人住所", max_length=100 ,null=True, blank=True, default="")
    agent_phone_number = models.CharField(verbose_name="代理人電話番号", max_length=13 ,null=True, blank=True, default="")
    is_return = models.BooleanField(verbose_name="原本還付の有無", null=True, blank=True, default=None)
    is_mail = models.BooleanField(verbose_name="郵送の有無", null=True, blank=True, default=None) 
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "application_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "application_update_by"
    )
    
    step_three_fields = [
        "decedent",
        "content_type",
        "object_id",
        "is_agent",
        "agent_name",
        "agent_address",
        "agent_phone_number",
        "is_return",
        "is_mail",
    ]
    
    class Meta:
        verbose_name = _("申請情報")
        verbose_name_plural = _("申請情報")
        
# 法務局
class Office(CommonModel):
    code = models.CharField(verbose_name="コード", max_length=4 ,null=False, blank=False, default="")
    office_name = models.CharField(verbose_name="名称", max_length=30 ,null=False, blank=False, default="")
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "office_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "office_update_by"
    )
    
    class Meta:
        verbose_name = _("法務局")
        verbose_name_plural = _("法務局")