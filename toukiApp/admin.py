from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.utils.translation import gettext_lazy as _
from .models import *

# 更新情報
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

# 一般お問い合わせ
class OpenInquiryChangeForm(forms.ModelForm):
    class Meta:
        model = OpenInquiry
        fields = '__all__'

class OpenInquiryAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('created_by', 'subject', "content", "updated_by")}),
        (_('Important dates'), {'fields': ('updated_at', "created_at")}),
    )
    
    readonly_fields = ("updated_at", "created_at")
    
    form = OpenInquiryChangeForm
    list_display = ('updated_at', 'created_by', "subject", 'updated_by')
    list_filter = ('updated_at', 'created_by', "subject", 'updated_by')
    search_fields = ('updated_at', 'created_by', "subject", "updated_by")
    ordering = ["-updated_at"]

admin.site.register(OpenInquiry, OpenInquiryAdmin)


# 被相続人
class DecedentChangeForm(forms.ModelForm):
    class Meta:
        model = Decedent
        fields = '__all__'

class DecedentAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('user', 'name', 'domicile_prefecture', 'domicile_city', 'domicile_address', 'prefecture', 'city', 'address', 'bldg', 'resistry_prefecture', 'resistry_city', 'resistry_address', 'resistry_bldg', 'death_year', 'death_month', 'death_date', 'birth_year', 'birth_month', 'birth_date', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', "created_at")}),
    )
    
    readonly_fields = ("updated_at", "created_at")
    
    form = DecedentChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'name', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'name', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'name', 'updated_by')
    ordering = ["-updated_at"]

admin.site.register(Decedent, DecedentAdmin)

# 配偶者
class SpouseChangeForm(forms.ModelForm):
    class Meta:
        model = Spouse
        fields = '__all__'

class SpouseAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', 'content_type', 'object_id', 'name', 'is_heir', 'is_refuse', 'is_exist', 'is_live', 'is_japan', 'prefecture', 'city', 'address', 'bldg', 'death_year', 'death_month', 'death_date', 'birth_year', 'birth_month', 'birth_date', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ("updated_at", "created_at")
    
    form = SpouseChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'name', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'name', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'name', 'updated_by')
    ordering = ["-updated_at"]

admin.site.register(Spouse, SpouseAdmin)

# 卑属共通
class DescendantCommonChangeForm(forms.ModelForm):
    class Meta:
        model = DescendantCommon
        fields = '__all__'

class DescendantCommonAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ("decedent", "is_exist", "count", "is_same_parents", "is_live", "is_refuse", "is_adult", "is_japan", 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = DescendantCommonChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'decedent', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'decedent', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'decedent', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(DescendantCommon, DescendantCommonAdmin)

# 卑属
class DescendantChangeForm(forms.ModelForm):
    class Meta:
        model = Descendant
        fields = '__all__'

class DescendantAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', 'content_type1', 'object_id1', 'content_type2', 'object_id2', 'name', 'is_heir', 'is_refuse', 'is_exist', 'is_live', 'is_japan', 'is_adult', 'prefecture', 'city', 'address', 'bldg', 'death_year', 'death_month', 'death_date', 'birth_year', 'birth_month', 'birth_date', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = DescendantChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'name', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'name', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'name', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(Descendant, DescendantAdmin)

# 尊属
class AscendantChangeForm(forms.ModelForm):
    class Meta:
        model = Ascendant
        fields = '__all__'

class AscendantAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', 'content_type', 'object_id', 'name', 'is_heir', 'is_refuse', 'is_exist', 'is_live', 'is_japan', 'prefecture', 'city', 'address', 'bldg', 'death_year', 'death_month', 'death_date', 'birth_year', 'birth_month', 'birth_date', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = AscendantChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'name', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'name', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'name', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(Ascendant, AscendantAdmin)

# 傍系共通
class CollateralCommonChangeForm(forms.ModelForm):
    class Meta:
        model = CollateralCommon
        fields = '__all__'

class CollateralCommonAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ("decedent", "is_exist", "count", "is_same_parents", "is_live", "is_refuse", "is_adult", "is_japan", 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = CollateralCommonChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'decedent', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'decedent', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'decedent', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(CollateralCommon, CollateralCommonAdmin)

# 傍系
class CollateralChangeForm(forms.ModelForm):
    class Meta:
        model = Collateral
        fields = '__all__'

class CollateralAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', 'content_type1', 'object_id1', 'content_type2', 'object_id2', 'name', 'is_heir', 'is_refuse', 'is_exist', 'is_live', 'is_japan', 'is_adult', 'prefecture', 'city', 'address', 'bldg', 'death_year', 'death_month', 'death_date', 'birth_year', 'birth_month', 'birth_date', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = CollateralChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'name', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'name', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'name', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(Collateral, CollateralAdmin)