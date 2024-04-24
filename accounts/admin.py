from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.utils.translation import gettext_lazy as _
from .models import *

class MyUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = '__all__'

class MyUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'email',)

class MyUserAdmin(UserAdmin):
    fieldsets = (
        (None, {'fields': ('username', 'email', "phone_number",'password', "basic", "option1", "option2", "option3", "option4", "option5", "payment", "pay_amount")}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                       'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', "last_update", 'date_joined')}),
    )
    
    readonly_fields = ("last_login", "last_update", "date_joined", "basic_date", "option1_date", "option2_date", "option3_date", "option4_date", "option5_date")
    
    # ユーザーを追加画面の入力欄
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', "is_staff", "is_superuser",'password1', 'password2'),
        }),
    )
    
    form = MyUserChangeForm
    add_form = MyUserCreationForm
    list_display = ("id", 'email', 'username', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups', "username", "email")
    search_fields = ('email', 'username')
    ordering = ('username',)

admin.site.register(User, MyUserAdmin)

# メールアドレス変更申請
class EmailChangeForm(forms.ModelForm):
    class Meta:
        model = EmailChange
        fields = '__all__'

class EmailChangeAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('user', "email", "token")}),
        (_('Important dates'), {'fields': ('updated_at', "created_at")}),
    )
    
    readonly_fields = ("user", "email", "token",'updated_at', "created_at")
    
    form = EmailChangeForm
    list_display = ('updated_at', 'user', "email")
    list_filter = ('updated_at', 'user', "email")
    search_fields = ('updated_at', 'user', "email")
    ordering = ["-updated_at"]

admin.site.register(EmailChange, EmailChangeAdmin)