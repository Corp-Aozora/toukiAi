from datetime import datetime
from django.conf import settings
from django.contrib import messages
from django.core.cache import cache
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.core.mail import BadHeaderError, EmailMessage
from django.contrib.contenttypes.models import ContentType
from django.contrib.sites.shortcuts import get_current_site
from django.db import transaction, DatabaseError, OperationalError, IntegrityError, DataError
from django.db.models.query import QuerySet
from django.http import JsonResponse, HttpResponse, FileResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from io import BytesIO
from requests.exceptions import HTTPError, ConnectionError, Timeout
from smtplib import SMTPException
from time import sleep
from urllib.parse import urljoin

import inspect
import json
import logging
import mojimoji
import os
import requests
import tempfile
import textwrap
import traceback
import uuid

from .company_data import *
from .models import RelatedIndividual
from .prefectures_and_city import *
from .sections import *
from .external_info import ExternalLinks

logger = logging.getLogger(__name__)

def raise_exception(function_name, e, **kwargs):
    """親関数にraiseするときの汎用エラー"""
    # kwargsに含まれるキーワード引数の名前と値を文字列として整形
    kwargs_str = "\n".join(f"{key}={value}" for key, value in kwargs.items())
    # 整形した文字列を含む例外メッセージを作成
    message = f"{function_name}でエラー発生：{e}\n{kwargs_str}"
    # 例外を発生させる
    raise Exception(message)

def basic_log(function_name, e, user, message = None, is_traceback_info = True):
    """基本的なログ情報

    Args:
        function_name (str): 関数名
        e (_type_): エラークラスから生成されたオブジェクト
        user (User): 対象のユーザー
        message (str, optional): 特記事項. Defaults to None.
        is_traceback_info (bool, optional): トレースバックのログの要否
    """
    traceback_info = traceback.format_exc() if is_traceback_info else None
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    user_id = user.id if user else ""
    logger.error(f"エラー発生箇所:{function_name}\n\
        発生時刻：{current_time}\n\
        user_id:{user_id}\n\
        開発者メッセージ:{message}\n\
        詳細：{e}\n\
        経路:{traceback_info}"
    )

def handle_error(e, request, user, function_name, redirect_to, is_async=False, context=None, notices=None):
    """親関数でのエラーハンドリング"""
    error_handlers = {
        DatabaseError: handle_data_base_error,
        HTTPError: handle_http_error,
        ConnectionError: handle_connection_error,
        Timeout: handle_time_out_error,
        ValidationError: handle_validation_error,
        ValueError: handle_value_error,
        BadHeaderError: handle_badhead_error,
        SMTPException: handle_smtp_error,
        OSError: handle_os_error,
    }

    for exception_type, handler in error_handlers.items():
        if isinstance(e, exception_type):
            return handler(e, request, user, function_name, redirect_to, is_async, context, notices)

    return handle_exception_error(e, request, user, function_name, redirect_to, is_async, context, notices)

def handle_exception_error(e, request, user, function_name, redirect_to, is_async, context=None, notices=None):
    """汎用エラーハンドリング"""
    if context is None:
        context = {}
        
    basic_log(function_name, e, user, notices)
    
    message = 'システムにエラーが発生したため処理を中止しました。\n\
        お手数ですが、お問い合わせをお願いします。'
    messages.error(request, message)
    
    if is_async:
        context.update({"error_level": "error", "message": message})
    
    return JsonResponse(context, status=400) if is_async else redirect(redirect_to)

def handle_badhead_error(e, request, user, function_name, redirect_to, is_async, context=None, notices=None):
    """無効なヘッダーエラーハンドリング"""
    if context is None:
        context = {}
        
    basic_log(function_name, e, user, notices)
    
    message = '無効なヘッダが検出されたため処理を中止しました。\n\
        お手数ですが、お問い合わせをお願いします。'
    messages.error(request, message)
    
    if is_async:
        context.update({"error_level": "error", "message": message})
    
    return JsonResponse(context, status=400) if is_async else redirect(redirect_to)

def handle_os_error(e, request, user, function_name, redirect_to, is_async, context=None, notices=None):
    """接続、送受信、ソケットエラーハンドリング"""
    if context is None:
        context = {}
        
    basic_log(function_name, e, user, notices)
    
    message = '通信エラーのため処理を中止しました。\n\
        お手数ですが、お問い合わせをお願いします。'
    messages.error(request, message)
    
    if is_async:
        context.update({"error_level": "error", "message": message})
    
    return JsonResponse(context, status=400) if is_async else redirect(redirect_to)

