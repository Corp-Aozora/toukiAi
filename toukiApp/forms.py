from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import get_user_model
from .company_data import Service
from django.utils import timezone
from .models import *

CustomUser = get_user_model()
decendant_max_index = 7

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
            "placeholder": "弊社からの回答が届くメールアドレス",
        })
        
        self.base_fields["subject"].widget.attrs.update({"class": "form-select text-center cursor-pointer"})
        
        self.base_fields['content'].widget.attrs.update({
            'class': 'form-control rounded-end',
            "placeholder": "問い合わせは何回しても対応してくれるの？\nホームページのデザイン質素すぎじゃない？\n(※300文字まで)",
            "style":"resize:none;"
        })
                
        super().__init__(*args, **kwargs)

# STEP1の被相続人フォーム
class StepOneDecendantForm(forms.ModelForm):
    class Meta:
        model = Decendant
        fields = model.step_one_fields
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
                    field.widget.attrs.update({"class": "form-control rounded-end"})
                    field.widget.attrs.update({"placeholder": "姓名間にスペースなし"})
                    field.widget.attrs.update({"maxlength": "30"})
                else:
                    field.widget.attrs.update({"class": "form-select text-center cursor-pointer rounded-end"})
                    
                    if field.label in ["本籍地の市区町村", "住所の市区町村"]:
                        field.disabled = True
                
        super().__init__(*args, **kwargs)
    
# STEP1の配偶者フォーム
class StepOneSpouseForm(forms.ModelForm):
    class Meta:
        model = Relation
        #decendant, relation, name, exist, is_live, is_japan, is_adult
        fields = model.step_one_fields
        widgets = {
            "exist": forms.RadioSelect(),
            "is_live": forms.RadioSelect(),
            "is_japan": forms.RadioSelect(),
        }
        
        ##idとnameを変更する必要あり！

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["relation"].initial = "配偶者"
        self.fields["is_adult"].initial = True
        self.fields["exist"].choices = [
            (0, "いる"),
            (1, "いない"),
        ]
        
        for field in self.base_fields.values():
            field.required = False
                
