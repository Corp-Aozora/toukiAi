from django import template
import unicodedata

register = template.Library()

@register.filter
def until(value, arg):
    """引数で与えられた文字列までの文章を返す"""
    index = value.find(arg)
    if index == -1:
        return value
    else:
        return value[:index]
    
@register.filter
def after(value, arg):
    """引数で与えられた文字列以降の文章を返す"""
    try:
        index = value.index(arg)
        return value[index+len(arg):]
    except ValueError:
        return value

@register.filter
def addstr(arg1, arg2):
    """文字連結"""
    return str(arg1) + str(arg2)

@register.filter
def to_full_width(value):
    """数字を全角にする"""
    return str(value).translate(str.maketrans('0123456789', '０１２３４５６７８９'))

@register.filter(name='to_half_width_digits')
def to_half_width_digits(value):
    """文字列中の全角数字を半角数字に変換"""
    normalized = unicodedata.normalize('NFKC', value)
    # 特別な文字の置換（全角カンマを半角カンマに）
    return normalized.replace('，', ',')
    
@register.filter
def get_item(list, index):
    """リストから対象の要素を取得する"""
    return list[index]

@register.filter(name='classname')
def classname(obj):
    """クラス名を取得する"""
    return obj.__class__.__name__