def handle_smtp_error(e, request, user, function_name, redirect_to, is_async, context=None, notices=None):
    """SMTPエラーハンドリング"""
    if context is None:
        context = {}
        
    basic_log(function_name, e, user, "考えられる原因: メールサーバーの認証情報の誤り")
    
    message = 'SMTPエラーのため処理を中止しました。\n\
        お手数ですが、お問い合わせをお願いします。'
    messages.error(request, message)
    
    if is_async:
        context.update({"error_level": "error", "message": message})
    
    return JsonResponse(context, status=400) if is_async else redirect(redirect_to)


def handle_value_error(e, request, user, function_name, redirect_to, is_async, context=None, notices=None):
    """不正な入力値のエラーハンドリング"""
    if context is None:
        context = {}
    
    basic_log(function_name, e, user, notices)
    
    message = '想定しない形式の入力値があるため処理を中止しました。\n\
        入力内容に誤りがないときは、お手数ですがお問い合わせをお願いします。'
    messages.error(request, message)
        
    if is_async:
        context.update({"error_level": "error", "message": message})
    
    return JsonResponse(context, status=400) if is_async else redirect(redirect_to)

def handle_validation_error(e, request, user, function_name, redirect_to, is_async, context=None, notices=None):
    """入力内容や登録されているデータが不正なときのエラーハンドリング"""
    if context is None:
        context = {}
    
    basic_log(function_name, e, user, notices)
    
    message = 'エラー 入力値が登録されているデータと一致しないため処理を中止しました。\
        入力内容に誤りがないときは、お手数ですがお問い合わせをお願いします。'
    messages.error(request, message)
        
    if is_async:
        context.update({"error_level": "error", "message": message})
    
    return JsonResponse(context, status=400) if is_async else redirect(redirect_to)

def handle_time_out_error(e, request, user, function_name, redirect_to, is_async, context=None, notices=None):
    """タイムアウトエラーハンドリング"""
    if context is None:
        context = {}
    
    basic_log(function_name, e, user, notices)
    
    message = 'システムに接続できないため処理を中止しました。\n\
        ネットワーク環境をご確認ください。'
    messages.error(request, message)
            
    if is_async:
        context.update({"error_level": "error", "message": message})
        
    return JsonResponse(context, status=400) if is_async else redirect(redirect_to)

def handle_connection_error(e, request, user, function_name, redirect_to, is_async, context=None, notices=None):
    """接続エラーハンドリング"""
    if context is None:
        context = {}
    
    basic_log(function_name, e, user, notices)
    
    message = '通信エラーが発生したため処理を中止しました。\n\
        数分空けて更新ボタンを押しても問題が解決しない場合は、\
        お手数ですがお問い合わせをお願いします。'
    messages.error(request, message)
            
    if is_async:
        context.update({"error_level": "error", "message": message})
        
    return JsonResponse(context, status=400) if is_async else redirect(redirect_to)

def handle_data_base_error(e, request, user, function_name, redirect_to, is_async, context=None, notices=None):
    """データベース関連のエラーハンドリング"""
    if context is None:
        context = {}
    
    basic_log(function_name, e, user, notices)
    message = 'システムにエラーが発生したため処理を中止しました。\n\
        数分空けて更新ボタンを押しても問題が解決しない場合は、\
        お手数ですがお問い合わせをお願いします。'
    messages.error(request, message)
                
    if is_async:
        context.update({"error_level": "error", "message": message})
        
    return JsonResponse(context, status=400) if is_async else redirect(redirect_to)

