from django.contrib import admin
from django import forms
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.utils.translation import gettext_lazy as _
from .models import *
from .company_data import *
from .sections import *
from .toukiAi_commons import *
from .forms import *
from django.http import HttpResponseRedirect
from django.urls import path
from django.contrib import messages
from django.db import transaction
from django.utils.html import format_html

class UpdateArticleChangeForm(forms.ModelForm):
    """更新情報の更新フォーム"""
    class Meta:
        model = UpdateArticle
        fields = '__all__'

# class UpdateArticleCreationForm(forms.ModelForm):
#     class Meta:
#         model = UpdateArticle
#         fields = ('title', 'article', "created_by")

class UpdateArticleAdmin(admin.ModelAdmin):
    """更新情報"""
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

class AnswerToOpenInquiryInline(admin.StackedInline):  # またはadmin.StackedInline
    model = AnswerToOpenInquiry
    form = AnswerToOpenInquiryAdminForm
    extra = 1
    fields = ["content"]
    
class OpenInquiryChangeForm(forms.ModelForm):
    """一般お問い合わせの変更フォーム"""
    class Meta:
        model = OpenInquiry
        fields = '__all__'

class OpenInquiryAdmin(admin.ModelAdmin):
    """一般お問い合わせ"""
    
    form = OpenInquiryChangeForm
    change_form_template = "admin/open_inquiry_change_form.html"
    
    def get_urls(self):
        urls = super().get_urls()
        my_urls = [
            path('<int:object_id>/save/', self.admin_site.admin_view(self.save_model_custom), name='open_inquiry_save_custom'),
            path('<int:object_id>/save_answer/', self.admin_site.admin_view(self.save_answer_to_open_inquiry), name='save_answer_to_open_inquiry'),
        ]
        return my_urls + urls

    def save_answer_to_open_inquiry(self, request, object_id):
        """回答のみを保存する処理
        
            Djangoのデフォルトでフォームセットで回答フォームが表示されるためPOSTのデータを
            加工してformに代入している
        """
        open_inquiry = OpenInquiry.objects.get(pk=object_id)
        answer = AnswerToOpenInquiry.objects.filter(open_inquiry=open_inquiry).first()
        post_data = request.POST.copy()  # QueryDict はイミュータブルなので、コピーしてから変更
        post_data['open_inquiry'] = post_data.get('answer_to_open_inquiry-0-open_inquiry')
        post_data['content'] = post_data.get('answer_to_open_inquiry-0-content')
        post_data['created_by'] = answer.created_by if answer else request.user 
        post_data['updated_by'] = request.user
        form = AnswerToOpenInquiryAdminForm(post_data, instance=answer if answer else None)
        if form.is_valid():
            with transaction.atomic():
                form.save()
                messages.success(request, "回答を保存しました")
                send_email_to_inquiry(form.cleaned_data, False)
        else:
            basic_log(get_current_function_name(), None, request.user, f"{form.errors}")
            messages.error(request, "回答の保存に失敗しました")
            
        return HttpResponseRedirect('../')

    def save_model_custom(self, request, object_id):
        """質問のみを保存する処理
        
            使用予定がないためボタンをdisabledにしている
        """
        obj = self.get_object(request, object_id)
        form = self.form(request.POST, instance=obj)
        if form.is_valid():
            with transaction.atomic():
                form.save() 
                messages.success(request, "質問を保存しました")
        else:
            basic_log(get_current_function_name(), None, request.user, f"{form.errors}")
            messages.error(request, "質問の保存に失敗しました")
            
        return HttpResponseRedirect('../') 

    def response_change(self, request, obj):
        if "_saveasnew" in request.POST:
            return super().response_change(request, obj)
        elif "_continue" in request.POST:
            return super().response_change(request, obj)
        elif "_save" in request.POST:
            return HttpResponseRedirect('../')  # 保存後のリダイレクト先を調整

    def answer_updated_by(self, obj):
        # 回答の最終更新日をリストに表示する（回答データがないときは未回答と表示）
        try:
            answer = obj.answer_to_open_inquiry
            return answer.updated_by
        except AnswerToOpenInquiry.DoesNotExist:
            return format_html('<span style="color: #999;">{}</span>', _("未回答"))
    
    answer_updated_by.short_description = "回答の最終更新者"
    
    def answer_updated_at(self, obj):
        # 回答の最終更新日をリストに表示する（回答データがないときは未回答と表示）
        try:
            answer = obj.answer_to_open_inquiry
            return answer.updated_at
        except AnswerToOpenInquiry.DoesNotExist:
            return format_html('<span style="color: #999;">{}</span>', _("未回答"))

    answer_updated_at.short_description = "回答の最終更新日"

    fieldsets = (
        (None, {'fields': ('created_by', 'subject', "content")}),
        (_('Important dates'), {'fields': ('updated_at', "created_at")}),
    )
        
    readonly_fields = ("created_by", 'subject', 'content', 'updated_at', 'created_at')
    list_display = ("created_by", 'subject', 'updated_at', 'answer_updated_by', 'answer_updated_at')
    list_filter = ('updated_at', 'created_at')
    search_fields = ('updated_at', 'created_at', "created_by", "content", "subject")
    ordering = ["-updated_at"]

    inlines = [AnswerToOpenInquiryInline]  # インラインモデルを追加

