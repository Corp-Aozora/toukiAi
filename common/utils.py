from django.db.models import Func, Q, Sum
from django.db.models.functions import Coalesce
from django.db.models import Aggregate, BooleanField

import re
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
    
def extract_numbers_and_convert_to_hankaku(s):
    """数字のみを抽出して半角に変換して返す"""
    zenkaku_to_hankaku_table = str.maketrans('０１２３４５６７８９', '0123456789')
    
    hankaku_string = s.translate(zenkaku_to_hankaku_table)
    
    return ''.join(filter(str.isdigit, hankaku_string))

def trim_all_space(s):
    """文字列中の全てのスペース、タブ、改行を削除する"""
    return re.sub(r"\s+", "", s)
