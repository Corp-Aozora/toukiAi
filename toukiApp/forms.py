from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from .company_data import Service
from django.utils import timezone
from .models import *

CustomUser = get_user_model()

# 一般お問い合わせ
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
            "placeholder": "弊社からの回答が届くメールアドレス",
        })
        
        self.base_fields["subject"].widget.attrs.update({"class": "form-select text-center cursor-pointer"})
        
        self.base_fields['content'].widget.attrs.update({
            'class': 'form-control rounded-end',
            "placeholder": "例）問い合わせは何回しても対応してくれるの？\n(※300文字まで)",
        })
                
        super().__init__(*args, **kwargs)

# STEP1の被相続人情報
class StepOneDecendantForm(forms.ModelForm):
    class Meta:
        model = Decendant
        fields = model.step_one_fields
        widgets = {
            "city": forms.Select(),
            "domicile_city": forms.Select(),
        }

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            if field.label == "ユーザー":
                field.required = False
            
            else:
                if field.label == "氏名":
                    field.widget.attrs.update({"class": "form-control col-lg-6"})
                    field.widget.attrs.update({"placeholder": "姓名間にスペースなし"})
                    field.widget.attrs.update({"maxlength": "30"})
                else:
                    field.widget.attrs.update({"class": "form-select text-center cursor-pointer"})
                    
                    if field.label in ["本籍地の市区町村", "住所の市区町村"]:
                        field.disabled = True
                
        super().__init__(*args, **kwargs)
    
# STEP1の親族情報  
class StepOneRelationForm(forms.ModelForm):
    class Meta:
        model = Relation
        fields = model.step_one_fields

    def __init__(self, *args, **kwargs):
        for field in self.base_fields.values():
            field.required = False
                
        super().__init__(*args, **kwargs)
