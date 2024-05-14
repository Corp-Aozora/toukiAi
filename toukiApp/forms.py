from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from .company_data import Service
from django.utils import timezone
from .models import *
from django.contrib import admin
from django.contrib.contenttypes.models import ContentType

CustomUser = get_user_model()

"""

    全体共通

"""
class WidgetAttributes:
    """フォームの属性集"""
    # メールアドレス
    # ラジオボタン
    radio = {
        "class": "form-check-input",
    }
    # セレクト
    select = {
        "class": "form-select text-center cursor-pointer rounded-end"
    }
    # 隠しinput
    hidden_input = {
        "class": "hidden"
    }
    email = {
        'class': 'form-control rounded-end',
        'autocomplete': 'on',
        "placeholder": "",
    }
    # 問い合わせ内容
    inquiry_content = {
        'class': 'form-control rounded-end',
        "placeholder": "300文字まで",
        "style":"resize:none;"
    }
    # 評価額
    price = {
        "placeholder": "数字のみで入力（コンマ不要）",
        "class": "form-control text-center rounded-end",
        "maxlength": "16",
    }
    # 氏名
    name = {
        "class": "form-control rounded-end",
        "placeholder": "姓名の間にスペースなし",
        "maxlength": "30",
    }
    # カウントする入力欄
    count = {
        "class": "form-control text-center no-spin",
    }
    # 市区町村
    city = {
        "class": "form-control rounded-end",
        "placeholder": "〇〇市〇〇区、〇〇郡〇〇町など",
        "maxlength": "100",
    }
    # 本籍の町域・番地
    domicile_address = {
        "class": "form-control rounded-end",
        "placeholder": "戸籍謄本のとおり",
        "maxlength": "100",
    }
    # 住所の町域・番地
    address = {
        "class": "form-control rounded-end",
        "placeholder": "「◯丁目」の◯は漢数字",
        "maxlength": "100",
    }
    # 住所の建物
    bldg = {
        "class": "form-control rounded-end",
        "placeholder": "住民票（戸籍の附票）のとおり",
        "maxlength": "100",
    }
    # 不動産番号
    rs_number = {
        "class": "form-control rounded-end",
        "placeholder": "１３桁の数字",
        "maxlength": "13",
    }
    # 土地の所在地
    land_address = {
        "class": "form-control rounded-end",
        "placeholder": "「◯丁目」の◯は漢数字",
        "maxlength": "100",
    }
    # 建物の所在地
    house_address = {
        "class": "form-control rounded-end",
        "placeholder": "「◯丁目」の◯は漢数字",
        "maxlength": "100",
    }
    # 一棟の建物の所在
    bldg_address = {
        "class": "form-control rounded-end",
        "placeholder": "「◯丁目」の◯は漢数字",
        "maxlength": "100",        
    }
    # 区分建物の家屋番号
    bldg_number = {
        "class": "form-control rounded-end",
        "placeholder": "専有部分の建物の表示にある家屋番号",
        "maxlength": "100",        
    }
    # 敷地権の所在及び地番
    site_address_and_number = {
        "class": "form-control rounded-end",
        "placeholder": "「番地」ではなく「番」",
        "maxlength": "100",
    }
    # 敷地権の土地の符号
    site_order_number = {
        "class": "form-control rounded-end text-center",
        "maxlength": "3",
    }
    # 分子または分母の入力欄
    fraction = {
        "class": "mx-1 p-0 fraction form-control text-center",
        "maxlength": "10",        
    }
    # 法務局
    office = {
        "class": "form-control rounded-end text-center",
        "placeholder": "不動産番号を入力すると自動で表示されます",
        "maxlength": "30",
        "disabled": "true",
    }
    # 一括住所
    full_address = {
        "class": "form-control rounded-end",
        "placeholder": "福岡県福岡市中央区天神一丁目１番１号登記ハイツ１０１号室",
        "maxlength": "100",        
    }
    # 電話番号
    phone_number = {
        "class": "form-control rounded-end",
        "placeholder": "ハイフンあり",
        "maxlength": "13",
    }
    
