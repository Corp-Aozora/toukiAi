from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from .company_data import Service
from django.utils import timezone
from .models import *

CustomUser = get_user_model()

# 一般お問い合わせフォーム
# created_by:メールアドレス, subject:件名, content:内容
class OpenInquiryForm(forms.ModelForm):
    class Meta:
        model = OpenInquiry
        fields = model.fields
        widgets = {
            "subject": forms.Select(),
        }

    def __init__(self, *args, **kwargs):
        self.base_fields['created_by'].widget.attrs.update({
            'class': 'form-control rounded-end',
            'autocomplete': 'on',
            "placeholder": "弊社からの回答を受け取るメールアドレス",
        })
        
        self.base_fields["subject"].widget.attrs.update({
            "class": "form-select text-center cursor-pointer"
        })
        
        self.base_fields['content'].widget.attrs.update({
            'class': 'form-control rounded-end',
            "placeholder": "問い合わせは何回しても対応してくれるの？\n(※300文字まで)\n\n※何回でも対応します。",
            "style":"resize:none;"
        })
        
        super().__init__(*args, **kwargs)

# STEP1の被相続人、配偶者、尊属の基本フォーム
class BaseOneForm(forms.ModelForm):
    index = forms.CharField(required=False, widget=forms.HiddenInput())
    target = forms.CharField(required=False, widget=forms.HiddenInput())

    class Meta:
        abstract = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['index'].widget.attrs.update({
            'class': 'hidden',
        })
        self.fields['target'].widget.attrs.update({
            'class': 'hidden',
        })
        
# STEP1の子、兄弟姉妹の基本フォーム
class BaseTwoForm(forms.ModelForm):
    index = forms.CharField(required=False, widget=forms.HiddenInput())
    target1 = forms.CharField(required=False, widget=forms.HiddenInput())
    target2 = forms.CharField(required=False, widget=forms.HiddenInput())

    class Meta:
        abstract = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['index'].widget.attrs.update({
            'class': 'hidden',
        })
        self.fields['target1'].widget.attrs.update({
            'class': 'hidden',
        })
        self.fields['target2'].widget.attrs.update({
            'class': 'hidden',
        })        
        
# STEP1の被相続人フォーム
class StepOneDecedentForm(BaseOneForm):
    class Meta:
        model = Decedent
        fields = model.step_one_fields + ["index", "target"]
        widgets = {
            "city": forms.Select(),
            "domicile_city": forms.Select(),
        }

    def __init__(self, *args, **kwargs):
        for i, field in enumerate(self.base_fields.values()):
            if field.label == "ユーザー":
                field.required = False
            
            else:
                field.widget.attrs.update({"tabindex": str(i)})
                
                if field.label == "氏名":
                    field.widget.attrs.update({
                        "class": "form-control rounded-end",
                        "placeholder": "フルネームで姓名間にスペースなし",
                        "maxlength": "30",
                    })
                else:
                    field.widget.attrs.update({
                        "class": "form-select text-center cursor-pointer rounded-end",
                    })
                    
                    if field.label in ["本籍地の市区町村", "住所の市区町村"]:
                        field.widget.attrs['disabled'] = 'disabled'
                    elif field.label in ["本籍地の都道府県", "住所の都道府県"]:
                        field.initial
        super().__init__(*args, **kwargs)
                        
                