admin.site.register(OpenInquiry, OpenInquiryAdmin)

class AnswerToOpenInquiryChangeForm(forms.ModelForm):
    class Meta:
        model = AnswerToOpenInquiry
        fields = '__all__'

class AnswerToOpenInquiryAdmin(admin.ModelAdmin):
    """一般のお問い合わせに対する回答"""
    fieldsets = (
        (None, {'fields': ("open_inquiry", "content", "created_by", "updated_by")}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
        (_('問い合わせ内容'), {'fields': ('get_open_inquiry_updated_at', 'get_open_inquiry_user', 'get_open_inquiry_subject', 'get_open_inquiry_content')}),
    )
    
    readonly_fields = ('updated_at', 'created_at', 'open_inquiry', 'get_open_inquiry_updated_at', 'get_open_inquiry_user', 'get_open_inquiry_subject', 'get_open_inquiry_content')
    form = AnswerToOpenInquiryChangeForm
    list_display = ('open_inquiry', 'get_open_inquiry_updated_at', 'get_open_inquiry_user', 'get_open_inquiry_subject', 'get_open_inquiry_content', 'updated_at', 'updated_by')
    list_filter = ('updated_at', 'created_at')
    search_fields = ("open_inquiry", 'updated_at', 'created_at')
    ordering = ['-updated_at']
    
    def get_open_inquiry_updated_at(self, obj):
        return obj.open_inquiry.updated_at
    get_open_inquiry_updated_at.admin_order_field = 'open_inquiry__updated_at'
    get_open_inquiry_updated_at.short_description = _('一般お問い合わせの最終更新日')

    def get_open_inquiry_user(self, obj):
        return obj.open_inquiry.created_by
    get_open_inquiry_user.admin_order_field = 'open_inquiry__user'
    get_open_inquiry_user.short_description = _('問い合わせした人のメールアドレス')

    def get_open_inquiry_subject(self, obj):
        return obj.open_inquiry.subject
    get_open_inquiry_subject.admin_order_field = 'open_inquiry__subject'
    get_open_inquiry_subject.short_description = _('件名')

    def get_open_inquiry_content(self, obj):
        return obj.open_inquiry.content
    get_open_inquiry_content.admin_order_field = 'open_inquiry__content'
    get_open_inquiry_content.short_description = _('質問')
    
    def save_model(self, request, obj, form, change):
        # 回答したらメールをユーザーに送信
        super().save_model(request, obj, form, change)
        send_email_to_inquiry(obj)
    
admin.site.register(AnswerToOpenInquiry, AnswerToOpenInquiryAdmin)

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
        (None, {'fields': ("decedent", 'register', 'number', "address", "land_number", 'purparty', 'price', "is_exchange", "office", 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = LandChangeForm
    list_display = ("id", "decedent", "register", 'number', 'purparty', 'price', 'updated_at', 'created_by', 'updated_by')
    list_filter = ('updated_at', 'created_by', "decedent", "register", 'number', 'updated_by')
    search_fields = ('updated_at', 'created_by', "id", "decedent", "register", 'number', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(Land, LandAdmin)

# 建物
class HouseChangeForm(forms.ModelForm):
    class Meta:
        model = House
        fields = '__all__'

class HouseAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ("decedent", 'register', 'number', "address", "house_number", 'purparty', 'price', "is_exchange", "office", 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = HouseChangeForm
    list_display = ("id", "decedent", "register", 'number', 'purparty', 'price', 'updated_at', 'created_by', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'number', 'updated_by')
    search_fields = ('updated_at', 'created_by', 'number', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(House, HouseAdmin)

# 区分建物
class BldgChangeForm(forms.ModelForm):
    class Meta:
        model = Bldg
        fields = '__all__'

class BldgAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ("decedent", 'register', 'number', "address", "bldg_number", 'purparty', 'price', "is_exchange", "office", 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = BldgChangeForm
    list_display = ("id", "decedent", "register", "number", 'purparty', 'price', 'updated_at', 'created_by', 'updated_by')
    list_filter = ('updated_at', 'created_by', "decedent", "register", 'number', 'updated_by')
    search_fields = ('updated_at', 'created_by', "decedent", "register", 'number', 'updated_by')
    ordering = ['-updated_at']

admin.site.register(Bldg, BldgAdmin)

# 敷地
class SiteChangeForm(forms.ModelForm):
    class Meta:
        model = Site
        fields = '__all__'

class SiteAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ('decedent', "bldg", "number", "address_and_land_number", "type", "purparty_top", "purparty_bottom", 'price', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = SiteChangeForm
    list_display = ("id", 'decedent', "bldg", "purparty_top", "purparty_bottom", 'price', 'updated_at', 'created_by', 'updated_by')
    list_filter = ('updated_at', 'created_by', 'decedent', "bldg", "address_and_land_number", 'updated_by')
    search_fields = ('updated_at', 'created_by', 'decedent', "bldg",  "address_and_land_number",'updated_by')
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
        (None, {'fields': ('decedent', "type_of_division", 'property_allocation', "content_type1", "object_id1", 'cash_allocation', "content_type2", "object_id2", 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = TypeOfDivisionChangeForm
    list_display = ("id", 'updated_at', 'created_by', 'decedent', "type_of_division", 'updated_by')
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
        (None, {'fields': ('decedent', "content_type1", "object_id1", "content_type2", 'object_id2', 'percentage', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = PropertyAcquirerChangeForm
    list_display = ("id", 'decedent', "content_type1", "object_id1", "content_type2", 'object_id2', 'percentage', 'updated_at', 'updated_by', 'created_by')
    list_filter = ('updated_at', 'decedent', 'updated_by', 'created_by')
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
        (None, {'fields': ('decedent', "content_type1", "object_id1", "content_type2", 'object_id2', 'percentage', 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    
    form = CashAcquirerChangeForm
    list_display = ("id", 'decedent', "content_type1", "object_id1", "content_type2", 'object_id2', 'percentage', 'updated_at', 'updated_by', 'created_by')
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
        (None, {'fields': ('decedent', "content_type", 'object_id', "phone_number", 'is_agent', "agent_name", "agent_address", "agent_phone_number", "is_return", "is_mail", 'created_by', 'updated_by')}),
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
    search_fields = ('updated_at', 'created_at', "decedent__name")
    ordering = ['-updated_at']

admin.site.register(Application, ApplicationAdmin)

#法務局
class OfficeChangeForm(forms.ModelForm):
    class Meta:
        model = Office
        fields = '__all__'

class OfficeAdmin(admin.ModelAdmin):
    fieldsets = (
        (None, {'fields': ("code", "office_name", 'created_by', 'updated_by')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ('updated_at', 'created_at')
    form = OfficeChangeForm
    list_display = ("code", "office_name", 'created_by', 'updated_at', 'updated_by')
    list_filter = ('updated_at', 'created_at')
    search_fields = ('updated_at', 'created_at', "decedent__name", "office_name")
    ordering = ['-updated_at']

admin.site.register(Office, OfficeAdmin)

class AnswerToUserInquiryInline(admin.StackedInline):  # またはadmin.StackedInline
    model = AnswerToUserInquiry
    form = AnswerToUserInquiryAdminForm
    extra = 1
    fields = ["content"]

class UserInquiryChangeForm(forms.ModelForm):
    class Meta:
        model = UserInquiry
        fields = '__all__'

class UserInquiryAdmin(admin.ModelAdmin):
    """会員からのお問い合わせ"""
    form = UserInquiryAdminForm
    change_form_template = "admin/user_inquiry_change_form.html"

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [
            path('<int:object_id>/save/', self.admin_site.admin_view(self.save_model_custom), name='user_inquiry_save_custom'),
            path('<int:object_id>/save_answer/', self.admin_site.admin_view(self.save_answer_to_user_inquiry), name='save_answer_to_user_inquiry'),
        ]
        return my_urls + urls

    def save_answer_to_user_inquiry(self, request, object_id):
        """回答のみを保存する処理
        
            Djangoのデフォルトでフォームセットで回答フォームが表示されるためPOSTのデータを
            加工してformに代入している
        """
        user_inquiry = UserInquiry.objects.get(pk=object_id)
        answer = AnswerToUserInquiry.objects.filter(user_inquiry=user_inquiry).first()
        post_data = request.POST.copy()  # QueryDict はイミュータブルなので、コピーしてから変更
        post_data['user_inquiry'] = post_data.get('answer_to_user_inquiry-0-user_inquiry')
        post_data['content'] = post_data.get('answer_to_user_inquiry-0-content')
        post_data['created_by'] = answer.created_by if answer else request.user 
        post_data['updated_by'] = request.user
        form = AnswerToUserInquiryAdminForm(post_data, instance=answer if answer else None)
        if form.is_valid():
            with transaction.atomic():
                form.save()
                messages.success(request, "回答を保存しました")
                send_email_to_inquiry(form.cleaned_data)
        else:
            basic_log(get_current_function_name(), None, request.user, f"{form.errors}")
            messages.error(request, "回答の保存に失敗しました")
            
        return HttpResponseRedirect('../')

    def save_model_custom(self, request, object_id):
        """質問のみを保存する処理
        
            使用予定がないためボタンをdisabledにしている
        """
        obj = self.get_object(request, object_id)
        form = self.form(request.POST, instance=obj)
        if form.is_valid():
            with transaction.atomic():
                form.save() 
                messages.success(request, "質問を保存しました")
        else:
            basic_log(get_current_function_name(), None, request.user, f"{form.errors}")
            messages.error(request, "質問の保存に失敗しました")
            
        return HttpResponseRedirect('../') 

    def response_change(self, request, obj):
        if "_saveasnew" in request.POST:
            return super().response_change(request, obj)
        elif "_continue" in request.POST:
            return super().response_change(request, obj)
        elif "_save" in request.POST:
            return HttpResponseRedirect('../')  # 保存後のリダイレクト先を調整
    
    def answer_updated_at(self, obj):
        # 回答の最終更新日をリストに表示する（回答データがないときは未回答と表示）
        try:
            answer = obj.answer_to_user_inquiry
            return answer.updated_at
        except AnswerToUserInquiry.DoesNotExist:
            return format_html('<span style="color: #999;">{}</span>', _("未回答"))

    answer_updated_at.short_description = "回答の最終更新日"
    
    fieldsets = (
        (None, {'fields': ("user", "category", 'subject', 'content')}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
    )
    
    readonly_fields = ("user", "category", 'subject', 'content', 'updated_at', 'created_at')
    list_display = ("user", "category", 'subject', 'updated_at', 'updated_by', 'answer_updated_at')
    list_filter = ('updated_at', 'created_at')
    search_fields = ('updated_at', 'created_at', "user", "content", "subject")
    ordering = ['-updated_at']
    
    inlines = [AnswerToUserInquiryInline]  # インラインモデルを追加

admin.site.register(UserInquiry, UserInquiryAdmin)

class AnswerToUserInquiryChangeForm(forms.ModelForm):
    class Meta:
        model = AnswerToUserInquiry
        fields = '__all__'

class AnswerToUserInquiryAdmin(admin.ModelAdmin):
    """会員からのお問い合わせに対する回答"""
    fieldsets = (
        (None, {'fields': ("user_inquiry", "content", "created_by", "updated_by")}),
        (_('Important dates'), {'fields': ('updated_at', 'created_at')}),
        (_('問い合わせ内容'), {'fields': ('get_user_inquiry_updated_at', 'get_user_inquiry_user', 'get_user_inquiry_category', 'get_user_inquiry_subject', 'get_user_inquiry_content')}),
    )
    
    readonly_fields = ('updated_at', 'created_at', 'user_inquiry', 'get_user_inquiry_updated_at', 'get_user_inquiry_user', 'get_user_inquiry_category', 'get_user_inquiry_subject', 'get_user_inquiry_content')
    form = AnswerToUserInquiryChangeForm
    list_display = ('user_inquiry', 'get_user_inquiry_updated_at', 'get_user_inquiry_user', 'get_user_inquiry_category', 'get_user_inquiry_subject', 'get_user_inquiry_content', 'updated_at', 'updated_by')
    list_filter = ('updated_at', 'created_at')
    search_fields = ("user_inquiry", 'updated_at', 'created_at')
    ordering = ['-updated_at']
    
    def get_user_inquiry_updated_at(self, obj):
        return obj.user_inquiry.updated_at
    get_user_inquiry_updated_at.admin_order_field = 'user_inquiry__updated_at'
    get_user_inquiry_updated_at.short_description = _('ユーザーからのお問い合わせの最終更新日')

    def get_user_inquiry_user(self, obj):
        return obj.user_inquiry.user
    get_user_inquiry_user.admin_order_field = 'user_inquiry__user'
    get_user_inquiry_user.short_description = _('問い合わせしたユーザー')

    def get_user_inquiry_category(self, obj):
        return Sections.get_category(obj.user_inquiry.category)
    get_user_inquiry_category.admin_order_field = 'user_inquiry__category'
    get_user_inquiry_category.short_description = _('進捗状況')

    def get_user_inquiry_subject(self, obj):
        return Sections.get_subject(obj.user_inquiry.subject)
    get_user_inquiry_subject.admin_order_field = 'user_inquiry__subject'
    get_user_inquiry_subject.short_description = _('項目')

    def get_user_inquiry_content(self, obj):
        return obj.user_inquiry.content
    get_user_inquiry_content.admin_order_field = 'user_inquiry__content'
    get_user_inquiry_content.short_description = _('質問')
    
    def save_model(self, request, obj, form, change):
        # 回答したらメールをユーザーに送信
        super().save_model(request, obj, form, change)
        send_email_to_inquiry(obj)
    
admin.site.register(AnswerToUserInquiry, AnswerToUserInquiryAdmin)