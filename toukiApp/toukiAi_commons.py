import mojimoji
from django.db.models.query import QuerySet
from django.core.exceptions import ValidationError
import inspect
from .prefectures_and_city import *
import textwrap
from .company_data import *
from .sections import *
from django.core.mail import EmailMessage
import traceback
from datetime import datetime
import logging
from django.conf import settings


logger = logging.getLogger(__name__)

def basic_log(function_name, e, user, message = None):
    """基本的なログ情報

    Args:
        function_name (str): 関数名
        e (_type_): エラークラスから生成されたオブジェクト
        user (User): 対象のユーザー
        message (str, optional): 特記事項. Defaults to None.
    """
    traceback_info = traceback.format_exc()
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    user_id = user.id if user else ""
    logger.error(f"エラー発生箇所:{function_name}\n\
        開発者メッセージ:{message}\n\
        詳細：{e}\n\
        user_id:{user_id}\n\
        発生時刻：{current_time}\n\
        経路:{traceback_info}"
    )

def fullwidth_num(number):
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
        return f"金{fullwidth_num(val)}円"
    elif val < 100000000:
        # 10,000以上、1億未満の場合
        man = val // 10000
        remain = val % 10000
        return f"金{fullwidth_num(man)}万{fullwidth_num(remain)}円" if remain else f"金{fullwidth_num(man)}万円"
    else:
        # 1億以上の場合
        oku = val // 100000000
        remain = val % 100000000
        man = remain // 10000
        remain = remain % 10000
        if man and remain:
            return f"金{fullwidth_num(oku)}億{fullwidth_num(man)}万{fullwidth_num(remain)}円"
        elif man:
            return f"金{fullwidth_num(oku)}億{fullwidth_num(man)}万円"
        else:
            return f"金{fullwidth_num(oku)}億円"

def get_wareki(instance, is_birth):
    """和暦を取得する
    
    0000(元号0年)の形式のデータ

    Args:
        instance (_type_): _description_
        is_birth (bool): _description_

    Returns:
        _type_: _description_
    """
    end_idx = len(instance.birth_year) - 1 if is_birth else len(instance.death_year) - 1
    if is_birth:
        birth_date = instance.birth_year[5:end_idx] + instance.birth_month + "月" + instance.birth_date + "日"
        return mojimoji.han_to_zen(birth_date)
    else:
        death_date = instance.death_year[5:end_idx] + instance.death_month + "月" + instance.death_date + "日"
        return mojimoji.han_to_zen(death_date)
    
def is_data(data):
    """データが存在するかどうかを判定する。

    Args:
        data (list, tuple, QuerySet, or any): チェックするデータ。

    Returns:
        bool: データが存在する場合はTrue、そうでない場合はFalse。
    """
    if isinstance(data, QuerySet):
        return data.exists()
    elif isinstance(data, (list, tuple)):
        for x in data:
            if isinstance(x, QuerySet):
                if x.exists():
                    return True
            elif x:
                return True
        return False
    else:
        return data is not None
        
def get_querysets_by_condition(models, decedent, filter_conditions=None, is_first=False, check_exsistance=False, related_fields=None):
    """指定されたモデル(またはモデルのリスト)に対して任意のフィルタ条件でフィルタし、
    関連フィールドを結合するクエリセット(またはクエリセットのリスト)を返す。

    Args:
        models (Django model class or list of Django model classes): Djangoのモデルクラス、またはそのリスト。
        filter_conditions (dict): フィルタ条件を格納した辞書。
        is_first (bool): 最初のクエリセットのみフラグ
        check_exsistance: データ存在チェックフラグ 
        related_fields (dict of list of str, optional): モデルごとにselect_relatedで取得するフィールド名のリストを格納した辞書。

    Returns:
        Django queryset or list of Django querysets: フィルタリングされ、関連フィールドが結合されたクエリセット、またはそのリスト。
    """
    # modelsがモデルクラスのリストでない場合、リストに変換する
    if not isinstance(models, list):
        models = [models]

    if filter_conditions is None:
        filter_conditions = {"decedent": decedent}
        
    results = []
    for model in models:
        queryset = model.objects.filter(**filter_conditions)
        
        if related_fields and model in related_fields:
            queryset = queryset.select_related(*related_fields[model])

        if check_exsistance and not queryset.exists():
            raise ValueError(f"{get_current_function_name()}\n{model.__name__}に対応するデータがフィルタ条件{filter_conditions}で見つかりませんでした。")

        if is_first:
            result = queryset.first()
            if result:
                results.append(result)
        else:
            results.extend(queryset)

    return results if len(models) > 1 or not is_first else results[0]

def get_filtered_instances(instances, attributes, expected_values):
    """渡されたインスタンスを格納したリスト、クエリセットから特定の属性に対する特定の要素を取得する
    
    attributes と expected_values は、単一の値またはリスト（タプル）形式で渡すことができる。
    """

    # attributes と expected_values をリスト化する（単一の値の場合）
    if not isinstance(attributes, (list, tuple)):
        attributes = [attributes]
    if not isinstance(expected_values, (list, tuple)):
        expected_values = [expected_values]
    
    # 属性と期待される値のリストの長さをチェック
    if len(attributes) != len(expected_values):
        raise ValueError("属性と期待される値のリストの長さが一致しません。")
    
    return [
        x for x in instances
        if all(hasattr(x, attr) and getattr(x, attr) == val for attr, val in zip(attributes, expected_values))
    ]