# STEP1の配偶者フォーム
class StepOneSpouseForm(BaseOneForm):
    class Meta:
        model = Spouse
        # decedent, content_type, object_id, name, is_exist, is_live, is_heir, is_refuse, is_japan
        fields = model.step_one_fields + ["index", "target"]
        widgets = {
            "is_exist": forms.RadioSelect(choices=[("true", "はい"), ("false", "いない・逝去していた")]),
            "is_live": forms.RadioSelect(choices=[("true", "はい"), ("false", "逝去した")]),
            "is_refuse": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")]),
            "is_japan": forms.RadioSelect(choices=[("true", "はい"), ("false", "海外に居住している")]),
        }

    def __init__(self, *args, **kwargs):
        
        for field in self.base_fields.values():
            field.required = False

            if field.label in ["被相続人", "配偶者", "配偶者id", "相続人"]:
                continue
            
            if field.label == "氏名":
                field.widget.attrs.update({
                    "class": "form-control rounded-end",
                    "placeholder": "フルネームで姓名間にスペースなし",
                    "maxlength": "30",
                })
            
            else:
                field.widget.attrs.update({
                    "class": "form-check-input",
                })
            
        super().__init__(*args, **kwargs)
        for field in ['is_refuse', 'is_exist', 'is_live', 'is_japan']:
            if self.initial.get(field) is not None:
                self.initial[field] = 'true' if self.initial[field] else 'false'

# STEP1の子共通フォーム
class StepOneDescendantCommonForm(forms.ModelForm):
    class Meta:
        model = DescendantCommon
        # "decedent", "is_exist", "count", "is_same_parents", "is_live", "is_refuse", "is_adult", "is_japan"
        fields = model.step_one_fields
        widgets = {
            "is_exist": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")]),
            "is_same_parents": forms.RadioSelect(choices=[("true", "はい"), ("false", "前配偶者との子がいる")]),
            "is_live": forms.RadioSelect(choices=[("true", "はい"), ("false", "亡くなっている子がいる")]),
            "is_refuse": forms.RadioSelect(choices=[("true", "いる"), ("false", "いない")]),
            "is_adult": forms.RadioSelect(choices=[("true", "はい"), ("false", "未成年の子がいる")]),
            "is_japan": forms.RadioSelect(choices=[("true", "はい"), ("false", "海外に居住している子がいる")]),
        }

    def __init__(self, *args, **kwargs):
        
        for field in self.base_fields.values():
            field.required = False

            if field.label == "被相続人":
                continue
            
            if field.label == "子の数":
                field.widget.attrs.update({
                    "class": "form-control text-center no-spin",
                })
            
            else:
                field.widget.attrs.update({
                    "class": "form-check-input",
                })
            
        super().__init__(*args, **kwargs)
        for field in ["is_exist", "is_same_parents", "is_live", "is_refuse", "is_adult", "is_japan"]:
            if self.initial.get(field) is not None:
                self.initial[field] = 'true' if self.initial[field] else 'false'
              
# STEP1の子フォーム
class StepOneDescendantForm(BaseTwoForm):
    class Meta:
        model = Descendant
        # decedent, content_type1, object_id1, content_type2, object_id2, name, is_live, is_exist, is_refuse, is_adult, is_japan, is_heir
        fields = model.step_one_fields + ["index", "target1", "target2"]
        widgets = {
            "is_live": forms.RadioSelect(choices=[("true", "はい"), ("false", "逝去した")]),
            "is_exist": forms.RadioSelect(choices=[("true", "はい"), ("false", "逝去していた")]),
            "is_refuse": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")]),
            "is_adult": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")]),
            "is_japan": forms.RadioSelect(choices=[("true", "はい"), ("false", "海外に居住している")]),
        }

    def __init__(self, *args, **kwargs):
        
        for field in self.base_fields.values():
            field.required = False

            if field.label in ["被相続人", "親1", "親1id", "親2", "親2id", "相続人",]:
                continue
            
            if field.label == "氏名":
                field.widget.attrs.update({
                    "class": "form-control rounded-end",
                    "placeholder": "フルネームで姓名間にスペースなし",
                    "maxlength": "30",
                })
            
            else:
                field.widget.attrs.update({
                    "class": "form-check-input",
                })
            
        super().__init__(*args, **kwargs)
        for field in ["is_live", "is_exist", "is_refuse", "is_adult", "is_japan"]:
            if self.initial.get(field) is not None:
                self.initial[field] = 'true' if self.initial[field] else 'false'
                