class Labels:
    """ラベル属性値"""
    
    # ステップ１
    YEAR = "年"
    MONTH = "月"
    
    CHILD_COUNT = "何人ですか？（亡くなった子や養子を含む）"
    COLLATERAL_COUNT = "何人ですか？（亡くなった方を含む）"
    CHILD_IS_EXIST = "子供はいましたか？（亡くなった子や養子を含む）"
    COLLATERAL_IS_EXIST = "兄弟姉妹はいましたか？（亡くなった方を含む）"
    CHILD_COMMON_IS_SAME_PARENTS = "全員配偶者との子ですか？"
    COLLATERAL_COMMON_IS_SAME_PARENTS = "全員被相続人と同じ両親ですか？"
    COMMON_IS_LIVE = "現在も全員ご健在ですか？"
    COMMON_IS_REFUSE = "家庭裁判所で相続放棄をした方はいますか？"
    COMMON_IS_ADULT = "現在もご健在の方は全員成人してますか？"
    COMMON_IS_JAPAN = "現在もご健在の方は全員日本に住民票がありますか？"
    
    IS_EXIST = "被相続人の死亡時はご健在でしたか？"
    IS_LIVE = "現在もご健在ですか？"
    IS_REFUSE = "家庭裁判所で相続放棄をされてますか？"
    IS_ADULT = "成人してますか？"
    IS_JAPAN = "住民票は日本にありますか？"
    
    step_one_decedent_labels = {
        "death_year": YEAR,
        "death_month": MONTH,
    }
    @staticmethod
    def get_step_one_relations_labels(is_descendant_or_collateral):
        return {
            "is_exist": Labels.IS_EXIST,
            "is_live": Labels.IS_LIVE,
            "is_refuse": Labels.IS_REFUSE,
            "is_japan": Labels.IS_JAPAN,
            **({"is_adult": Labels.IS_ADULT} if is_descendant_or_collateral else {})
        }
    @staticmethod
    def get_step_one_common_labels(is_descendant):
        return {
            "count": Labels.CHILD_COUNT if is_descendant else Labels.COLLATERAL_COUNT,
            "is_exist": Labels.CHILD_IS_EXIST if is_descendant else Labels.COLLATERAL_IS_EXIST,
            "is_same_parents": Labels.CHILD_COMMON_IS_SAME_PARENTS if is_descendant else Labels.COLLATERAL_COMMON_IS_SAME_PARENTS,
            "is_live": Labels.COMMON_IS_LIVE,
            "is_refuse": Labels.COMMON_IS_REFUSE,
            "is_adult": Labels.COMMON_IS_ADULT,
            "is_japan": Labels.COMMON_IS_JAPAN,
        }
    
    # ステップ３
    PREFECTURE = "都道府県"
    CITY = "市区町村"
    ADDRESS = "町域・番地"
    BLDG = "建物名・号室"
    DATE = "日"
    IS_ACQUIRE = "不動産を取得しますか？"
    
    @staticmethod
    def get_step_three_person_labels(is_decedent):
        labels = {
            "prefecture": Labels.PREFECTURE,
            "city": Labels.CITY,
            "address": Labels.ADDRESS,
            "bldg": Labels.BLDG,
            "death_year": Labels.YEAR,
            "death_month": Labels.MONTH,
            "death_date": Labels.DATE,
            "birth_year": Labels.YEAR,
            "birth_month": Labels.MONTH,
            "birth_date": Labels.MONTH,
        }
        
        if is_decedent:
            labels.update({
                "domicile_prefecture": Labels.PREFECTURE,
                "domicile_city": Labels.CITY,
                "domicile_address": Labels.ADDRESS,
            })
        else:
            labels.update({"is_acquire": Labels.IS_ACQUIRE})
            
        return labels
    
    step_three_registry_name_and_address_labels = {
        "prefecture": PREFECTURE,
        "city": CITY,
        "address": ADDRESS,
        "bldg": BLDG,
    }

