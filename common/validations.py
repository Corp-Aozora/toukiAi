from django.core import validators
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

import mojimoji
import re

from .utils import string_to_int

def validate_katakana(val):
    """
    
        カタカナのみ検証
        
    """
    katakana_regex = re.compile(r'^[\u30A0-\u30FF]+$')
    
    if not katakana_regex.match(val):
        raise ValidationError(
            _('カタカナのみで入力してください。'),
            code='invalid'
        )
        
class JapaneseOnlyValidator(validators.RegexValidator):
    """
    
        日本語のみ検証
        
    """
    regex = r"^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF]+$"
    message = _(
        "ひらがな、カタカナ、漢字のみで入力してください。"
    )
    flags = 0
    
def validate_no_hyphen_phone_number(val):
    """
    
        全角数字のみで、10桁または11桁の正規表現
        
    """
    pattern = r'^[\uFF10-\uFF19]{10,11}$'
    if re.match(pattern, val):
        return True
    else:
        return False

def validate_halfwidth_numbers(val):
    """
    
        半角の数字のみ検証
        
    """
    pattern = re.compile(r'^[0-9]+$')
    if not pattern.match(val):
        raise ValidationError(f'数字のみを入力してください。\n入力値: {val}')
    
def validate_four_digit_number(val):
    """
    
        4桁の数字か検証
        
    """
    intVal = val if isinstance(val, int) else string_to_int(val, False, True)
    
    if intVal < 1000 or intVal > 9999:
        raise ValidationError(f'4桁の数字で入力してください。\n入力値: {val}')
    
