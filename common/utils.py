from django.db.models import Func, Q, Sum
from django.db.models.functions import Coalesce
from django.db.models import Aggregate, BooleanField

import unicodedata

def zenkaku_currency_to_int(value):
    """全角の数字（コンマあり）をintに変換する"""
    normalized_value = unicodedata.normalize('NFKC', value)
    # コンマを除去
    normalized_value = normalized_value.replace(',', '')
    # 文字列を整数に変換
    try:
        return int(normalized_value)
    except ValueError as e:
        return None
    
class BoolOr(Aggregate):
    """boolの値を集計する"""
    function = 'BOOL_OR'
    name = 'BoolOr'
    template = '%(function)s(%(expressions)s)'
    allow_distinct = False
    output_field = BooleanField()