# STEP1の尊属フォーム
class StepOneAscendantForm(BaseOneForm):
    class Meta:
        model = Ascendant
        # content_type1, object_id1, name, decedent, is_live, is_exist, is_refuse, is_japan, is_heir
        fields = model.step_one_fields + ["index", "target"]
        widgets = {
            "is_live": forms.RadioSelect(choices=[("true", "はい"), ("false", "逝去した")]),
            "is_exist": forms.RadioSelect(choices=[("true", "はい"), ("false", "逝去していた")]),
            "is_refuse": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")]),
            "is_japan": forms.RadioSelect(choices=[("true", "はい"), ("false", "海外に居住している")]),
        }

    def __init__(self, *args, **kwargs):
        
        for field in self.base_fields.values():
            field.required = False

            if field.label in ["被相続人", "子", "子id", "相続人"]:
                continue
            
            if field.label == "氏名":
                field.widget.attrs.update({
                    "class": "form-control rounded-end",
                    "placeholder": "フルネームで姓名間にスペースなし",
                    "maxlength": "30",
                })
            
            else:
                field.widget.attrs.update({
                    "class": "form-check-input",
                })
            
        super().__init__(*args, **kwargs)
        
# STEP1の兄弟姉妹共通フォーム
class StepOneCollateralCommonForm(forms.ModelForm):
    class Meta:
        model = CollateralCommon
        # "decedent", "is_exist", "count", "is_same_parents", "is_live", "is_refuse", "is_adult", "is_japan"
        fields = model.step_one_fields
        widgets = {
            "is_exist": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")]),
            "is_same_parents": forms.RadioSelect(choices=[("true", "はい"), ("false", "異父母の兄弟姉妹がいる")]),
            "is_live": forms.RadioSelect(choices=[("true", "はい"), ("false", "亡くなっている兄弟姉妹がいる")]),
            "is_refuse": forms.RadioSelect(choices=[("true", "いる"), ("false", "いない")]),
            "is_adult": forms.RadioSelect(choices=[("true", "はい"), ("false", "未成年の兄弟姉妹がいる")]),
            "is_japan": forms.RadioSelect(choices=[("true", "はい"), ("false", "海外に移住している兄弟姉妹がいる")]),
        }

    def __init__(self, *args, **kwargs):
        
        for field in self.base_fields.values():
            field.required = False

            if field.label == "被相続人":
                continue
            
            if field.label == "兄弟姉妹の数":
                field.widget.attrs.update({
                    "class": "form-control text-center no-spin",
                })
            
            else:
                field.widget.attrs.update({
                    "class": "form-check-input",
                })
            
        super().__init__(*args, **kwargs)
        for field in ["is_exist", "is_same_parents", "is_live", "is_refuse", "is_adult", "is_japan"]:
            if self.initial.get(field) is not None:
                self.initial[field] = 'true' if self.initial[field] else 'false'
        
# STEP1の兄弟姉妹フォーム
class StepOneCollateralForm(BaseTwoForm):
    class Meta:
        model = Collateral
        # decedent, content_type1, object_id1, content_type2, object_id2, name, is_live, is_exist, is_refuse, is_adult, is_japan, is_heir
        fields = model.step_one_fields + ["index", "target1", "target2"]
        widgets = {
            "is_live": forms.RadioSelect(choices=[("true", "はい"), ("false", "逝去した")]),
            "is_exist": forms.RadioSelect(choices=[("true", "はい"), ("false", "逝去していた")]),
            "is_refuse": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")]),
            "is_adult": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")]),
            "is_japan": forms.RadioSelect(choices=[("true", "はい"), ("false", "海外に居住している")]),
        }

    def __init__(self, *args, **kwargs):
        
        for field in self.base_fields.values():
            field.required = False

            if field.label in ["被相続人", "親1", "親1id", "親2", "親2id", "相続人",]:
                continue
            
            if field.label == "氏名":
                field.widget.attrs.update({
                    "class": "form-control rounded-end",
                    "placeholder": "フルネームで姓名間にスペースなし",
                    "maxlength": "30",
                })
            
            else:
                field.widget.attrs.update({
                    "class": "form-check-input",
                })
            
        super().__init__(*args, **kwargs)