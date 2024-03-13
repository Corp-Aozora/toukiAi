from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from .company_data import Service
from django.utils import timezone
from .models import *
from django.contrib.contenttypes.models import ContentType

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
            "placeholder": "300文字まで",
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
    # [id]_[content_type]の形式文字列、不動産取得者用
    id_and_content_type = forms.CharField(widget=forms.HiddenInput())
    
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
        
        if self.instance:
            self.fields["id_and_content_type"].initial = str(self.instance.id) + "_" + str(ContentType.objects.get_for_model(self.instance).id)
        for field in ["is_acquire"]:
            if self.initial.get(field) is not None:
                self.initial[field] = 'true' if self.initial[field] else 'false'
        
        
#相続人情報（子）
class StepThreeDescendantForm(forms.ModelForm):
    # [id]_[content_type]の形式文字列、不動産取得者用
    id_and_content_type = forms.CharField(widget=forms.HiddenInput())
    
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
                
        if self.instance:
            self.fields["id_and_content_type"].initial = str(self.instance.id) + "_" + str(ContentType.objects.get_for_model(self.instance).id)
        for field in ["is_acquire"]:
            if self.initial.get(field) is not None:
                self.initial[field] = 'true' if self.initial[field] else 'false'

        
#相続人情報（尊属）
class StepThreeAscendantForm(forms.ModelForm):
     # [id]_[content_type]の形式文字列、不動産取得者用
    id_and_content_type = forms.CharField(widget=forms.HiddenInput())
    
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
        
        if self.instance:
            self.fields["id_and_content_type"].initial = str(self.instance.id) + "_" + str(ContentType.objects.get_for_model(self.instance).id)
        for field in ["is_acquire"]:
            if self.initial.get(field) is not None:
                self.initial[field] = 'true' if self.initial[field] else 'false'

        
#相続人情報（兄弟姉妹）
class StepThreeCollateralForm(forms.ModelForm):
    # [id]_[content_type]の形式文字列、不動産取得者用
    id_and_content_type = forms.CharField(widget=forms.HiddenInput())
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
        
        if self.instance:
            self.fields["id_and_content_type"].initial = str(self.instance.id) + "_" + str(ContentType.objects.get_for_model(self.instance).id)
        for field in ["is_acquire"]:
            if self.initial.get(field) is not None:
                self.initial[field] = 'true' if self.initial[field] else 'false'
        
#遺産分割の方法
class StepThreeTypeOfDivisionForm(forms.ModelForm):
    all_cash_acquirer = forms.ChoiceField(choices=[("", "選択してください")], widget=forms.Select())
    
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
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            if field.label in  ["遺産分割協議書の種類", "不動産の分配方法", "換価した金銭の分配方法"]:
                field.widget.attrs.update({
                    "class": "form-check-input",
                })
            else:
                field.widget.attrs.update({
                    "class": "form-select text-center cursor-pointer rounded-end",
                })

        super().__init__(*args, **kwargs)
        
#不動産の数
class StepThreeNumberOfPropertiesForm(forms.ModelForm):
    class Meta:
        model = NumberOfProperties
        fields = model.step_three_fields

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
            if field.label != "被相続人":
                field.widget.attrs.update({
                    "class": "form-control text-center no-spin",
                })
                
        super().__init__(*args, **kwargs)
        
