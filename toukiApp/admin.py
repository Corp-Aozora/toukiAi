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
        (None, {'fields': ('user', 'progress', 'name', 'domicile_prefecture', 'domicile_city', 'domicile_address', 'prefecture', 'city', 'address', 'bldg', 'death_year', 'death_month', 'death_date', 'birth_year', 'birth_month', 'birth_date', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', "created_at")}),
    )
    
    readonly_fields = ("updated_at", "created_at")
    
    form = DecedentChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'progress', 'name', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'progress', 'name', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'progress', 'name', 'updated_by')
    ordering = ["-updated_at"]

admin.site.register(Decedent, DecedentAdmin)

# 配偶者
class SpouseChangeForm(forms.ModelForm):
    class Meta:
        model = Spouse
        fields = '__all__'

class SpouseAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', 'content_type', 'object_id', 'name', 'is_heir', 'is_refuse', 'is_exist', 'is_live', 'is_japan', 'is_acquire', 'prefecture', 'city', 'address', 'bldg', 'death_year', 'death_month', 'death_date', 'birth_year', 'birth_month', 'birth_date', 'created_by', 'updated_by')}),
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
        (None, {'fields': ('decedent', 'content_type1', 'object_id1', 'content_type2', 'object_id2', 'name', 'is_heir', 'is_refuse', 'is_exist', 'is_live', 'is_japan', 'is_adult', 'is_acquire', 'prefecture', 'city', 'address', 'bldg', 'death_year', 'death_month', 'death_date', 'birth_year', 'birth_month', 'birth_date', 'created_by', 'updated_by')}),
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
        (None, {'fields': ('decedent', 'content_type', 'object_id', 'name', 'is_heir', 'is_refuse', 'is_exist', 'is_live', 'is_japan', 'is_acquire', 'prefecture', 'city', 'address', 'bldg', 'death_year', 'death_month', 'death_date', 'birth_year', 'birth_month', 'birth_date', 'created_by', 'updated_by')}),
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
        (None, {'fields': ('decedent', 'content_type1', 'object_id1', 'content_type2', 'object_id2', 'name', 'is_heir', 'is_refuse', 'is_exist', 'is_live', 'is_japan', 'is_adult', 'is_acquire', 'prefecture', 'city', 'address', 'bldg', 'death_year', 'death_month', 'death_date', 'birth_year', 'birth_month', 'birth_date', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = CollateralChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'name', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'name', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'name', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(Collateral, CollateralAdmin)

# 不動産登記簿
class RegisterChangeForm(forms.ModelForm):
    class Meta:
        model = Register
        fields = '__all__'

class RegisterAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', 'title', 'path', 'file_size', 'extension', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = RegisterChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'title', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'title', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'title', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(Register, RegisterAdmin)

# 土地
class LandChangeForm(forms.ModelForm):
    class Meta:
        model = Land
        fields = '__all__'

class LandAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('register', 'number', 'purparty', 'price', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = LandChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'number', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'number', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'number', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(Land, LandAdmin)

# 建物
class HouseChangeForm(forms.ModelForm):
    class Meta:
        model = House
        fields = '__all__'

class HouseAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('register', 'number', 'purparty', 'price', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = HouseChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'number', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'number', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'number', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(House, HouseAdmin)

# 敷地
class SiteChangeForm(forms.ModelForm):
    class Meta:
        model = Site
        fields = '__all__'

class SiteAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('house', "land_num", 'price', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = SiteChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'house', "land_num", 'updated_by')
    list_filter = ('updated_at', 'created_by', 'house', "land_num", 'updated_by')
    search_fields = ('updated_at', 'created_by', 'house', "land_num", 'updated_by')
    ordering = ['-updated_at']

admin.site.register(Site, SiteAdmin)

#登記簿上の住所
class RegistryNameAndAddressChangeForm(forms.ModelForm):
    class Meta:
        model = RegistryNameAndAddress
        fields = '__all__'

class RegistryNameAndAddressAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', "name", "prefecture", 'city', 'address', 'bldg','created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = RegistryNameAndAddressChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'decedent', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'decedent', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'decedent', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(RegistryNameAndAddress, RegistryNameAndAddressAdmin)

#遺産分割の方法
class TypeOfDivisionChangeForm(forms.ModelForm):
    class Meta:
        model = TypeOfDivision
        fields = '__all__'

class TypeOfDivisionAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', "type_of_division", 'property_allocation', 'cash_allocation', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = TypeOfDivisionChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'decedent', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'decedent', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'decedent', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(TypeOfDivision, TypeOfDivisionAdmin)

#不動産の数
class NumberOfPropertiesChangeForm(forms.ModelForm):
    class Meta:
        model = NumberOfProperties
        fields = '__all__'

class NumberOfPropertiesAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', "land", 'house', 'bldg', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = NumberOfPropertiesChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'decedent', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'decedent', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'decedent', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(NumberOfProperties, NumberOfPropertiesAdmin)

#不動産の取得者
class PropertyAcquirerChangeForm(forms.ModelForm):
    class Meta:
        model = PropertyAcquirer
        fields = '__all__'

class PropertyAcquirerAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', "object_id1", 'object_id2', 'is_acquire', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = PropertyAcquirerChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'decedent', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'decedent', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'decedent', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(PropertyAcquirer, PropertyAcquirerAdmin)

#金銭の取得者
class CashAcquirerChangeForm(forms.ModelForm):
    class Meta:
        model = CashAcquirer
        fields = '__all__'

class CashAcquirerAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', "object_id1", 'object_id2', 'is_acquire', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = CashAcquirerChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'decedent', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'decedent', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'decedent', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(CashAcquirer, CashAcquirerAdmin)

#関係者
class RelatedIndividualChangeForm(forms.ModelForm):
    class Meta:
        model = RelatedIndividual
        fields = '__all__'

class RelatedIndividualAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', "content_type", 'object_id', 'name', "relationship", 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = RelatedIndividualChangeForm
    list_display = ("id", 'get_decedent_name', "name", "relationship", 'created_by', 'updated_at', 'updated_by')
    def get_decedent_name(self, obj):
        return obj.decedent.name
    get_decedent_name.short_description = '被相続人の氏名'
    list_filter = ('updated_at', 'created_at')
    search_fields = ('updated_at', 'created_at', "decedent__name", "name")
    ordering = ['-updated_at']

admin.site.register(RelatedIndividual, RelatedIndividualAdmin)

#申請情報
class ApplicationChangeForm(forms.ModelForm):
    class Meta:
        model = Application
        fields = '__all__'

class ApplicationAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', "content_type", 'object_id', 'is_agent', "agent_name", "agent_address", "agent_phone_number", "is_return", "is_mail", 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    def get_related_object_name(self, obj):
        """
        申請人の氏名を取得する
        content_typeとobject_idから関連するオブジェクトのname属性を取得します。
        """
        # ContentTypeを使用して関連するモデルクラスを取得
        model = obj.content_type.model_class()
        # modelとobject_idから関連するオブジェクトを取得
        related_object = model.objects.filter(id=obj.object_id).first()
        # 関連するオブジェクトが存在し、name属性を持っている場合、その値を返す
        return related_object.name if related_object else None
    get_related_object_name.short_description = '関連オブジェクトの名前'

    def get_decedent_name(self, obj):
        return obj.decedent.name
    get_decedent_name.short_description = '被相続人の氏名'
    
    readonly_fields = ('updated_at', 'created_at')
    form = ApplicationChangeForm
    list_display = ("id", 'get_decedent_name', "get_related_object_name", 'created_by', 'updated_at', 'updated_by')
    list_filter = ('updated_at', 'created_at')
    search_fields = ('updated_at', 'created_at', "decedent__name", "name")
    ordering = ['-updated_at']

admin.site.register(Application, ApplicationAdmin)

#法務局
class OfficeChangeForm(forms.ModelForm):
    class Meta:
        model = Office
        fields = '__all__'

class OfficeAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ("code", "name", 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    form = OfficeChangeForm
    list_display = ("code", "name", 'created_by', 'updated_at', 'updated_by')
    list_filter = ('updated_at', 'created_at')
    search_fields = ('updated_at', 'created_at', "decedent__name", "name")
    ordering = ['-updated_at']

admin.site.register(Office, OfficeAdmin)