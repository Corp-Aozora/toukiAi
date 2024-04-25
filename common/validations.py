from django.core import validators
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

import re

def validate_katakana(value):
    """カタカナのみ検証"""
    katakana_regex = re.compile(r'^[\u30A0-\u30FF]+$')
    
    if not katakana_regex.match(value):
        raise ValidationError(
            _('カタカナのみで入力してください。'),
            code='invalid'
        )
        
class JapaneseOnlyUsernameValidator(validators.RegexValidator):
    """日本語のみ検証"""
    regex = r"^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF]+$"
    message = _(
        "ユーザー名には日本語の文字（ひらがな、カタカナ、漢字）のみ使用できます。"
    )
    flags = 0