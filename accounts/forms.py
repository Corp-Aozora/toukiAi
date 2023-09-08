from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from toukiApp.company_data import Service
from django.utils import timezone
from .models import *
from allauth.account.forms import SignupForm, LoginForm

CustomUser = get_user_model()

# 新規登録
class CustomSignupForm(SignupForm):
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.fields['email'].widget.attrs.update({'tabindex': '1'})
        self.fields['email'].widget.attrs.update({'class': 'form-control rounded-end'})
        self.fields['email'].widget.attrs.update({'autocomplete': 'on'})
        self.fields['email'].widget.attrs.update({"placeholder": "例）tatsuya@xxxx.com"})
        self.fields['email'].widget.attrs.update({"autofocu": True})
        
        self.fields['password1'].widget.attrs.update({'tabindex': '2'})
        self.fields['password1'].widget.attrs.update({'class': 'form-control rounded-end'})
        self.fields['password1'].widget.attrs.update({'autocomplete': 'on'})
        self.fields['password1'].widget.attrs.update({"placeholder": "半角で英数記号を含む8文字以上"})
        
        self.fields['password2'].widget.attrs.update({'tabindex': '3'})
        self.fields['password2'].widget.attrs.update({'class': 'form-control rounded-end'})
        self.fields['password2'].widget.attrs.update({'autocomplete': 'on'})
        self.fields['password2'].widget.attrs.update({'placeholder': 'もう一度ご入力ください'})
        self.fields['password2'].widget.attrs.update({"maxlength": "0"})
        
class CustomLoginForm(LoginForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.error_messages["invalid_login"] = "・メールアドレス又はパスワードが登録されたものと一致しません。\n・英語は大文字と小文字を区別します。"                
        self.fields["login"].widget.attrs.update({"class": "form-control", "placeholder": "ご登録時に使用したメールアドレス"})
        self.fields["password"].widget.attrs.update({"class": "form-control", "placeholder": "半角で英数記号を含む8文字以上"})
        self.fields["remember"].widget.attrs.update({"class": "form-check-input ms-0 float-none"})