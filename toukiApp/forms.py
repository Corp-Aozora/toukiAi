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
            if field.label in ["ユーザー", "進捗"]:
                field.required = False
            
            if field.label in ["進捗"]:
                continue
            
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
        
#
# 以下、ステップ３関連
# 

# 被相続人情報
class StepThreeDecedentForm(forms.ModelForm):
    class Meta:
        model = Decedent
        fields = model.step_three_fields
        widgets = {
            "city": forms.Select(),
            "domicile_city": forms.Select(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            if field.label in ["ユーザー", "進捗"]:
                field.required = False
                continue
            
            if field.label in ["氏名", "本籍地の町域・番地", "住所の町域・番地", "住所の建物"]:
                field.widget.attrs.update({
                    "class": "form-control rounded-end",
                })
                if field.label == "氏名":
                    field.widget.attrs.update({
                        "placeholder": "フルネームで姓名間にスペースなし",
                        "maxlength": "30",
                    })
                elif field.label == "本籍地の町域・番地":
                    field.widget.attrs.update({
                        "placeholder": "天神１丁目１番",
                        "maxlength": "100",
                    })
                elif field.label == "住所の町域・番地":
                    field.widget.attrs.update({
                        "placeholder": "天神１丁目１番１号",
                        "maxlength": "100",
                    })
                elif field.label == "住所の建物":
                    field.widget.attrs.update({
                        "placeholder": "とうきマンション１０１号室",
                        "maxlength": "100",
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
        
#登記簿上の氏名住所情報
class StepThreeRegistryNameAndAddressForm(forms.ModelForm):
    class Meta:
        model = RegistryNameAndAddress
        fields = model.step_three_fields
        widgets = {
            "city": forms.Select(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            if field.label in ["氏名", "登記上の町域・番地", "登記上の建物"]:
                field.widget.attrs.update({
                    "class": "form-control rounded-end",
                })
                if field.label == "氏名":
                    field.widget.attrs.update({
                        "placeholder": "フルネームで姓名間にスペースなし",
                        "maxlength": "30",
                    })
                elif field.label in ["登記上の町域・番地", "住所の町域・番地",]:
                    field.widget.attrs.update({
                        "placeholder": "天神１丁目１番１号",
                        "maxlength": "100",
                    })
                elif field.label == "登記上の建物":
                    field.widget.attrs.update({
                        "placeholder": "とうきマンション１０１号室",
                        "maxlength": "100",
                    })
                
            else:
                field.widget.attrs.update({
                    "class": "form-select text-center cursor-pointer rounded-end",
                })
                
                if field.label == "登記上の市区町村":
                    field.widget.attrs['disabled'] = 'disabled'
                elif field.label == "登記上の都道府県":
                    field.initial
        super().__init__(*args, **kwargs)
        
#相続人情報（配偶者）
class StepThreeSpouseForm(forms.ModelForm):
    class Meta:
        model = Spouse
        fields = model.step_three_fields
        widgets = {
            "city": forms.Select(),
            "is_acquire": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
            if field.label in ["配偶者", "配偶者id", "相続人", "相続放棄", "死亡時存在", "手続時存在", "日本在住",]:
                field.widget = forms.HiddenInput() 
                continue
            
            if field.label in ["氏名", "住所の町域・番地", "住所の建物"]:
                field.widget.attrs.update({
                    "class": "form-control rounded-end",
                })
                if field.label == "氏名":
                    field.widget.attrs.update({
                        "placeholder": "フルネームで姓名間にスペースなし",
                        "maxlength": "30",
                    })
                elif field.label == "住所の町域・番地":
                    field.widget.attrs.update({
                        "placeholder": "天神１丁目１番１号",
                        "maxlength": "100",
                    })
                elif field.label == "住所の建物":
                    field.widget.attrs.update({
                        "placeholder": "とうきマンション１０１号室",
                        "maxlength": "100",
                    })
            elif field.label ==  "不動産取得":
                field.widget.attrs.update({
                    "class": "form-check-input",
                })
            else:
                field.widget.attrs.update({
                    "class": "form-select text-center cursor-pointer rounded-end",
                })
                
                if field.label == "住所の市区町村":
                    field.widget.attrs['disabled'] = 'disabled'
                elif field.label == "住所の都道府県":
                    field.initial
        super().__init__(*args, **kwargs)
        
#相続人情報（子）
class StepThreeDescendantForm(forms.ModelForm):
    #前配偶者との子のとき用
    other_parent_name = forms.CharField(label="前配偶者の氏名", required = False)
    
    class Meta:
        model = Descendant
        index = model.step_three_fields.index("is_refuse")
        model.step_three_fields.insert(index, "other_parent_name")
        fields = model.step_three_fields
        widgets = {
            "city": forms.Select(),
            "is_acquire": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
            if field.label in ["親1", "親1id", "親2", "親2id", "相続人", "相続放棄", "死亡時存在", "手続時存在", "日本在住", "成人",]:
                field.widget = forms.HiddenInput() 
                continue 
            
            else:
                if field.label in ["氏名", "住所の町域・番地", "住所の建物", "前配偶者の氏名"]:
                    field.widget.attrs.update({
                        "class": "form-control rounded-end",
                    })
                    if field.label in ["氏名", "前配偶者の氏名"]:
                        field.widget.attrs.update({
                            "placeholder": "フルネームで姓名間にスペースなし",
                            "maxlength": "30",
                        })
                    elif field.label == "住所の町域・番地":
                        field.widget.attrs.update({
                            "placeholder": "天神１丁目１番１号",
                            "maxlength": "100",
                        })
                    elif field.label == "住所の建物":
                        field.widget.attrs.update({
                            "placeholder": "とうきマンション１０１号室",
                            "maxlength": "100",
                        })
                elif field.label ==  "不動産取得":
                    field.widget.attrs.update({
                        "class": "form-check-input",
                    })    
                else:
                    field.widget.attrs.update({
                        "class": "form-select text-center cursor-pointer rounded-end",
                    })
                    
                    if field.label == "住所の市区町村":
                        field.widget.attrs['disabled'] = 'disabled'
                    elif field.label == "住所の都道府県":
                        field.initial
        super().__init__(*args, **kwargs)
        
#相続人情報（尊属）
class StepThreeAscendantForm(forms.ModelForm):
    class Meta:
        model = Ascendant
        fields = model.step_three_fields
        widgets = {
            "city": forms.Select(),
            "is_acquire": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
            if field.label in ["子", "子id", "相続人", "相続放棄", "死亡時存在", "手続時存在", "日本在住",]:
                field.widget = forms.HiddenInput() 
                continue
            
            else:
                if field.label in ["氏名", "住所の町域・番地", "住所の建物"]:
                    field.widget.attrs.update({
                        "class": "form-control rounded-end",
                    })
                    if field.label == "氏名":
                        field.widget.attrs.update({
                            "placeholder": "フルネームで姓名間にスペースなし",
                            "maxlength": "30",
                        })
                    elif field.label == "住所の町域・番地":
                        field.widget.attrs.update({
                            "placeholder": "天神１丁目１番１号",
                            "maxlength": "100",
                        })
                    elif field.label == "住所の建物":
                        field.widget.attrs.update({
                            "placeholder": "とうきマンション１０１号室",
                            "maxlength": "100",
                        })
                elif field.label ==  "不動産取得":
                    field.widget.attrs.update({
                        "class": "form-check-input",
                    })                        
                else:
                    field.widget.attrs.update({
                        "class": "form-select text-center cursor-pointer rounded-end",
                    })
                    
                    if field.label == "住所の市区町村":
                        field.widget.attrs['disabled'] = 'disabled'
                    elif field.label == "住所の都道府県":
                        field.initial
        super().__init__(*args, **kwargs)
        
#相続人情報（兄弟姉妹）
class StepThreeCollateralForm(forms.ModelForm):
    #異父母との子のとき用
    other_parent_name = forms.CharField(label="異父母の氏名", required = False)
    
    class Meta:
        model = Collateral
        index = model.step_three_fields.index("is_refuse")
        model.step_three_fields.insert(index, "other_parent_name")
        fields = model.step_three_fields
        widgets = {
            "city": forms.Select(),
            "is_acquire": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
            if field.label in ["親1", "親1id", "親2", "親2id", "相続人", "相続放棄", "死亡時存在", "手続時存在", "日本在住", "成人",]:
                field.widget = forms.HiddenInput() 
                continue 
            
            else:
                if field.label in ["氏名", "住所の町域・番地", "住所の建物", "異父母の氏名"]:
                    field.widget.attrs.update({
                        "class": "form-control rounded-end",
                    })
                    if field.label in ["氏名", "異父母の氏名"]:
                        field.widget.attrs.update({
                            "placeholder": "フルネームで姓名間にスペースなし",
                            "maxlength": "30",
                        })
                    elif field.label == "住所の町域・番地":
                        field.widget.attrs.update({
                            "placeholder": "天神１丁目１番１号",
                            "maxlength": "100",
                        })
                    elif field.label == "住所の建物":
                        field.widget.attrs.update({
                            "placeholder": "とうきマンション１０１号室",
                            "maxlength": "100",
                        })
                elif field.label ==  "不動産取得":
                    field.widget.attrs.update({
                        "class": "form-check-input",
                    })                        
                else:
                    field.widget.attrs.update({
                        "class": "form-select text-center cursor-pointer rounded-end",
                    })
                    
                    if field.label == "住所の市区町村":
                        field.widget.attrs['disabled'] = 'disabled'
                    elif field.label == "住所の都道府県":
                        field.initial
        super().__init__(*args, **kwargs)
        
#遺産分割の方法
class StepThreeTypeOfDivisionForm(forms.ModelForm):
    class Meta:
        model = TypeOfDivision
        fields = model.step_three_fields
        widgets = {
            "type_of_division": forms.RadioSelect(choices=[("通常", "通常"), ("換価分割", "換価分割")]),
            "property_allocation": forms.RadioSelect(choices=[('全て一人', '全て一人'),('全て法定相続', '全て法定相続'),('その他', 'その他'),]),
            "all_property_acquirer": forms.Select(),
            "cash_allocation": forms.RadioSelect(choices=[('全て一人', '全て一人'),('全て法定相続', '全て法定相続'),('その他', 'その他'),]),
            "all_cash_acquirer": forms.Select(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
            if field.label in  ["遺産分割協議書の種類", "不動産の分配方法", "換価した金銭の分配方法"]:
                field.widget.attrs.update({
                    "class": "form-check-input",
                })
            elif field.label in ["全不動産の取得者", "全金銭の取得者"]:
                field.widget.attrs.update({
                    "class": "form-select text-center cursor-pointer rounded-end",
                })
                    

        super().__init__(*args, **kwargs)
        
#ステップ３の
#ステップ３の
#ステップ３の