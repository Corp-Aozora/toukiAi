from django import template

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
    """concatenate arg1 & arg2"""
    return str(arg1) + str(arg2)

@register.filter
def to_full_width(value):
    return str(value).translate(str.maketrans('0123456789', '０１２３４５６７８９'))

@register.filter
def get_item(list, index):
    return list[index]

@register.filter(name='classname')
def classname(obj):
    return obj.__class__.__name__