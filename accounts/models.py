from django.db import models
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core import validators
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import RegexValidator
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

import datetime

from common.validations import *
from toukiApp.common_model import *
    
class UserManager(BaseUserManager):
    """
    
        ターミナルでユーザーを作成するときに使用される
        
    """
    use_in_migrations = True

    def _create_user(self, username, email, password, **extra_fields):
        if not username:
            raise ValueError('名前を入力して下さい')
        
        if not email:
            raise ValueError('メールアドレスを入力して下さい')
        
        username = self.model.normalize_username(username)
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self.db)
        
        return user
    
    def create_user(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        
        return self._create_user( username, email, password, **extra_fields)

    def create_superuser(self, username, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('is_staff=Trueである必要があります。')
        
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('is_superuser=Trueである必要があります。')
        
        return self._create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    """
    
        会員情報

    """
    username = models.CharField(verbose_name="氏名", max_length=30, validators=[JapaneseOnlyValidator()], unique=False, default="")
    address = models.CharField(verbose_name="住所", max_length=100, default="")
    email = models.EmailField(verbose_name="メールアドレス", unique=True)
    phone_number = models.CharField(verbose_name="電話番号", validators=[validate_no_hyphen_phone_number], max_length=11, default="")
    
    basic_date = models.DateTimeField(verbose_name="システムの有料版の利用開始日", null=True, blank=True)
    option1_date = models.DateTimeField(verbose_name="戸籍取得代行の利用開始日", null=True, blank=True)
    option2_date = models.DateTimeField(verbose_name="司法書士紹介の利用開始日", null=True, blank=True)
    option3_date = models.DateTimeField(verbose_name="オプション3の利用開始日", null=True, blank=True)
    option4_date = models.DateTimeField(verbose_name="オプション4の利用開始日", null=True, blank=True)
    option5_date = models.DateTimeField(verbose_name="オプション5の利用開始日", null=True, blank=True)
    pay_amount = models.PositiveIntegerField(verbose_name="支払額", default=0)
    
    last_login_session_key = models.CharField(max_length=40, blank=True, null=True)
    
    is_staff = models.BooleanField(verbose_name="スタッフ権限", default=False)
    
    is_active = models.BooleanField(verbose_name="利用状況", default=True)
    
    last_update = models.DateTimeField(verbose_name="最終更新日", auto_now=True)
    date_joined = models.DateTimeField(verbose_name="利用開始日", auto_now_add=True)

    objects = UserManager()
    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ['username']

    fields = [
        "email",
        "username",
        "address",
        "phone_number",
        "password1",
        "password2"
    ]

    class Meta:
        verbose_name = _("ユーザー")
        verbose_name_plural = _("ユーザー")

    def clean(self):
        super().clean()
        self.email = self.__class__.objects.normalize_email(self.email)

    def email_user(self, subject, message, from_email=None, **kwargs):
        send_mail(subject, message, from_email, [self.email], **kwargs)
        
class OptionRequest(CommonModel):
    """
    
        オプションの利用申請データ

    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="ユーザー",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="option_request",
    )
    
    order_id = models.CharField(verbose_name="オーダーID", max_length=50, null=True, blank=True)
    transaction_id = models.CharField(verbose_name="トランザクションID", max_length=50, null=True, blank=True)
    access_id = models.CharField(verbose_name="取引ID", max_length=50, null=True, blank=True)
    recieved_date = models.DateTimeField(verbose_name="着金確認日", null=True, blank=True)
    is_card = models.BooleanField(verbose_name="カード決済", default=False)
    payer = models.CharField(verbose_name="支払名義人", max_length=30, validators=[validate_katakana], null=True, blank=True)
    basic = models.BooleanField(verbose_name="システムの有料版の申込み", default=False)
    option1 = models.BooleanField(verbose_name="戸籍取得代行の申込み", default=False)
    option2 = models.BooleanField(verbose_name="司法書士紹介の申込み", default=False)
    charge = models.CharField(verbose_name="支払額", max_length=7, default="０")
    terms_agreement = models.BooleanField(verbose_name="規約への同意", default=False)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "作成者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "option_request_created_by",
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name = "最終更新者",
        on_delete = models.CASCADE,
        null = False,
        blank = False,
        related_name = "option_request_update_by"
    )
    
    fields =[
        "is_card",
        "payer",
        "basic",
        "option1",
        "option2",
        "charge",
        "terms_agreement"
    ]
    
    class Meta:
        verbose_name = _("オプション利用申請")
        verbose_name_plural = _("オプション利用申請")
        
class EmailChange(models.Model):
    """
    
        メールアドレス変更申請データ

    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="ユーザー",
        on_delete=models.CASCADE,
        null = False,
        blank = False,
        related_name="EmailChange",
    )
    
    email = models.EmailField(verbose_name="変更後のメールアドレス", unique=True)
    token = models.CharField(verbose_name="トークン", max_length=100, unique=True)
    created_at = models.DateTimeField(verbose_name="作成日", auto_now_add=True)
    updated_at = models.DateTimeField(verbose_name="最終更新日", auto_now=True)
    
    fields =["email", "user", "token"]
    
    class Meta:
        verbose_name = _("メールアドレス変更申請")
        verbose_name_plural = _("メールアドレス変更申請")
        
class EmailVerification(models.Model):
    """

        メールアドレス認証
        
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name="ユーザー",
        on_delete=models.CASCADE,
        null = True,
        blank = True,
        related_name="email_verification_user",
    )
    
    session_id = models.CharField(verbose_name="セッションID", max_length=100)
    email = models.EmailField(verbose_name="メールアドレス")
    token = models.PositiveIntegerField(verbose_name="トークン", validators=[validate_four_digit_number])
    is_verified = models.BooleanField(verbose_name="認証結果", default=False)
    created_at = models.DateTimeField(verbose_name="作成日", auto_now_add=True)
        
    fields =[
        "session_id",
        "email",
        "token",
        "is_verified"
    ]    
    
    class Meta:
        verbose_name = _("メールアドレス認証")
        verbose_name_plural = _("メールアドレス認証")