class WidgetGroup:
    """カスタム使用するヴィジェット群"""
    @staticmethod
    def step_one(model_name):

        if model_name == "DescendantCommon":
            return {
                "is_exist": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")]),
                "is_same_parents": forms.RadioSelect(choices=[("true", "はい"), ("false", "前配偶者との子がいる")]),
                "is_live": forms.RadioSelect(choices=[("true", "はい"), ("false", "亡くなっている子がいる")]),
                "is_refuse": forms.RadioSelect(choices=[("true", "いる"), ("false", "いない")]),
                "is_adult": forms.RadioSelect(choices=[("true", "はい"), ("false", "未成年の子がいる")]),
                "is_japan": forms.RadioSelect(choices=[("true", "はい"), ("false", "海外に居住している子がいる")]),
            }
        if model_name == "CollateralCommon":
            return {
                "is_exist": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")]),
                "is_same_parents": forms.RadioSelect(choices=[("true", "はい"), ("false", "異父母の人がいる")]),
                "is_live": forms.RadioSelect(choices=[("true", "はい"), ("false", "亡くなっている人がいる")]),
                "is_refuse": forms.RadioSelect(choices=[("true", "いる"), ("false", "いない")]),
                "is_adult": forms.RadioSelect(choices=[("true", "はい"), ("false", "未成年の人がいる")]),
                "is_japan": forms.RadioSelect(choices=[("true", "はい"), ("false", "海外に居住している人いる")]),
            }
        return {
            "is_live": forms.RadioSelect(choices=[("true", "はい"), ("false", "亡くなった")]),
            "is_exist": forms.RadioSelect(choices=[("true", "はい"), ("false", "亡くなっていた")]),
            "is_refuse": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")]),
            "is_japan": forms.RadioSelect(choices=[("true", "はい"), ("false", "海外に居住している")]),
            **({"is_adult": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")])} if model_name in ["Descendant", "Collateral"] else {})
        }
    
    @staticmethod
    def step_three(model_name):

        if model_name == "Decedent":
            return {
                "user": forms.HiddenInput()
            }
        if model_name == "RegistryNameAndAddress":
            return {
                "decedent": forms.HiddenInput()
            }
        if model_name in ["Spouse", "Ascendant"]:
            return {
                "is_acquire": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
                "decedent": forms.HiddenInput(),
                "content_type": forms.HiddenInput(),
                "object_id": forms.HiddenInput(),
                "is_heir": forms.HiddenInput(),
                "is_refuse": forms.HiddenInput(),
                "is_exist": forms.HiddenInput(),
                "is_live": forms.HiddenInput(),
                "is_japan": forms.HiddenInput(),
            }
        if model_name in ["Descendant", "Collateral"]:
            return {
                "is_acquire": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
                "decedent": forms.HiddenInput(),
                "content_type1": forms.HiddenInput(),
                "object_id1": forms.HiddenInput(),
                "content_type2": forms.HiddenInput(),
                "object_id2": forms.HiddenInput(),
                "is_heir": forms.HiddenInput(),
                "is_refuse": forms.HiddenInput(),
                "is_exist": forms.HiddenInput(),
                "is_live": forms.HiddenInput(),
                "is_japan": forms.HiddenInput(),
                "is_adult": forms.HiddenInput(),
            }            

def conversion_bool_value(form):
    """boolのデータ（TrueまたはFalse）を変換する（trueまたはfalse）"""
    for name in ["is_exist", "is_same_parents", "is_live", "is_refuse", "is_adult", "is_japan", "is_acquire", "is_heir"]:
        if name in form.fields and form.initial.get(name) is not None:
            form.initial[name] = 'true' if form.initial[name] else 'false'

"""

    トップページ

"""

class OpenInquiryForm(forms.ModelForm):
    """問い合わせ"""
    class Meta:
        model = OpenInquiry
        fields = model.fields
        widgets = {
            "subject": forms.Select(),
        }

    def clean_created_by(self):
        """メールアドレスの検証"""
        created_by = self.cleaned_data.get('created_by', '')
        return created_by.strip()
    
    def clean_content(self):
        """質問内容の検証"""
        content = self.cleaned_data.get('content', '')
        
        stripped_content = content.strip()
        if len(stripped_content) < 2:
            raise forms.ValidationError("２文字以上入力してください。")

        return content
    
    def __init__(self, *args, **kwargs):
        self.base_fields['created_by'].widget.attrs.update(WidgetAttributes.email)
        self.base_fields["subject"].widget.attrs.update(WidgetAttributes.select)
        self.base_fields['content'].widget.attrs.update(WidgetAttributes.inquiry_content)
        
        super().__init__(*args, **kwargs)

"""

    ステップ１関連

"""
def set_step_one_decedent_form(form):
    """被相続人のフォームの初期化処理"""
    for i, (name, field) in enumerate(form.base_fields.items()):
        if name in ["user", "progress"]:
            field.required = False
        
        if name in ["user", "progress", "index", "target"]:
            continue
        
        else:
            if name == "name":
                field.widget.attrs.update(WidgetAttributes.name)
            else:
                field.widget.attrs.update(WidgetAttributes.select)

def set_step_one_relations_form(form, is_descendant_or_collateral):
    """関係者のフォームの属性を設定する"""
    for name, field in form.base_fields.items():
        field.required = False

        internal_fields = ["decedent", "content_type1", "object_id1", "content_type2", "object_id2", "is_heir"]\
            if is_descendant_or_collateral else ["decedent", "content_type", "object_id", "is_heir"]

        if name in internal_fields:
            continue
        
        if name == "name":
            field.widget.attrs.update(WidgetAttributes.name)
        else:
            field.widget.attrs.update(WidgetAttributes.radio)

def set_step_one_common_form(form):
    """全員フォームのフォームの属性を設定する"""
    for name, field in form.base_fields.items():
        field.required = False

        if name == "decedent":
            continue
        
        if name == "count":
            field.widget.attrs.update(WidgetAttributes.count)
        else:
            field.widget.attrs.update(WidgetAttributes.radio) 

def initialize_step_one_relations_form(form, is_descendant_or_collateral, *args, **kwargs):
    """関係者のフォームの初期処理"""
    set_step_one_relations_form(form, is_descendant_or_collateral)
    super(type(form), form).__init__(*args, **kwargs)
    conversion_bool_value(form) 
            
def initialize_step_one_common_form(form, *args, **kwargs):
    """全員フォームの初期処理"""
    set_step_one_common_form(form)
    super(type(form), form).__init__(*args, **kwargs)
    conversion_bool_value(form)

class BaseOneForm(forms.ModelForm):
    """被相続人、配偶者、尊属の共通項目"""
    index = forms.CharField(required=False, widget=forms.HiddenInput(attrs=WidgetAttributes.hidden_input))
    target = forms.CharField(required=False, widget=forms.HiddenInput(attrs=WidgetAttributes.hidden_input))

    class Meta:
        abstract = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
class BaseTwoForm(forms.ModelForm):
    """子、兄弟姉妹の共通項目"""
    index = forms.CharField(required=False, widget=forms.HiddenInput(attrs=WidgetAttributes.hidden_input))
    target1 = forms.CharField(required=False, widget=forms.HiddenInput(attrs=WidgetAttributes.hidden_input))
    target2 = forms.CharField(required=False, widget=forms.HiddenInput(attrs=WidgetAttributes.hidden_input))

    class Meta:
        abstract = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
   
class StepOneDecedentForm(BaseOneForm):
    """被相続人"""
    class Meta:
        model = Decedent
        fields = model.step_one_fields + ["index", "target"]
        widgets = WidgetGroup.step_one(model.__name__)
        labels = Labels.step_one_decedent_labels

    def __init__(self, *args, **kwargs):
        set_step_one_decedent_form(self)
        super().__init__(*args, **kwargs)

class StepOneSpouseForm(BaseOneForm):
    """配偶者"""
    class Meta:
        model = Spouse
        fields = model.step_one_fields + ["index", "target"]
        widgets = WidgetGroup.step_one(model.__name__)
        labels = Labels.get_step_one_relations_labels(False)

    def __init__(self, *args, **kwargs):
        initialize_step_one_relations_form(self, False, *args, **kwargs)

class StepOneDescendantCommonForm(forms.ModelForm):
    """子全員"""
    class Meta:
        model = DescendantCommon
        fields = model.step_one_fields
        widgets = WidgetGroup.step_one(model.__name__)
        labels = Labels.get_step_one_common_labels(True)

    def __init__(self, *args, **kwargs):
        initialize_step_one_common_form(self, *args, **kwargs)

              
class StepOneDescendantForm(BaseTwoForm):
    """各子"""
    class Meta:
        model = Descendant
        fields = model.step_one_fields + ["index", "target1", "target2"]
        widgets = WidgetGroup.step_one(model.__name__)
        labels = Labels.get_step_one_relations_labels(True)

    def __init__(self, *args, **kwargs):
        initialize_step_one_relations_form(self, True, *args, **kwargs)

class StepOneAscendantForm(BaseOneForm):
    """尊属"""
    class Meta:
        model = Ascendant
        fields = model.step_one_fields + ["index", "target"]
        widgets = WidgetGroup.step_one(model.__name__)
        labels = Labels.get_step_one_relations_labels(False)

    def __init__(self, *args, **kwargs):
        initialize_step_one_relations_form(self, False, *args, **kwargs)

class StepOneCollateralCommonForm(forms.ModelForm):
    """兄弟姉妹全員"""
    class Meta:
        model = CollateralCommon
        fields = model.step_one_fields
        widgets = WidgetGroup.step_one(model.__name__)
        labels = Labels.get_step_one_common_labels(False)

    def __init__(self, *args, **kwargs):
        initialize_step_one_common_form(self, *args, **kwargs)

class StepOneCollateralForm(BaseTwoForm):
    """各兄弟姉妹"""
    class Meta:
        model = Collateral
        fields = model.step_one_fields + ["index", "target1", "target2"]
        widgets = WidgetGroup.step_one(model.__name__)
        labels = Labels.get_step_one_relations_labels(True)
        
    def __init__(self, *args, **kwargs):
        initialize_step_one_relations_form(self, True, *args, **kwargs)
        

"""

    ステップ３関連

"""
def set_step_three_decedent_form(form):
    """被相続人のフォーム"""
    for name, field in form.base_fields.items():
        if name in ["user", "progress"]:
            field.required = False
            continue
        elif name == "name":
            field.widget.attrs.update(WidgetAttributes.name)
        elif name in ["domicile_city", "city"]:
            field.widget.attrs.update(WidgetAttributes.city)
        elif name == "domicile_address":
            field.widget.attrs.update(WidgetAttributes.domicile_address)
        elif name == "address":
            field.widget.attrs.update(WidgetAttributes.address)
        elif name == "bldg":
            field.widget.attrs.update(WidgetAttributes.bldg)
        else:
            field.widget.attrs.update(WidgetAttributes.select)

def set_step_three_registry_name_and_address_form(form):
    """登記簿上の氏名住所のフォーム"""
    for name, field in form.base_fields.items():
        field.required = False

        if name == "name":
            field.widget.attrs.update(WidgetAttributes.name)
        elif name == "city":
            field.widget.attrs.update(WidgetAttributes.city)
        elif name == "address":
            field.widget.attrs.update(WidgetAttributes.address)
        elif name == "bldg":
            field.widget.attrs.update(WidgetAttributes.bldg)
        else:
            field.widget.attrs.update(WidgetAttributes.select)

def set_step_three_heir_form(form, is_descendant_or_collateral):
    """相続人のフォーム"""
    for name, field in form.base_fields.items():
        field.required = False

        if is_descendant_or_collateral and name == "other_parent_name":
            field.widget.attrs.update(WidgetAttributes.name)

        if name == "name":
            field.widget.attrs.update(WidgetAttributes.name)
        elif name == "city":
            field.widget.attrs.update(WidgetAttributes.city)
        elif name == "address":
            field.widget.attrs.update(WidgetAttributes.address)
        elif name == "bldg":
            field.widget.attrs.update(WidgetAttributes.bldg)
        elif name == "is_acquire":
            field.widget.attrs.update(WidgetAttributes.radio)
        elif name in ["prefecture", "death_year", "death_month", "death_date", "birth_year", "birth_month", "birth_date",]:
            field.widget.attrs.update(WidgetAttributes.select)
            
# 被相続人情報
class StepThreeDecedentForm(forms.ModelForm):
    class Meta:
        model = Decedent
        fields = model.step_three_fields
        widgets = WidgetGroup.step_three(model.__name__)
        labels = Labels.get_step_three_person_labels(True)

    def __init__(self, *args, **kwargs):
        set_step_three_decedent_form(self)
        super().__init__(*args, **kwargs)
        
#登記簿上の氏名住所情報
class StepThreeRegistryNameAndAddressForm(forms.ModelForm):
    id = forms.CharField(widget=forms.HiddenInput())
    
    class Meta:
        model = RegistryNameAndAddress
        fields = model.step_three_fields
        widgets = WidgetGroup.step_three(model.__name__)
        labels = Labels.step_three_registry_name_and_address_labels

    def __init__(self, *args, **kwargs):
        set_step_three_registry_name_and_address_form(self)
        super().__init__(*args, **kwargs)
        
#相続人情報（配偶者、子の配偶者）
class StepThreeSpouseForm(forms.ModelForm):
    # [id]_[content_type]の形式文字列、不動産取得者用
    id_and_content_type = forms.CharField(widget=forms.HiddenInput())
    id = forms.CharField(widget=forms.HiddenInput())
    
    class Meta:
        model = Spouse
        index = model.step_three_fields.index("is_exist")
        model.step_three_fields.insert(index, "id_and_content_type")
        fields = model.step_three_fields
        widgets = WidgetGroup.step_three(model.__name__)
        labels = Labels.get_step_three_person_labels(False)

    def __init__(self, *args, **kwargs):
        set_step_three_heir_form(self, False)
                    
        super(StepThreeSpouseForm, self).__init__(*args, **kwargs)
        
        if self.instance:
            self.fields["id_and_content_type"].initial = str(self.instance.id) + "_" + str(ContentType.objects.get_for_model(self.instance).id)
            
        conversion_bool_value(self)
        
#相続人情報（子、孫）
class StepThreeDescendantForm(forms.ModelForm):
    # [id]_[content_type]の形式文字列、不動産取得者用
    id_and_content_type = forms.CharField(widget=forms.HiddenInput())
    #前配偶者との子のとき用
    other_parent_name = forms.CharField(label="氏名", required = False)
    id = forms.CharField(widget=forms.HiddenInput())
    
    class Meta:
        model = Descendant
        other_parent_name_idx = model.step_three_fields.index("is_refuse")
        model.step_three_fields.insert(other_parent_name_idx, "other_parent_name")
        id_and_content_type_idx = model.step_three_fields.index("decedent")
        model.step_three_fields.insert(id_and_content_type_idx, "id_and_content_type")
        fields = model.step_three_fields
        widgets = WidgetGroup.step_three(model.__name__)
        labels = Labels.get_step_three_person_labels(False)

    def __init__(self, *args, **kwargs):
        set_step_three_heir_form(self, True)

        super().__init__(*args, **kwargs)
                
        if self.instance:
            self.fields["id_and_content_type"].initial = str(self.instance.id) + "_" + str(ContentType.objects.get_for_model(self.instance).id)
            
        conversion_bool_value(self)
        
#相続人情報（尊属）
class StepThreeAscendantForm(forms.ModelForm):
     # [id]_[content_type]の形式文字列、不動産取得者用
    id_and_content_type = forms.CharField(widget=forms.HiddenInput())
    id = forms.CharField(widget=forms.HiddenInput())

    class Meta:
        model = Ascendant
        index = model.step_three_fields.index("is_exist")
        model.step_three_fields.insert(index, "id_and_content_type")
        fields = model.step_three_fields
        widgets = WidgetGroup.step_three(model.__name__)
        labels = Labels.get_step_three_person_labels(False)
        
    def __init__(self, *args, **kwargs):
        set_step_three_heir_form(self, False)

        super().__init__(*args, **kwargs)
        
        if self.instance:
            self.fields["id_and_content_type"].initial = str(self.instance.id) + "_" + str(ContentType.objects.get_for_model(self.instance).id)
        
        conversion_bool_value(self)

        
#相続人情報（兄弟姉妹）
class StepThreeCollateralForm(forms.ModelForm):
    # [id]_[content_type]の形式文字列、不動産取得者用
    id_and_content_type = forms.CharField(widget=forms.HiddenInput())
    #異父母との子のとき用
    other_parent_name = forms.CharField(label="氏名", required = False)
    id = forms.CharField(widget=forms.HiddenInput())
    
    class Meta:
        model = Collateral
        other_parent_name_idx = model.step_three_fields.index("is_refuse")
        model.step_three_fields.insert(other_parent_name_idx, "other_parent_name")
        id_and_content_type_idx = model.step_three_fields.index("decedent")
        model.step_three_fields.insert(id_and_content_type_idx, "id_and_content_type")      
        fields = model.step_three_fields
        widgets = WidgetGroup.step_three(model.__name__)
        labels = Labels.get_step_three_person_labels(False)
        
    def __init__(self, *args, **kwargs):
        set_step_three_heir_form(self, True)
        
        super().__init__(*args, **kwargs)
        
        if self.instance:
            self.fields["id_and_content_type"].initial = str(self.instance.id) + "_" + str(ContentType.objects.get_for_model(self.instance).id)

        conversion_bool_value(self)
        
#遺産分割の方法
class StepThreeTypeOfDivisionForm(forms.ModelForm):
    all_cash_acquirer = forms.CharField(widget=forms.Select(choices=[("", "選択してください")]), required=False)
    
    class Meta:
        model = TypeOfDivision
        index = model.step_three_fields.index("content_type2")
        model.step_three_fields.insert(index, "all_cash_acquirer")
        fields = model.step_three_fields
        widgets = {
            "type_of_division": forms.RadioSelect(choices=[("通常", "通常"), ("換価分割", "換価分割")]),
            "property_allocation": forms.RadioSelect(choices=[('全て法定相続', '全て法定相続'),('その他', 'その他'),]),
            "content_type1":forms.HiddenInput(),
            "object_id1":forms.HiddenInput(),
            "cash_allocation": forms.RadioSelect(choices=[('全て一人', '全て一人'),('全て法定相続', '全て法定相続'),('その他', 'その他'),]),
            "content_type2":forms.HiddenInput(),
            "object_id2":forms.HiddenInput(),
            "decedent":forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        
        self.legal_heirs = kwargs.pop('legal_heirs', None)
        
        for field in self.base_fields.values():
            field.required = False
            if field.label in  ["遺産分割協議書の種類", "不動産の分配方法", "換価した金銭の分配方法"]:
                field.widget.attrs.update(WidgetAttributes.radio)
            else:
                field.widget.attrs.update(WidgetAttributes.select)

        super().__init__(*args, **kwargs)
        
    def clean_all_cash_acquirer(self):
        """単独の金銭取得者の欄はバリデーション不要"""
        return self.cleaned_data.get("all_cash_acquirer")
            
#不動産の数
class StepThreeNumberOfPropertiesForm(forms.ModelForm):
    class Meta:
        model = NumberOfProperties
        fields = model.step_three_fields
        widgets = {
            "decedent":forms.HiddenInput(),
        }
    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
            if field.label != "被相続人":
                field.widget.attrs.update(WidgetAttributes.count)

                
        super().__init__(*args, **kwargs)
        
#土地
class StepThreeLandForm(forms.ModelForm):
    index = forms.CharField(required=False, widget=forms.HiddenInput(), initial="0")
    land_id = forms.CharField(widget=forms.HiddenInput())
    
    class Meta:
        model = Land
        index = model.step_three_fields.index("decedent")
        model.step_three_fields.insert(index, "land_id")
        model.step_three_fields.insert(index, "index")
        fields = model.step_three_fields
        widgets = {
            "is_exchange": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
            "purparty": forms.HiddenInput(),
            "land_number": forms.HiddenInput(),
            "decedent": forms.HiddenInput(),
            "register": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
            if field.label == "不動産番号":
                field.widget.attrs.update(WidgetAttributes.rs_number)
            elif field.label == "所在地":
                field.widget.attrs.update(WidgetAttributes.land_address)
            elif field.label == "法務局":
                field.widget.attrs.update(WidgetAttributes.office)
            elif field.label == "地積":
                field.widget.attrs.update({
                    "class": "form-control rounded-end",
                })
            elif field.label == "固定資産評価額":
                field.widget.attrs.update(WidgetAttributes.price)
            elif field.label == "地目":
                field.widget.attrs.update(WidgetAttributes.select)
            elif field.label ==  "換価対象":
                field.widget.attrs.update(WidgetAttributes.radio)
            elif field.label == "持ち分":
                field.initial = "分の"
            elif field.label == "地番":
                field.initial = "番"

        super().__init__(*args, **kwargs)
        for field in ["is_exchange"]:
            if self.initial.get(field) is not None:
                self.initial[field] = 'true' if self.initial[field] else 'false'

#土地取得者
class StepThreeLandAcquirerForm(forms.ModelForm):
    target = forms.CharField(required=False, widget=forms.HiddenInput())
    
    class Meta:
        model = PropertyAcquirer
        index = model.step_three_fields.index("content_type1")
        model.step_three_fields.insert(index, "target")
        fields = model.step_three_fields
        widgets = {
            "content_type2": forms.HiddenInput(),
            "object_id2": forms.HiddenInput(),
            "percentage": forms.HiddenInput(),
            "content_type1": forms.HiddenInput(),
            "object_id1": forms.HiddenInput(),
            "decedent": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
        super().__init__(*args, **kwargs)

#土地金銭取得者
class StepThreeLandCashAcquirerForm(forms.ModelForm):
    target = forms.CharField(required=False, widget=forms.HiddenInput())
    
    class Meta:
        model = CashAcquirer
        index = model.step_three_fields.index("content_type1")
        model.step_three_fields.insert(index, "target")
        fields = model.step_three_fields
        widgets = {
            "content_type2": forms.HiddenInput(),
            "object_id2": forms.HiddenInput(),
            "percentage": forms.HiddenInput(),
            "content_type1": forms.HiddenInput(),
            "object_id1": forms.HiddenInput(),
            "decedent": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
        super().__init__(*args, **kwargs)

#建物
class StepThreeHouseForm(forms.ModelForm):
    index = forms.CharField(required=False, widget=forms.HiddenInput(), initial="0")
    house_id = forms.CharField(widget=forms.HiddenInput())
    
    class Meta:
        model = House
        idx = model.step_three_fields.index("decedent")
        model.step_three_fields.insert(idx, "house_id")
        model.step_three_fields.insert(idx, "index")
        fields = model.step_three_fields
        widgets = {
            "is_exchange": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
            "purparty": forms.HiddenInput(),
            "house_number": forms.HiddenInput(),
            "decedent": forms.HiddenInput(),
            "register": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
            if field.label == "不動産番号":
                field.widget.attrs.update(WidgetAttributes.rs_number)
            elif field.label == "所在地":
                field.widget.attrs.update(WidgetAttributes.house_address)
            elif field.label == "法務局":
                field.widget.attrs.update(WidgetAttributes.office)
            elif field.label == "固定資産評価額":
                field.widget.attrs.update(WidgetAttributes.price)
            elif field.label == "種類":
                field.widget.attrs.update(WidgetAttributes.select)
            elif field.label ==  "換価対象":
                field.widget.attrs.update(WidgetAttributes.radio)
            elif field.label == "持ち分":
                field.initial = "分の"
            elif field.label == "家屋番号":
                field.initial = "番"

        super().__init__(*args, **kwargs)
        for field in ["is_exchange"]:
            if self.initial.get(field) is not None:
                self.initial[field] = 'true' if self.initial[field] else 'false'

#建物取得者
class StepThreeHouseAcquirerForm(forms.ModelForm):
    target = forms.CharField(required=False, widget=forms.HiddenInput())
    
    class Meta:
        model = PropertyAcquirer
        index = model.step_three_fields.index("content_type1")
        model.step_three_fields.insert(index, "target")
        fields = model.step_three_fields
        widgets = {
            "content_type2": forms.HiddenInput(),
            "object_id2": forms.HiddenInput(),
            "percentage": forms.HiddenInput(),
            "content_type1": forms.HiddenInput(),
            "object_id1": forms.HiddenInput(),
            "decedent": forms.HiddenInput(),
        }
        
    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
        super().__init__(*args, **kwargs)

#建物金銭取得者
class StepThreeHouseCashAcquirerForm(forms.ModelForm):
    target = forms.CharField(required=False, widget=forms.HiddenInput())
    
    class Meta:
        model = CashAcquirer
        index = model.step_three_fields.index("content_type1")
        model.step_three_fields.insert(index, "target")
        fields = model.step_three_fields
        widgets = {
            "content_type2": forms.HiddenInput(),
            "object_id2": forms.HiddenInput(),
            "percentage": forms.HiddenInput(),
            "content_type1": forms.HiddenInput(),
            "object_id1": forms.HiddenInput(),
            "decedent": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
        super().__init__(*args, **kwargs)

# 区分建物
class StepThreeBldgForm(forms.ModelForm):
    index = forms.CharField(required=False, widget=forms.HiddenInput(), initial="0")
    bldg_id = forms.CharField(widget=forms.HiddenInput())
    
    class Meta:
        model = Bldg
        idx = model.step_three_fields.index("decedent")
        model.step_three_fields.insert(idx, "bldg_id")
        model.step_three_fields.insert(idx, "index")
        fields = model.step_three_fields
        widgets = {
            "is_exchange": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
            "purparty": forms.HiddenInput(),
            "decedent": forms.HiddenInput(),
            "register": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
            if field.label == "不動産番号":
                field.widget.attrs.update(WidgetAttributes.rs_number)
            elif field.label == "法務局":
                field.widget.attrs.update(WidgetAttributes.office)
            elif field.label == "一棟の建物の所在":
                field.widget.attrs.update(WidgetAttributes.bldg_address)
            elif field.label == "家屋番号":
                field.widget.attrs.update(WidgetAttributes.bldg_number)
            elif field.label == "固定資産評価額":
                field.widget.attrs.update(WidgetAttributes.price)
            elif field.label == "種類":
                field.widget.attrs.update(WidgetAttributes.select)
            elif field.label ==  "換価対象":
                field.widget.attrs.update(WidgetAttributes.radio)
            elif field.label == "所有権・持分":
                field.initial = "分の"

        super().__init__(*args, **kwargs)
        for field in ["is_exchange"]:
            if self.initial.get(field) is not None:
                self.initial[field] = 'true' if self.initial[field] else 'false'

# 敷地権        
class StepThreeSiteForm(forms.ModelForm):
    target = forms.CharField(required=False, widget=forms.HiddenInput(), initial="0")
    
    class Meta:
        model = Site
        index = model.step_three_fields.index("bldg")
        model.step_three_fields.insert(index, "target")
        fields = model.step_three_fields
        widgets = {
            "bldg": forms.HiddenInput(),
            "decedent": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
            if field.label == "所在及び地番":
                field.widget.attrs.update(WidgetAttributes.site_address_and_number)
            elif field.label == "土地の符号":
                field.widget.attrs.update(WidgetAttributes.site_order_number)
            elif field.label in ["敷地権の割合（分母）", "敷地権の割合（分子）"]:
                field.widget.attrs.update(WidgetAttributes.fraction)
            elif field.label == "固定資産評価額":
                field.widget.attrs.update(WidgetAttributes.price)
            elif field.label == "敷地権の種類":
                field.widget.attrs.update(WidgetAttributes.select)
        super().__init__(*args, **kwargs)
        self.fields['type'].choices = [("", "選択してください")] + list(Site.TYPE_CHOICES)
        
# 区分建物取得者
class StepThreeBldgAcquirerForm(forms.ModelForm):
    target = forms.CharField(required=False, widget=forms.HiddenInput())
    
    class Meta:
        model = PropertyAcquirer
        index = model.step_three_fields.index("content_type1")
        model.step_three_fields.insert(index, "target")
        fields = model.step_three_fields
        widgets = {
            "content_type2": forms.HiddenInput(),
            "object_id2": forms.HiddenInput(),
            "percentage": forms.HiddenInput(),
            "content_type1": forms.HiddenInput(),
            "object_id1": forms.HiddenInput(),
            "decedent": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
        super().__init__(*args, **kwargs)

# 区分金銭取得者
class StepThreeBldgCashAcquirerForm(forms.ModelForm):
    target = forms.CharField(required=False, widget=forms.HiddenInput())
    
    class Meta:
        model = CashAcquirer
        index = model.step_three_fields.index("content_type1")
        model.step_three_fields.insert(index, "target")
        fields = model.step_three_fields
        widgets = {
            "content_type2": forms.HiddenInput(),
            "object_id2": forms.HiddenInput(),
            "percentage": forms.HiddenInput(),
            "content_type1": forms.HiddenInput(),
            "object_id1": forms.HiddenInput(),
            "decedent": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
        super().__init__(*args, **kwargs)
                
#申請情報
class StepThreeApplicationForm(forms.ModelForm):
    class Meta:
        model = Application
        # decedent, content_type, object_id, is_agent, agent_name, agent_address, agent_phone_number, is_return, is_mail,
        fields = model.step_three_fields
        widgets = {
            "is_agent": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")]),
            "is_return": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
            "is_mail": forms.RadioSelect(choices=[("true", "郵送する"), ("false", "持参する")]),
            "content_type": forms.HiddenInput(),
            "object_id": forms.HiddenInput(),
            "decedent": forms.HiddenInput(),
        }
        labels = {
            "agent_name": "氏名",
            "agent_address": "住所",
            "phone_number": "電話番号",
            "agent_phone_number": "電話番号"
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            if field.label in ["被相続人", "申請人", "申請人id",]:
                continue
            if field.label == "氏名":
                field.widget.attrs.update(WidgetAttributes.name)
            elif field.label == "住所":
                field.widget.attrs.update(WidgetAttributes.address)
            elif field.label == "電話番号":
                field.widget.attrs.update(WidgetAttributes.phone_number)
            elif field.label in ["代理人の有無", "原本還付の有無", "郵送の有無"]:
                field.widget.attrs.update(WidgetAttributes.radio)
            else:
                field.widget.attrs.update(WidgetAttributes.select)

        
        super().__init__(*args, **kwargs)
        # 本使用まで初期値としてtrueを代入する
        self.initial.setdefault('is_return', 'true')
        self.initial.setdefault('is_mail', 'true')
        
        for field in ["is_agent", "is_return", "is_mail"]:
            if self.initial.get(field) is not None:
                self.initial[field] = 'true' if self.initial[field] else 'false'
                
class StepUserInquiryForm(forms.ModelForm):
    """ユーザーの問い合わせページ"""
    class Meta:
        model = UserInquiry
        # category, subject, content
        fields = model.fields

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            if field.label == "進捗状況":
                field.widget.attrs.update(WidgetAttributes.select)
            elif field.label == "項目":
                field.widget.attrs.update(WidgetAttributes.select)                
                field.widget.attrs['disabled'] = "true"
            else:
                field.widget.attrs.update(WidgetAttributes.inquiry_content)
                field.widget.attrs["disabled"] = "true"

        super().__init__(*args, **kwargs)
    
"""

    管理者サイト関連フォーム

"""
class OpenInquiryAdminForm(forms.ModelForm):
    class Meta:
        model = OpenInquiry
        fields = '__all__'
            
class AnswerToOpenInquiryAdminForm(forms.ModelForm):
    class Meta:
        model = AnswerToOpenInquiry
        fields = "__all__"

class UserInquiryAdminForm(forms.ModelForm):
    class Meta:
        model = UserInquiry
        fields = '__all__'
            
class AnswerToUserInquiryAdminForm(forms.ModelForm):
    class Meta:
        model = AnswerToUserInquiry
        fields = "__all__"