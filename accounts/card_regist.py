from django.conf import settings
from django.core.mail import send_mail
from django.http import JsonResponse

from accounts.models import OptionRequest
from accounts.views import get_option_select_data
from accounts.forms import OptionSelectForm
from common.utils import *
from toukiApp.company_data import Service
from toukiApp.toukiAi_commons import *


import json
import requests

API_KEY = f'Bearer {settings.FINCODE_SECRET_KEY}'
BASE_URL = settings.FINCODE_BASE_URL
ENDPOINT = '/v1/payments'

def create_request(endpoint, data):
    """apiへのリクエストを生成"""
    url = BASE_URL + endpoint
    headers = {
        'Content-Type': 'application/json',
        'Authorization': API_KEY
    }
    return url, headers, data

def exec_card_regist(amount, client_field_1, client_field_2, client_field_3):
    """決済情報登録"""
    data = {
        'pay_type': 'Card',
        "job_code": "CAPTURE",
        "amount": amount,
        "client_field_1": client_field_1,
        "client_field_2": client_field_2,
        "client_field_3": client_field_3
    }
    url, headers, data = create_request(ENDPOINT, data)
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        return response.json()
    else:
        try:
            error_data = response.json()
            if "errors" in error_data and len(error_data["errors"]) > 0:
                error_messages = [error["error_message"] for error in error_data["errors"]]
                error_message = "|".join(error_messages)
            else:
                error_message = "不明なエラーが発生しました。"
        except ValueError:
            error_message = "不正なレスポンス形式です。"
        
        raise ValueError(error_message)
        
def get_payment_data(data, user_email):
    """決済情報を取得する"""
    client_field_byte_limit = 100
    
    charge = data.get('charge')
    is_basic = data.get('basic')
    is_option1 = data.get('option1')
    is_option2 = data.get('option2')
    name = data.get("name")
    address = data.get("address")
    phone_number = data.get("phone_number")
    
    def get_amount():
        """金額を取得する"""
        return extract_numbers_and_convert_to_hankaku(charge)
    
    def get_client_field_1():
        """決済情報に付加する自由登録欄1"""
        hankaku_phone_number = extract_numbers_and_convert_to_hankaku(phone_number)
        return f"{name}, {hankaku_phone_number}, {user_email}"

    def get_client_field_2():
        """決済情報に付加する自由登録欄2"""
        address_bytes = address.encode("utf-8")
        
        # 100バイトを超えるときは、100バイト分の文字を最後から取得する
        if len(address_bytes) > client_field_byte_limit:
            
            last_bytes = address_bytes[-client_field_byte_limit:]
            result = last_bytes.decode('utf-8', 'ignore')
            while len(result.encode('utf-8')) > client_field_byte_limit:
                result = result[1:]
                
            return result
            
        return address
    
    def get_client_field_3():
        return f"{Service.BASIC_NAME}={is_basic}, {Service.OPTION1_NAME}={is_option1}, {Service.OPTION2_NAME}={is_option2}"
    
    return get_amount(), get_client_field_1(), get_client_field_2(), get_client_field_3()
    
def main(request):
    """カード決済情報を決済代行会社に登録する"""
    function_name = "card_regist"

    if request.method == "POST":
        try:
            # すでに支払済みの申込みと重複する申込みではないことを確認する
            if not request.user.is_authenticated:
                return JsonResponse(status=401)
            
            # フォーム検証
            user = request.user
            unpaid_data, paid_data, paid_option_and_amount = get_option_select_data(user)
            form = OptionSelectForm(request.POST, paid_option_and_amount=paid_option_and_amount, instance=unpaid_data)
            if not form.is_valid():
                error_list = [f"{field}|{', '.join(errors)}" for field, errors in form.errors.items()]
                return JsonResponse({"message": f"入力内容に不備があります。|{error_list}"}, status=400)
            
            # 決済情報を付加
            cleaned_data = form.cleaned_data
            amount, client_field_1, client_field_2, client_field_3 = get_payment_data(cleaned_data, user.email)

            res = exec_card_regist(amount, client_field_1, client_field_2, client_field_3)
            return JsonResponse({"data": res})
        
        except ValueError as e:
            basic_log(function_name, e, user if "user" in locals() else None, f"request.POST={request.POST}")
            return JsonResponse({"message": str(e)}, status=400)
        
        except Exception as e:
            error_message = f"user={user if 'user' in locals() else None}\n request.POST={request.POST}"
            send_mail(
                "カード登録処理でサーバーエラー",
                error_message,
                settings.DEFAULT_FROM_EMAIL,
                [settings.DEFAULT_FROM_EMAIL],
                True
            )
            
            notice = f"*****重大*****\n\n{error_message}"
            return handle_error(
                e, 
                request, 
                user if "user" in locals() else None, function_name, 
                None,
                True,
                {"status": "500"},
                notice
            )
    else:
        basic_log(function_name, None, user if "user" in locals() else None, "無効なリクエストがありました。")
        return JsonResponse({"message": "無効なリクエストです"}, status=400)
 
if __name__ == "__main__":
    main()