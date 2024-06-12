from django.conf import settings
from django.contrib import messages
from django.core.mail import BadHeaderError, EmailMessage
from django.db.models import Func, Q, Sum
from django.db.models.functions import Coalesce
from django.db.models import Aggregate, BooleanField
from django.shortcuts import render, redirect, get_object_or_404
from django.utils.timezone import make_aware
from datetime import datetime, timedelta
from email.mime.application import MIMEApplication
from email.encoders import encode_base64
from email.header import Header
from email.mime.base import MIMEBase
from email.utils import formataddr
from typing import Union, List, Tuple

import mojimoji
import re
import requests
import secrets
import unicodedata

from common.const import common
from toukiApp.company_data import CompanyData

def int_to_string_with_commas(number):
    """
    
        整数をコンマ付きの文字列に変換する
    
    """
    return "{:,}".format(number)

def zenkaku_currency_to_int(value):
    """
    
        全角の数字（コンマあり）をintに変換する
        
    """
    normalized_value = unicodedata.normalize('NFKC', value)
    # コンマを除去
    normalized_value = normalized_value.replace(',', '')
    # 文字列を整数に変換
    try:
        return int(normalized_value)
    except ValueError as e:
        return None
    
class BoolOr(Aggregate):
    """
    
        boolの値を集計する
        
    """
    function = 'BOOL_OR'
    name = 'BoolOr'
    template = '%(function)s(%(expressions)s)'
    allow_distinct = False
    output_field = BooleanField()
    
def extract_numbers_and_convert_to_hankaku(s):
    """
    
        数字のみを抽出して半角に変換して返す
        
    """
    zenkaku_to_hankaku_table = str.maketrans('０１２３４５６７８９', '0123456789')
    
    hankaku_string = s.translate(zenkaku_to_hankaku_table)
    
    return ''.join(filter(str.isdigit, hankaku_string))


def string_to_int(s, extract=False, strict=True):
    """

        文字列を数値型に変換する(extract=True にすると数字のみを抽出して変換する)
    
    """
    s = mojimoji.zen_to_han(s, kana=False, digit=True, ascii=False)
    
    if extract:
        # 正規表現を使用して、文字列から数字のみを抽出する
        numbers = re.findall(r'[0-9０-９]+', s)
        # 数字のみの文字列を連結して数値型に変換する
        numeric_value = int(''.join(numbers))
        return numeric_value
    
    if s.isdigit():
        return int(s)
    
    if strict:
        raise ValueError("数字以外の文字が含まれています。")
        
    return s

def trim_all_space(s):
    """
    
        文字列中の全てのスペース、タブ、改行を削除する
        
    """
    return re.sub(r"\s+", "", s)

def get_boolean_session(session, session_name):
    """
    
        booleanのセッションを取得する
        
    """
    if session_name in session and session[session_name]:
        del session[session_name]
        return True
    
    return False

def string_to_datetime(datetime_format, s):
    """string型の日時をdatetimeに変換する

    Args:
        datetime_format (string): 日時のフォーマット
        s (string): 文字列

    Returns:
        datetime: _description_
    """
    process_date_naive = datetime.strptime(s, datetime_format)
    return make_aware(process_date_naive)

def checkbox_value_to_boolean(val):
    """
    
        チェックボックスのvalueをboolに変換する
        
    """
    return True if val == "on" else False

def send_email_to_user(user, subject, content, attachments = None):
    """ユーザーに対するメール送信テンプレート
        
        Args:
            user (User): ユーザーインスタンスまたは辞書型(userがannonymousのとき)
            subject (str): 件名
            content (str): 本文
            attachments (list[tuple[str, bytes, str]], optional): 添付ファイル (ファイル名, ファイル, MIME)のタプルのリスト。デフォルトはなし

    """
    mail_subject = f"{CompanyData.APP_NAME}＜{subject}＞"
    to_mail = user["email"] if isinstance(user, dict) else user.email
    username = user["username"] if isinstance(user, dict) else user.username
    
    content = common.EMAIL_TEMPLATE.format(
        username = username,
        content = content,
        company_name = CompanyData.NAME,
        company_post_number = CompanyData.POST_NUMBER,
        company_address = CompanyData.ADDRESS,
        company_bldg = CompanyData.BLDG,
        company_receiving_phone_number = CompanyData.RECEIVING_PHONE_NUMBER,
        company_calling_phone_number = CompanyData.CALLING_PHONE_NUMBER,
        company_opening_hours = CompanyData.OPENING_HOURS,
        company_url = CompanyData.URL,
    )
    
    from_email = formataddr((CompanyData.NAME, settings.DEFAULT_FROM_EMAIL))
    to_list = [to_mail]
    bcc_list = [settings.DEFAULT_FROM_EMAIL]
    message = EmailMessage(
        subject=mail_subject, 
        body=content, 
        from_email=from_email, 
        to=to_list, 
        bcc=bcc_list,
    )
    
    # 添付ファイルの処理
    if attachments:
        for attachment in attachments:
            file_name, file_data, mime = attachment
            encoded_file_name = Header(file_name, 'utf-8').encode()
            message.attach(encoded_file_name, file_data, mime)
            
    message.send()
    
def download_file(download_uri):
    """
    
        ダウンロードリンクからファイルをダウンロードする
        
    """
    response = requests.get(download_uri)
    
    if response.status_code == 200:
        return {"message": "", "data": response.content}
    else:
        return {"message": f"ファイルのダウンロードに失敗, {response.status_code}", "data": ""}
    
def get_or_create_session_id(request) -> str:
    """
    
        SessionIDを生成または取得する

    """
    session_id = request.session.session_key
    if not session_id:
        request.session.create()
        session_id = request.session.session_key
        
    return session_id

def is_valid_request_method(request, method: Union[List[str], Tuple[str]], should_match: bool, need_message: bool = True) -> bool:
    """
    
        リクエストのメソッドが適切か判定
        
        should_matchがTrueかつmethodと一致 または should_matchがFalseかつmethodと不一致 = True
    
    """
    if (should_match and request.method in method) or (not should_match and request.method not in method):
        return True
    
    if need_message:
        messages.warning(request, "アクセス不可 不正なリクエストです。")
        
    return False

def is_anonymous(request, need_message = True):
    """

        非会員判定
    
    """
    if request.user.is_authenticated:
        return False
    
    if need_message:
        messages.warning(request, "アクセス制限 会員専用のページです。\nログインしてください。")
        
    return True