def handle_http_error(e, request, user, function_name, redirect_to, is_async, context=None, notices=None):
    """httpエラーハンドリング"""
    if context is None:
        context = {}
    
    basic_log(function_name, e, user, notices)

    # HTTPErrorのresponse属性が存在するかをチェック
    status_code = getattr(e.response, 'status_code', None)

    # status_codeが取得できた場合、それを基にエラーメッセージを生成
    if status_code and status_code == 500:
        if status_code == 500:
            message = 'システムにエラーが発生したため処理を中止しました。\n\
                お手数ですが、お問い合わせをお願いします。'
        else:
            message = f'通信エラー（コード：{status_code}）が発生したため処理を中止しました。\n\
                数分空けて更新ボタンを押しても問題が解決しない場合は、\
                お手数ですがお問い合わせをお願いします。'
    else:
        message = '通信エラーが発生したため処理を中止しました。\n\
            数分空けて更新ボタンを押しても問題が解決しない場合は、\
            お手数ですがお問い合わせをお願いします。'

    messages.error(request, message)
            
    if is_async:
        context.update({"error_level": "error", "message": message})
        
    # HTTP 500 エラーの場合は、専用のエラーページを表示することも検討する
    # if status_code == 500:
    #     return HttpResponseServerError()
    
    # 通常のエラーメッセージ表示用に指定されたテンプレートをレンダリング
    return JsonResponse(context, status=400) if is_async else redirect(redirect_to)

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
    
    function_name = get_current_function_name()
    
    try:
        end_idx = len(instance.birth_year) - 1 if is_birth else len(instance.death_year) - 1
        
        date = instance.birth_year[5:end_idx] + instance.birth_month + "月" + instance.birth_date + "日" if is_birth else \
            instance.death_year[5:end_idx] + instance.death_month + "月" + instance.death_date + "日"
        
        return mojimoji.han_to_zen(date)
        
    except Exception as e:
        basic_log(function_name, e, None, "和暦の取得時にエラー発生")
        raise e
    
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
    else:
        filter_conditions.update({"decedent": decedent})
        
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
    お問い合わせありがとうございます。                                        
                                            
    以下の内容でお問い合わせを受け付けました。
    ※原則２４時間以内にご回答いたします。
    ※金土日祝日にお問い合わせいただいた場合は、翌営業日になることもあります。
    
    ----------------------------------
