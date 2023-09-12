from django import template

register = template.Library()

@register.filter
def until(value, arg):
    index = value.find(arg)
    if index == -1:
        return value
    else:
        return value[:index]
    
@register.filter
def after(value, arg):
    try:
        index = value.index(arg)
        return value[index+len(arg):]
    except ValueError:
        return value