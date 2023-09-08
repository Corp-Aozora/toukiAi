from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.utils.translation import gettext_lazy as _
from .models import UpdateArticle
    
class UpdateArticleChangeForm(forms.ModelForm):
    class Meta:
        model = UpdateArticle
        fields = '__all__'

# class UpdateArticleCreationForm(forms.ModelForm):
#     class Meta:
#         model = UpdateArticle
#         fields = ('title', 'article', "created_by")

class UpdateArticleAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('title', 'article', "updated_by",'created_by')}),
        (_('Important dates'), {'fields': ('updated_at', "created_at")}),
    )
    
    readonly_fields = ("updated_at", "created_at")
    
    # # ユーザーを追加画面の入力欄
    # add_fieldsets = (
    #     (None, {
    #         'classes': ('wide',),
    #         'fields': ('title', 'article', "created_by"),
    #     }),
    # )
    
    form = UpdateArticleChangeForm
    # add_form = UpdateArticleCreationForm
    list_display = ('updated_at', 'title', 'updated_by')
    list_filter = ('updated_at', 'title', 'updated_by')
    search_fields = ('updated_at', 'title', "updated_by")
    ordering = ["-updated_at"]

admin.site.register(UpdateArticle, UpdateArticleAdmin)