''') + ANSWER_TO_INQUIRY_EMAIL_TEMPLATE

# 問い合わせへ回答したときのメールテンプレート
ANSWER_EMAIL_TEMPLATE = textwrap.dedent('''
    {user} 様   
    
    お問い合わせありがとうございます。
    いただいたお問い合わせに対するご回答です。
    -----------------------------------
    
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

        お問い合わせの回答は管理者サイトから行う
        
    Args:
        cleaned_data (): 回答データ
        to_email (): 問い合わせをしたユーザーのメールアドレス
    """
    mail_subject = f"{CompanyData.APP_NAME}＜お問い合わせへのご回答です＞"
    
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

def create_related_indivisual(decedent, name, content_type, id, relationship, user):
    instance = RelatedIndividual.objects.create(
        decedent=decedent,
        name=name,
        content_type=content_type,  # descendantまたはcollateralのcontent_type
        object_id=id,  # 対象のdescendantまたはcollateralのid
        relationship=relationship,
        created_by=user,
        updated_by=user
    )
    
    return instance

def get_content_types_for_models(*models):
    """引数で指定された複数のモデルからContentTypeを取得する。"""
    content_types = []
    for model in models:
        try:
            content_types.append(ContentType.objects.get_for_model(model))
        except ObjectDoesNotExist:
            raise ObjectDoesNotExist(f"{get_current_function_name}でエラー\nmodelsの中にContentTypeを取得できない要素があります。\nmodel={model.__name__}")
    return content_types

def get_canonical_url(request, url_name):
    """正規のurlを取得する（www.を削除したurl）"""
    current_site = get_current_site(request)
    canonical_domain = f"https://{current_site.domain}".replace("www.", "")
    canonical_url = f"{canonical_domain}{reverse(url_name)}"
    
    return canonical_url

def get_gdrive_service():
    """gdriveの認証情報を取得する"""
    SCOPES = ['https://www.googleapis.com/auth/drive.file']
    SERVICE_ACCOUNT_FILE = json.loads(settings.GOOGLE_SERVICE_ACCOUNT)

    credentials = service_account.Credentials.from_service_account_info(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)

    # Drive APIのクライアントを作成
    service = build('drive', 'v3', credentials=credentials)

    return service

def upload_to_gdrive(file_path, file_name):
    """gdriveにファイルをアップロード"""
    service = get_gdrive_service()

    file_metadata = {
        'name': file_name,  # Google Driveにアップロードする際のファイル名]
        'parents': [""],  # 使用するときディレクトリidの指定が必要
        'mimeType': 'text/html'
    }
    media = MediaFileUpload(file_path, mimetype='text/html')

    # ファイルをアップロード
    file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
    file_id = file.get('id')

    # ファイルの共有設定を更新（誰でもリンクを知っている人がアクセスできるように設定）
    permission = {
        'type': 'anyone',
        'role': 'reader'
    }
    service.permissions().create(fileId=file_id, body=permission).execute()
    shared_url = f"https://drive.google.com/uc?export=download&id={file_id}"

    return shared_url

def convert_html_to_pdf(request):
    """
    
        htmlをpdfファイルに変換してユーザーにダウンロードさせる
        
        adobe pdf service apiを使用
    
    """
    
    def get_access_token():
        """アクセストークンを取得する"""
        
        def get_response():
            """api通信"""
            url = ExternalLinks.api["adobe_get_access_token"]
            payload = {
                'client_id': settings.ADOBE_CLIENT_ID,
                'client_secret': settings.ADOBE_CLIENT_SECRET,
            }
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
            
            return requests.post(url, data=payload, headers=headers)
        
        def handle_success_process(response):
            """通信が成功したときはアクセストークンを返す"""
            
            data = response.json()
            access_token = data['access_token']
            expires_in = data.get('expires_in', 3600)  # トークンの有効期限（秒）

            cache.set('adobe_access_token', access_token, expires_in - 60)  # 余裕を持って期限の1分前に無効化

            return access_token
            
        # キャッシュからアクセストークンを取得
        access_token = cache.get('adobe_access_token')
        if access_token:
            return access_token

        response = get_response()
        
        if response.status_code == 200:
            return handle_success_process(response)
        else:
            raise Exception(f"{get_current_function_name()}でエラー: {response.status_code}, {response.text}")
    
    def get_header():
        """ヘッダー情報を取得する"""
        access_token = get_access_token()
        return {
            'Authorization': f'Bearer {access_token}',
            "Content_Type": "application/json",
            'x-api-key': settings.ADOBE_CLIENT_ID,
        }
        
    def create_pdf_download_url(asset_id):
        """assetIDからpdfを生成する"""
        function_name = get_current_function_name()
        
        API_URL = 'https://pdf-services-ue1.adobe.io/operation/htmltopdf'
        headers = get_header()
        payload = {
            "assetID": asset_id
        }
        response = requests.post(API_URL, headers=headers, json=payload)
        
        if response.status_code == 201:
            # ステータスURIを取得
            job_status_uri = response.headers["location"]
            # ジョブが完了するまでポーリング
            while True:
                status_response = requests.get(job_status_uri, headers=headers)
                
                if status_response.status_code != 200:
                    raise Exception(f"{function_name}のpollingでエラー: status_code={status_response.status_code}")
                
                status_data = status_response.json()
                
                if status_data["status"] == "done":
                    pdf_url = status_data.get("asset", {}).get("downloadUri")

                    if pdf_url:
                        return pdf_url
                    else:
                        raise Exception(f"{function_name}のpdfのダウンロードリンクの取得処理でエラー")
                elif status_data["status"] == "failed":
                    error_message = status_data.get("error", {}).get("message", "Unknown error")
                    raise Exception(f"{function_name}のPDF生成中の処理でエラー: {error_message}")
                
                sleep(0.25) # 少し待ってから再度ポーリング
        else:
            error_detail = response.json()
            raise Exception(f'{function_name}のPDF生成でエラー: status code={response.status_code}, detail={error_detail}')
        
    def get_presigned_uri():
        """アップロード先のurl情報を生成する"""
        url = "https://pdf-services-ue1.adobe.io/assets"
        headers = get_header()
        data = {
            'mediaType': "text/html"
        }
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f'{get_current_function_name()}でエラー: status code={response.status_code}')

    def upload_html_content_to_presigned_uri(presigned_uri, html_content):
        headers = {
            'Content-Type': 'text/html'
        }
        response = requests.put(presigned_uri, headers=headers, data=html_content.encode('utf-8'))
            
        if response.status_code != 200:
            raise Exception(f'htmlファイルのアップロードでエラー: status code={response.status_code}')

    def create_asset(html_content):
        """一時HTMLファイルを作成してassetに登録してassetIDを返す"""
        # プリサインドURIを取得
        presigned_response = get_presigned_uri()
        uploadUri_uri = presigned_response['uploadUri']
        asset_id = presigned_response['assetID']
        
        # HTMLファイルをプリサインドURIにアップロード
        upload_html_content_to_presigned_uri(uploadUri_uri, html_content)
        
        return asset_id
    
    """
    
        メイン処理
    
    """
    if request.method == 'POST':

        try:
            data = json.loads(request.body)
            html_content = data.get('html_content', '')

            asset_id = create_asset(html_content)
            pdf_url  = create_pdf_download_url(asset_id)
            return JsonResponse({"pdf_url": pdf_url})
        except Exception as e:
            return handle_error(
                e,
                request,
                request.user,
                get_current_function_name(),
                None,
                True
            )

    return JsonResponse({'status': 'error', "message": "POST以外のメソッドでアクセスがありました"}, status=405)