from django import template

register = template.Library()


@register.filter
def get_item(value, key):
    if value is None:
        return ""

    try:
        if isinstance(value, list):
            return value[int(key)]
        return value.get(key, "")
    except (AttributeError, IndexError, TypeError, ValueError):
        return ""


@register.filter
def split(value, separator=","):
    return str(value or "").split(separator)
