from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.utils.translation import gettext_lazy as _
from .models import User

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
        (None, {'fields': ('username', 'email', "phone_number",'password',)}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                       'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', "last_update", 'date_joined')}),
    )
    
    readonly_fields = ("last_login", "last_update", "date_joined")
    
    # ユーザーを追加画面の入力欄
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', "is_staff", "is_superuser",'password1', 'password2'),
        }),
    )
    
    form = MyUserChangeForm
    add_form = MyUserCreationForm
    list_display = ('email', 'username', 'is_staff')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('email', 'username')
    ordering = ('username',)

admin.site.register(User, MyUserAdmin)