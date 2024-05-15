from allauth.account.forms import SignupForm, LoginForm, ResetPasswordForm, ResetPasswordKeyForm, ChangePasswordForm, AddEmailForm
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone

from toukiApp.company_data import *
from .models import *
from common.widgets import *
from common.utils import *

CustomUser = get_user_model()

# 新規登録
class CustomSignupForm(SignupForm):
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.fields['email'].widget.attrs.update({
            'class': 'form-control rounded-end',
            'autocomplete': 'on',
            "placeholder": "",
            "autofocus": True,
        })
        
        self.fields['password1'].widget.attrs.update({
            'class': 'form-control rounded-end',
            'autocomplete': 'off',
            "placeholder": "半角で英数記号3種類を含む8文字以上",
        })
        
        self.fields['password2'].widget.attrs.update({
            'class': 'form-control rounded-end',
            'placeholder': 'もう一度ご入力ください',
            'autocomplete': 'off',
            "maxlength": "0",
        })

#ログイン       
class CustomLoginForm(LoginForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.error_messages["invalid_login"] = "・メールアドレス又はパスワードが登録されたものと一致しません。\n・英語は大文字と小文字を区別します。"                
        
        self.fields["login"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "",
            'autocomplete': 'on',
        })
        
        self.fields["password"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "",
            'autocomplete': 'off',
        })
        self.fields["remember"].widget.attrs.update({
            "class": "form-check-input ms-0 float-none"
        })
        
        self.fields["remember"].label = "ログインを記憶"

# パスワードの再設定申請       
class CustomResetPasswordForm(ResetPasswordForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.fields["email"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "登録したメールアドレス",
            'autocomplete': 'on',
        })
        
    def save(self, request):
        input_email = self.cleaned_data["email"]
        
        if CustomUser.objects.filter(email = input_email).exists():
            super().save(request)
        
# パスワードの再設定       
class CustomResetPasswordKeyForm(ResetPasswordKeyForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.fields["password1"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "半角英数記号を含むで8文字以上",
            'autocomplete': 'off',
        })
        
        self.fields["password2"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "もう一度ご入力ください",
            'autocomplete': 'off',
            "maxlength": "0",
        })
        
        self.fields["password2"].label = "再入力"
        
# パスワードの変更
class CustomChangePasswordForm(ChangePasswordForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.fields["oldpassword"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "",
            'autocomplete': 'off',
            "maxlength" :"30",
        })
                
        self.fields["password1"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "半角で英数記号3種類を含む8文字以上",
            'autocomplete': 'off',
            "maxlength" :"30",
        })
        
        self.fields["password2"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "",
            'autocomplete': 'off',
            "maxlength": "0",
        })
        
        self.fields["password2"].label = "再入力"

# メールアドレスの変更
class ChangeEmailForm(forms.ModelForm):
    current_email = forms.EmailField(label="現在のメールアドレス")
    password = forms.CharField(label="パスワード", widget=forms.PasswordInput())
    
    class Meta:
        model = EmailChange
        fields = model.fields
        labels = {"email":"新しいメールアドレス"}

    def __init__(self, user, *args, **kwargs):
        
        self.user = user
        
        super().__init__(*args, **kwargs)
        
        self.fields['email'].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "",
            'autocomplete': 'off',
        })
        
        self.fields["current_email"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "",
            'autocomplete': 'off',
        })
        
        self.fields["password"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "半角で英数記号3種類を含む8文字以上",
            'autocomplete': 'off',
        })
    
    def clean(self):
        cleaned_data = super().clean()
        
        current_email = cleaned_data.get("current_email")
        new_email = cleaned_data.get("email")
        correct_email = self.user.email
        
        if User.objects.filter(email=new_email).exists():
            raise forms.ValidationError("新しいメールアドレスはすでに使用されています。")
        
        if current_email != correct_email:
            raise forms.ValidationError("入力されたメールアドレスがアカウントと一致しません。")
        
        password = cleaned_data.get("password")
        user = authenticate(email=correct_email, password=password)
        
        if user is None:
            raise forms.ValidationError("パスワードが正しくありません。")
        
        return cleaned_data

