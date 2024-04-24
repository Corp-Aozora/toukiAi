from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model, authenticate
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
            "placeholder": "メールアドレス",
            "autofocus": True,
        })
        
        self.fields['password1'].widget.attrs.update({
            'class': 'form-control rounded-end',
            'autocomplete': 'off',
            "placeholder": "半角で英数記号を含む8文字以上",
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
            "placeholder": "登録したメールアドレス",
            'autocomplete': 'on',
        })
        
        self.fields["password"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "半角で英数記号を含む8文字以上",
            'autocomplete': 'off',
        })
        self.fields["remember"].widget.attrs.update({
            "class": "form-check-input ms-0 float-none"
        })

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
            "placeholder": "現在のパスワード",
            'autocomplete': 'off',
            "maxlength" :"30",
        })
                
        self.fields["password1"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "半角英数記号を含むで8文字以上",
            'autocomplete': 'off',
            "maxlength" :"30",
        })
        
        self.fields["password2"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "もう一度ご入力ください",
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
            "placeholder": "新しいメールアドレス",
            'autocomplete': 'off',
        })
        
        self.fields["current_email"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "現在のメールアドレス",
            'autocomplete': 'off',
        })
        
        self.fields["password"].widget.attrs.update({
            "class": "form-control rounded-end",
            "placeholder": "半角で英数記号を含む8文字以上",
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
            "placeholder": "半角で英数記号を含む8文字以上",
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