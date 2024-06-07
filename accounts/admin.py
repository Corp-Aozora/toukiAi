from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.http import HttpResponse
from django.urls import path
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
        (None, {'fields': ('username', "address", 'email', "phone_number", 'password', "basic_date", "option1_date", "option2_date", "option3_date", "option4_date", "option5_date", "pay_amount", "last_login_session_key")}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                       'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', "last_update", 'date_joined')}),
    )
    
    readonly_fields = ("last_login", "last_update", "date_joined")
    
    # ユーザーを追加画面の入力欄
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', "address", 'email', "phone_number", "is_staff", "is_superuser",'password1', 'password2'),
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
    search_fields = ('updated_at', 'user__email', "email")
    ordering = ["-updated_at"]

admin.site.register(EmailChange, EmailChangeAdmin)

"""
    オプションの利用申請    
"""
class OptionRequestForm(forms.ModelForm):
    class Meta:
        model = OptionRequest
        fields = '__all__'

class OptionRequestAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('user', "order_id", "transaction_id", "access_id", "recieved_date", "payer", "basic", "option1", "option2", "charge", "created_by", "updated_by")}),
        (_('Important dates'), {'fields': ('updated_at', "created_at")}),
    )
    
    readonly_fields = ('updated_at', "created_at")
    
    form = OptionRequestForm
    list_display = ('updated_at', 'user', "order_id", "payer", "basic", "option1", "option2", "charge", "recieved_date")
    list_filter = ('updated_at', 'user', "order_id", "payer")
    search_fields = ('updated_at', 'user__email', "user__name", "user__address", "user__phone_number", "order_id", "transaction_id", "access_id", "payer")
    ordering = ["-updated_at"]
        
    # def get_urls(self):
    #     urls = super().get_urls()
    #     custom_urls = [
    #         path('<int:object_id>/check_reciept/', self.admin_site.admin_view(self.check_reciept), name='check_reciept'),
    #     ]
    #     return custom_urls + urls

    # def check_reciept(self, request, object_id, *args, **kwargs):
    #     """領収書の内容チェック"""
    #     pass
    #     # instance = self.model.objects.get(pk=object_id)
    #     # # ここで何らかの処理を行う
    #     # instance.save()
    #     # return HttpResponse("Processed!")
        
    # def check_reciept(self, request, object_id, *args, **kwargs):
    #     """メールの内容チェック"""
    #     pass
    #     # instance = self.model.objects.get(pk=object_id)
    #     # # ここで何らかの処理を行う
    #     # instance.save()
    #     # return HttpResponse("Processed!")
    
admin.site.register(OptionRequest, OptionRequestAdmin)

# メールアドレス変更申請
class EmailVerificationForm(forms.ModelForm):
    class Meta:
        model = EmailVerification
        fields = '__all__'

class EmailVerificationAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('user', "session_id", "email", "token", "is_verified")}),
        (_('Important dates'), {'fields': ("created_at",)}),
    )
    
    readonly_fields = ('user', "session_id", "email", "token", "is_verified", "created_at")
    
    form = EmailVerificationForm
    list_display = ('created_at', 'user', "email", "is_verified")
    list_filter = ('created_at', 'user', "email", "is_verified")
    search_fields = ('user', "session_id", "email", "token", "is_verified", "created_at")
    ordering = ["-created_at"]

admin.site.register(EmailVerification, EmailVerificationAdmin)