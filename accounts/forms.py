from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from toukiApp.company_data import Service
from django.utils import timezone
from .models import *
from allauth.account.forms import SignupForm, LoginForm, ResetPasswordForm, ResetPasswordKeyForm, ChangePasswordForm, AddEmailForm

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
            'autocomplete': 'on',
            "placeholder": "半角で英数記号を含む8文字以上",
        })
        
        self.fields['password2'].widget.attrs.update({
            'class': 'form-control rounded-end',
            'placeholder': 'もう一度ご入力ください',
            "maxlength": "0",
        })

#ログイン       
class CustomLoginForm(LoginForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.error_messages["invalid_login"] = "・メールアドレス又はパスワードが登録されたものと一致しません。\n・英語は大文字と小文字を区別します。"                
        
        self.fields["login"].widget.attrs.update({
            "tabindex" : "1",
            "class": "form-control",
            "placeholder": "ご登録時に使用したメールアドレス",
        })
        
        self.fields["password"].widget.attrs.update({
            "tabindex": "2",
            "class": "form-control",
            "placeholder": "半角で英数記号を含む8文字以上"
        })
        self.fields["remember"].widget.attrs.update({
            "tabindex": "3",
            "class": "form-check-input ms-0 float-none"
        })

# パスワードの再設定申請       
class CustomResetPasswordForm(ResetPasswordForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.fields["email"].widget.attrs.update({
            "tabindex" : "1",
            "class": "form-control rounded-end",
            "placeholder": "ご登録時に使用したメールアドレス",
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
            "tabindex" : "1",
            "class": "form-control rounded-end",
            "placeholder": "半角英数記号を含むで8文字以上",
        })
        
        self.fields["password2"].widget.attrs.update({
            "tabindex" : "2",
            "class": "form-control rounded-end",
            "placeholder": "もう一度ご入力ください",
            "maxlength": "0",
        })
        
        self.fields["password2"].label = "再入力"
        
# パスワードの変更
class CustomChangePasswordForm(ChangePasswordForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        self.fields["oldpassword"].widget.attrs.update({
            "tabindex" : "1",
            "class": "form-control rounded-end",
            "placeholder": "現在のパスワード",
            "maxlength" :"30",
        })
                
        self.fields["password1"].widget.attrs.update({
            "tabindex" : "2",
            "class": "form-control rounded-end",
            "placeholder": "半角英数記号を含むで8文字以上",
            "maxlength" :"30",
        })
        
        self.fields["password2"].widget.attrs.update({
            "tabindex" : "3",
            "class": "form-control rounded-end",
            "placeholder": "もう一度ご入力ください",
            "maxlength": "0",
        })
        
        self.fields["password2"].label = "再入力"

# メールアドレスの変更
class ChangeEmailForm(forms.ModelForm):
    
    class Meta:
        model = EmailChange
        fields = model.fields
        labels = {"email":"メールアドレス"}

    def __init__(self, *args, **kwargs):
        self.base_fields['email'].widget.attrs.update({
            "tabindex" : "1",
            "class": "form-control rounded-end",
            "placeholder": "新しいメールアドレス",
        })
                
        super().__init__(*args, **kwargs)
