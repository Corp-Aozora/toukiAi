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
        (None, {'fields': ('username', 'email', "phone_number",'password', "basic", "option1", "option2", "option3", "option4", "option5", "pay_amount")}),
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
        (None, {'fields': ('user', "order_id", "transaction_id", "access_id", "is_recieved", "is_recieved_date", "name", "payer", "address", "phone_number", "basic", "option1", "option2", "charge", "created_by", "updated_by")}),
        (_('Important dates'), {'fields': ('updated_at', "created_at")}),
    )
    
    readonly_fields = ('updated_at', "created_at")
    
    form = OptionRequestForm
    list_display = ('updated_at', 'user', "order_id", "name", "payer", "phone_number", "basic", "option1", "option2", "charge", "is_recieved")
    list_filter = ('updated_at', "order_id",'user', "name", "payer", "is_recieved")
    search_fields = ('updated_at', 'user__email', "order_id", "transaction_id", "access_id", "name", "payer", "phone_number")
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