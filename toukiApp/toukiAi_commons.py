def to_fullwidth(number):
    """半角数字を全角数字に変換する関数
    
    Args:
        number (int): 変換対象の数字
    """
    fullwidth_digits = str.maketrans("0123456789", "０１２３４５６７８９")
    return str(number).translate(fullwidth_digits)

def format_currency_for_application_form(val):
    """登記申請書に記載する金額の形式に変換する

    金◯円、金◯万◯円、金◯億◯万◯円
    
    Args:
        val (int or float): 変換対象の金額

    Returns:
        str: 変換後の金額の文字列
    """
    val = int(val)  # 小数点以下を切り捨てて整数に変換
    if val < 10000:
        # 10,000未満の場合
        return f"金{to_fullwidth(val)}円"
    elif val < 100000000:
        # 10,000以上、1億未満の場合
        man = val // 10000
        remain = val % 10000
        return f"金{to_fullwidth(man)}万{to_fullwidth(remain)}円" if remain else f"金{to_fullwidth(man)}万円"
    else:
        # 1億以上の場合
        oku = val // 100000000
        remain = val % 100000000
        man = remain // 10000
        remain = remain % 10000
        if man and remain:
            return f"金{to_fullwidth(oku)}億{to_fullwidth(man)}万{to_fullwidth(remain)}円"
        elif man:
            return f"金{to_fullwidth(oku)}億{to_fullwidth(man)}万円"
        else:
            return f"金{to_fullwidth(oku)}億円"