def get_current_function_name():
    """現在実行中の関数の名前を取得して返すヘルパー関数。"""
    return inspect.currentframe().f_back.f_code.co_name

def compare_dict_by_two_key(x, y, key_one, key_two):
    """２つの辞書のうち２つのキーの値を比較する
    主にtypeとidを比較して要素の同一性を確認するためのもの
    """
    return x[key_one] == y[key_one] and x[key_two] == y[key_two]

# メールの署名部分
EMAIL_SIGNATURE = textwrap.dedent('''
    -----------------------------------------
    {company_name}
    {company_post_number}
    {company_address}
    {company_bldg}
    電話番号 {company_receiving_phone_number}
    ※弊社からお客様にお電話するときの電話番号 {company_calling_phone_number}
    営業時間 {company_opening_hours}
    ホームページ {company_url}
''')

INQUIRY_FULL_TEXT = textwrap.dedent('''
                                    
    件名
    　{inquiry_category}{inquiry_subject}について

    お問い合わせ内容
    　{content}

''')

ANSWER_TO_INQUIRY_EMAIL_TEMPLATE = INQUIRY_FULL_TEXT + EMAIL_SIGNATURE

# 問い合わせへの自動返信メールテンプレート
AUTO_REPLY_EMAIL_TEMPLATE = textwrap.dedent('''
    お問い合わせありがとうございます                                        
                                            
    以下の内容でお問い合わせを受け付けました。
    原則２４時間以内にご回答いたします。
    ※金土日祝日にお問い合わせいただいた場合は、翌週の月曜日になることもあります。
    
    ----------------------------------
''') + ANSWER_TO_INQUIRY_EMAIL_TEMPLATE

# 問い合わせへ回答したときのメールテンプレート
ANSWER_EMAIL_TEMPLATE = textwrap.dedent('''
    {user} 様   
    
    お問い合わせありがとうございます。
    いただいたお問い合わせに対するご回答です。
    
    {answer}

    
    ----------お問い合わせ内容----------
''') + ANSWER_TO_INQUIRY_EMAIL_TEMPLATE

def send_auto_email_to_inquiry(cleaned_data, to_email, is_user=True):
    """問い合わせに対する自動返信メールを送信する

    Args:
        cleaned_data (_type_): フォームのデータ
    """
    mail_subject = f"{CompanyData.APP_NAME}からの自動返信です"
    category = cleaned_data.get("category", "")
    content = AUTO_REPLY_EMAIL_TEMPLATE.format(
        inquiry_category = Sections.get_category(category) + "の" if category else "",
        inquiry_subject = Sections.get_subject(cleaned_data["subject"]) if is_user else cleaned_data["subject"],
        content = cleaned_data["content"], 
        company_name = CompanyData.NAME,
        company_post_number = CompanyData.POST_NUMBER,
        company_address = CompanyData.ADDRESS,
        company_bldg = CompanyData.BLDG,
        company_receiving_phone_number = CompanyData.RECEIVING_PHONE_NUMBER,
        company_calling_phone_number = CompanyData.CALLING_PHONE_NUMBER,
        company_opening_hours = CompanyData.OPENING_HOURS,
        company_url = CompanyData.URL,
    )
    to_list = [to_email]
    bcc_list = [settings.DEFAULT_FROM_EMAIL]
    message = EmailMessage(
        subject=mail_subject, 
        body=content, 
        from_email=settings.DEFAULT_FROM_EMAIL, 
        to=to_list, 
        bcc=bcc_list
    )
    message.send()
    
def send_email_to_inquiry(cleaned_data, is_to_user=True):
    """問い合わせに回答したときのメール送信処理

    Args:
        cleaned_data (): 回答データ
        to_email (): 問い合わせをしたユーザーのメールアドレス
    """
    mail_subject = f"{CompanyData.APP_NAME} お問い合わせへのご回答です"
    
    to_mail = cleaned_data["user_inquiry"].user.email if is_to_user else cleaned_data["open_inquiry"].created_by
    content = ANSWER_EMAIL_TEMPLATE.format(
        user = to_mail,
        answer = cleaned_data["content"],
        inquiry_category = Sections.get_category(cleaned_data["user_inquiry"].category) + "の" if is_to_user else "",
        inquiry_subject = Sections.get_subject(cleaned_data["user_inquiry"].subject) if is_to_user else cleaned_data["open_inquiry"].subject,
        content = cleaned_data["user_inquiry"].content if is_to_user else cleaned_data["open_inquiry"].content,
        company_name = CompanyData.NAME,
        company_post_number = CompanyData.POST_NUMBER,
        company_address = CompanyData.ADDRESS,
        company_bldg = CompanyData.BLDG,
        company_receiving_phone_number = CompanyData.RECEIVING_PHONE_NUMBER,
        company_calling_phone_number = CompanyData.CALLING_PHONE_NUMBER,
        company_opening_hours = CompanyData.OPENING_HOURS,
        company_url = CompanyData.URL,
    )
    to_list = [to_mail]
    bcc_list = [settings.DEFAULT_FROM_EMAIL]
    message = EmailMessage(
        subject=mail_subject, 
        body=content, 
        from_email=settings.DEFAULT_FROM_EMAIL, 
        to=to_list, 
        bcc=bcc_list
    )
    message.send()
    