#土地
class StepThreeLandForm(forms.ModelForm):
    index = forms.CharField(required=False, widget=forms.HiddenInput(), initial="0")
    
    class Meta:
        model = Land
        fields = model.step_three_fields
        widgets = {
            "is_exchange": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
            "purparty": forms.HiddenInput(),
            "land_number": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
            if field.label in ["不動産番号", "所在地", "地積", "法務局"]:
                field.widget.attrs.update({
                    "class": "form-control rounded-end",
                })
                if field.label == "不動産番号":
                    field.widget.attrs.update({
                        "placeholder": "１３桁の数字",
                        "maxlength": "13",
                    })
                elif field.label == "所在地":
                    field.widget.attrs.update({
                        "placeholder": "福岡県福岡市中央区天神１丁目",
                        "maxlength": "100",
                    })
                elif field.label == "法務局":
                    field.widget.attrs.update({
                        "placeholder": "不動産番号を入力すると自動で表示されます",
                        "maxlength": "30",
                        "disabled": "true",
                    })
                    # ここで "法務局" のフィールドに対して追加のクラスを加える
                    existing_classes = field.widget.attrs.get("class", "")
                    new_classes = f"{existing_classes} text-center"
                    field.widget.attrs.update({"class": new_classes})
            elif field.label == "固定資産評価額":
                field.widget.attrs.update({
                    "class": "form-control text-center rounded-end",
                })
            elif field.label == "地目":
                field.widget.attrs.update({
                    "class": "form-select text-center cursor-pointer rounded-end",
                })
            elif field.label ==  "換価対象":
                field.widget.attrs.update({
                    "class": "form-check-input",
                })
            elif field.label == "持ち分":
                field.initial = "分の"
            elif field.label == "地番":
                field.initial = "番"

        super().__init__(*args, **kwargs)

#土地取得者
class StepThreeLandAcquirerForm(forms.ModelForm):
    target = forms.CharField(required=False, widget=forms.HiddenInput())
    
    class Meta:
        model = PropertyAcquirer
        fields = model.step_three_fields
        widgets = {
            "content_type2": forms.HiddenInput(),
            "object_id2": forms.HiddenInput(),
            "percentage": forms.HiddenInput(),
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
        fields = model.step_three_fields
        widgets = {
            "content_type2": forms.HiddenInput(),
            "object_id2": forms.HiddenInput(),
            "percentage": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
        super().__init__(*args, **kwargs)

#建物
class StepThreeHouseForm(forms.ModelForm):
    index = forms.CharField(required=False, widget=forms.HiddenInput(), initial="0")
    
    class Meta:
        model = House
        fields = model.step_three_fields
        widgets = {
            "is_exchange": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
            "purparty": forms.HiddenInput(),
            "house_number": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
            if field.label in ["不動産番号", "所在地", "法務局"]:
                field.widget.attrs.update({
                    "class": "form-control rounded-end",
                })
                if field.label == "不動産番号":
                    field.widget.attrs.update({
                        "placeholder": "１３桁の数字",
                        "maxlength": "13",
                    })
                elif field.label == "所在地":
                    field.widget.attrs.update({
                        "placeholder": "福岡県福岡市中央区天神１丁目１番地１",
                        "maxlength": "100",
                    })
                elif field.label == "法務局":
                    field.widget.attrs.update({
                        "placeholder": "不動産番号を入力すると自動で表示されます",
                        "maxlength": "30",
                        "disabled": "true",
                    })
                    # ここで "法務局" のフィールドに対して追加のクラスを加える
                    existing_classes = field.widget.attrs.get("class", "")
                    new_classes = f"{existing_classes} text-center"
                    field.widget.attrs.update({"class": new_classes})
            elif field.label == "固定資産評価額":
                field.widget.attrs.update({
                    "class": "form-control text-center rounded-end",
                })
            elif field.label == "種類":
                field.widget.attrs.update({
                    "class": "form-select text-center cursor-pointer rounded-end",
                })
            elif field.label ==  "換価対象":
                field.widget.attrs.update({
                    "class": "form-check-input",
                })
            elif field.label == "持ち分":
                field.initial = "分の"
            elif field.label == "家屋番号":
                field.initial = "番"

        super().__init__(*args, **kwargs)

#建物取得者
class StepThreeHouseAcquirerForm(forms.ModelForm):
    target = forms.CharField(required=False, widget=forms.HiddenInput())
    
    class Meta:
        model = PropertyAcquirer
        fields = model.step_three_fields
        widgets = {
            "content_type2": forms.HiddenInput(),
            "object_id2": forms.HiddenInput(),
            "percentage": forms.HiddenInput(),
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
        fields = model.step_three_fields
        widgets = {
            "content_type2": forms.HiddenInput(),
            "object_id2": forms.HiddenInput(),
            "percentage": forms.HiddenInput(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            
        super().__init__(*args, **kwargs)

#区分建物
# class StepThreeHouseForm(forms.ModelForm):
#     index = forms.CharField(required=False, widget=forms.HiddenInput(), initial="0")
    
#     class Meta:
#         model = House
#         fields = model.step_three_fields
#         widgets = {
#             "is_exchange": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
#             "purparty": forms.HiddenInput(),
#             "house_number": forms.HiddenInput(),
#         }

#     def __init__(self, *args, **kwargs):
#         for field in self.base_fields.values():
#             field.required = False
            
#             if field.label in ["不動産番号", "所在地", "法務局"]:
#                 field.widget.attrs.update({
#                     "class": "form-control rounded-end",
#                 })
#                 if field.label == "不動産番号":
#                     field.widget.attrs.update({
#                         "placeholder": "１３桁の数字",
#                         "maxlength": "13",
#                     })
#                 elif field.label == "所在地":
#                     field.widget.attrs.update({
#                         "placeholder": "福岡県福岡市中央区天神１丁目１番地１",
#                         "maxlength": "100",
#                     })
#                 elif field.label == "法務局":
#                     field.widget.attrs.update({
#                         "placeholder": "不動産番号を入力すると自動で表示されます",
#                         "maxlength": "30",
#                         "disabled": "true",
#                     })
#                     # ここで "法務局" のフィールドに対して追加のクラスを加える
#                     existing_classes = field.widget.attrs.get("class", "")
#                     new_classes = f"{existing_classes} text-center"
#                     field.widget.attrs.update({"class": new_classes})
#             elif field.label == "固定資産評価額":
#                 field.widget.attrs.update({
#                     "class": "form-control text-center rounded-end",
#                 })
#             elif field.label == "種類":
#                 field.widget.attrs.update({
#                     "class": "form-select text-center cursor-pointer rounded-end",
#                 })
#             elif field.label ==  "換価対象":
#                 field.widget.attrs.update({
#                     "class": "form-check-input",
#                 })
#             elif field.label == "持ち分":
#                 field.initial = "分の"
#             elif field.label == "家屋番号":
#                 field.initial = "番"

#         super().__init__(*args, **kwargs)
        
# class StepThreeHouseForm(forms.ModelForm):
#     index = forms.CharField(required=False, widget=forms.HiddenInput(), initial="0")
    
#     class Meta:
#         model = House
#         fields = model.step_three_fields
#         widgets = {
#             "is_exchange": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
#             "purparty": forms.HiddenInput(),
#             "house_number": forms.HiddenInput(),
#         }

#     def __init__(self, *args, **kwargs):
#         for field in self.base_fields.values():
#             field.required = False
            
#             if field.label in ["不動産番号", "所在地", "法務局"]:
#                 field.widget.attrs.update({
#                     "class": "form-control rounded-end",
#                 })
#                 if field.label == "不動産番号":
#                     field.widget.attrs.update({
#                         "placeholder": "１３桁の数字",
#                         "maxlength": "13",
#                     })
#                 elif field.label == "所在地":
#                     field.widget.attrs.update({
#                         "placeholder": "福岡県福岡市中央区天神１丁目１番地１",
#                         "maxlength": "100",
#                     })
#                 elif field.label == "法務局":
#                     field.widget.attrs.update({
#                         "placeholder": "不動産番号を入力すると自動で表示されます",
#                         "maxlength": "30",
#                         "disabled": "true",
#                     })
#                     # ここで "法務局" のフィールドに対して追加のクラスを加える
#                     existing_classes = field.widget.attrs.get("class", "")
#                     new_classes = f"{existing_classes} text-center"
#                     field.widget.attrs.update({"class": new_classes})
#             elif field.label == "固定資産評価額":
#                 field.widget.attrs.update({
#                     "class": "form-control text-center rounded-end",
#                 })
#             elif field.label == "種類":
#                 field.widget.attrs.update({
#                     "class": "form-select text-center cursor-pointer rounded-end",
#                 })
#             elif field.label ==  "換価対象":
#                 field.widget.attrs.update({
#                     "class": "form-check-input",
#                 })
#             elif field.label == "持ち分":
#                 field.initial = "分の"
#             elif field.label == "家屋番号":
#                 field.initial = "番"

#         super().__init__(*args, **kwargs)
        
# #建物取得者
# class StepThreeHouseAcquirerForm(forms.ModelForm):
#     target = forms.CharField(required=False, widget=forms.HiddenInput())
    
#     class Meta:
#         model = PropertyAcquirer
#         fields = model.step_three_fields
#         widgets = {
#             "content_type2": forms.HiddenInput(),
#             "object_id2": forms.HiddenInput(),
#             "percentage": forms.HiddenInput(),
#         }

#     def __init__(self, *args, **kwargs):
#         for field in self.base_fields.values():
#             field.required = False
            
#         super().__init__(*args, **kwargs)

# #建物金銭取得者
# class StepThreeHouseCashAcquirerForm(forms.ModelForm):
#     target = forms.CharField(required=False, widget=forms.HiddenInput())
    
#     class Meta:
#         model = CashAcquirer
#         fields = model.step_three_fields
#         widgets = {
#             "content_type2": forms.HiddenInput(),
#             "object_id2": forms.HiddenInput(),
#             "percentage": forms.HiddenInput(),
#         }

#     def __init__(self, *args, **kwargs):
#         for field in self.base_fields.values():
#             field.required = False
            
#         super().__init__(*args, **kwargs)
                
#申請情報
class StepThreeApplicationForm(forms.ModelForm):
    applicant = forms.ChoiceField(choices=[("", "選択してください")], widget=forms.Select())
    
    class Meta:
        model = Application
        index = model.step_three_fields.index("is_agent")
        model.step_three_fields.insert(index, "applicant")
        # decedent, content_type, object_id, (applicant), is_agent, agent_name, agent_address, agent_phone_number, is_return, is_mail,
        fields = model.step_three_fields
        widgets = {
            "is_agent": forms.RadioSelect(choices=[("true", "はい"), ("false", "いいえ")]),
            "is_return": forms.RadioSelect(choices=[("true", "する"), ("false", "しない")]),
            "is_mail": forms.RadioSelect(choices=[("true", "郵送する"), ("false", "持参する")]),
        }
        labels = {
            "agent_name": "氏名",
            "agent_address": "住所",
            "agent_phone_number": "電話番号"
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
            if field.label in ["被相続人", "申請人", "申請人id",]:
                continue
            elif field.label in ["氏名", "住所", "電話番号"]:
                field.widget.attrs.update({
                    "class": "form-control rounded-end",
                })
                if field.label == "氏名":
                    field.widget.attrs.update({
                        "placeholder": "フルネームで姓名間にスペースなし",
                        "maxlength": "30",
                    })
                elif field.label == "住所":
                    field.widget.attrs.update({
                        "placeholder": "福岡県福岡市中央区天神１丁目１番１号",
                        "maxlength": "100",
                    })
                elif field.label == "電話番号":
                    field.widget.attrs.update({
                        "placeholder": "０９０－ＸＸＸＸ－ＸＸＸＸ",
                        "maxlength": "13",
                    })
            elif field.label in ["代理人の有無", "原本還付の有無", "郵送の有無"]:
                field.widget.attrs.update({
                    "class": "form-check-input",
                })
            else:
                field.widget.attrs.update({
                    "class": "form-select text-center cursor-pointer rounded-end",
                })

        super().__init__(*args, **kwargs)