# アカウント削除
class DeleteAccountForm(forms.Form):
    email = forms.EmailField(label="メールアドレス")
    password = forms.CharField(label="パスワード", widget=forms.PasswordInput())
    
    def __init__(self, user, *args, **kwargs):
        
        self.user = user
        
        super().__init__(*args, **kwargs)
        
        self.fields["email"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "登録したメールアドレス",
            'autocomplete': 'off',
        })
        
        self.fields["password"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "半角で英数記号3種類を含む8文字以上",
            'autocomplete': 'off',
        })
    
    def clean(self):
        cleaned_data = super().clean()
        
        email = cleaned_data.get("email")
        if email != self.user.email:
            raise forms.ValidationError("入力されたメールアドレスがアカウントと一致しません。")
        
        password = cleaned_data.get("password")
        user = authenticate(email=self.user.email, password=password)
        
        if user is None:
            raise forms.ValidationError("パスワードが正しくありません。")
        
        return cleaned_data
    
class OptionSelectForm(forms.ModelForm):
    """"オプション選択フォーム"""
    
    class Meta:
        model = OptionRequest
        fields = model.fields
        labels = {
            "charge": "ご請求額"
        }
        
    def __init__(self, *args, **kwargs):
        # 支払済みデータ
        self.paid_option_and_amount = kwargs.pop("paid_option_and_amount", None)
        super().__init__(*args, **kwargs)
        
        self.fields["name"].widget.attrs.update(WidgetAttributes.name_normal)
        self.fields["name"].validators.append(JapaneseOnlyValidator()) # 日本語のみ検証
        
        self.fields["payer"].widget.attrs.update(WidgetAttributes.payer)
        self.fields["payer"].validators.append(validate_katakana) # カタカナのみ検証
        
        self.fields["address"].widget.attrs.update(WidgetAttributes.full_address_2)
        self.fields["address"].required = False
        
        self.fields["phone_number"].widget.attrs.update(WidgetAttributes.phone_number_no_hyphen)
        self.fields["phone_number"].validators.append(validate_no_hyphen_phone_number) # 10桁または11桁の全角数字検証
        
        self.fields["basic"].widget.attrs.update(WidgetAttributes.checkbox)
        self.fields["option1"].widget.attrs.update(WidgetAttributes.checkbox)
        self.fields["option2"].widget.attrs.update(WidgetAttributes.checkbox)
        self.fields["charge"].widget.attrs.update(WidgetAttributes.charge)
        
    def clean(self):
        cleaned_data = super().clean()
        
        # いずれかのオプションが選択されている
        if not any([cleaned_data.get("basic"), cleaned_data.get("option1"), cleaned_data.get("option2")]):
            raise ValidationError("オプションが選択されてません。")
        
        # 支払い済みのオプションと違うオプションが選択されている
        if cleaned_data.get("basic") == True and self.paid_option_and_amount["basic"] == True:
            raise ValidationError("システムの利用料はすでにお支払いいただいてます。")
            
        if cleaned_data.get("option1") == True and self.paid_option_and_amount["option1"] == True:
            raise ValidationError("戸籍取得代行の利用料すでにお支払いいただいてます。")

        if cleaned_data.get("option2") == True and self.paid_option_and_amount["option2"] == True:
            raise ValidationError("すでにお申し込みいただいてます。")
        
        # 選択と金額が一致している
        total_price = 0
        if cleaned_data.get("basic"):
            total_price += Service.CAMPAIGN_BASIC_PRICE_INT
        if cleaned_data.get("option1"):
            total_price += Service.CAMPAIGN_OPTION1_PRICE_INT
        
        # オプション２のときは、既払金額を差し引く
        if cleaned_data.get("option2"):
            total_price += Service.CAMPAIGN_OPTION2_PRICE_INT - self.paid_option_and_amount["charge"]
        
        # データとPOSTデータの請求額の一致を確認
        posted_charge = zenkaku_currency_to_int(cleaned_data.get("charge"))
        if posted_charge != total_price:
            raise ValidationError("ご請求額が登録されている金額データと一致しません。")
        
        # 住所 有料版以外のオプションが選択されているとき、入力が必須
        if (cleaned_data.get("option1") or cleaned_data.get("option2")) and cleaned_data.get("address") == "":
            raise ValidationError("住所を入力してください")
        
        return cleaned_data
        