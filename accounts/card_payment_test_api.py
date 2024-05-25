from django.conf import settings
from django.http import JsonResponse

from accounts.models import OptionRequest
from common.utils import *
from toukiApp.company_data import Service
from toukiApp.toukiAi_commons import *

import json
import requests

API_KEY = f'Bearer {settings.FINCODE_TEST_SECRET_KEY}'
BASE_URL = 'https://api.test.fincode.jp'
ENDPOINT = '/v1/payments'

def create_request(endpoint, data):
    """apiへのリクエストを生成"""
    url = BASE_URL + endpoint
    headers = {
        'Content-Type': 'application/json',
        'Authorization': API_KEY
    }
    return url, headers, data

def card_payment(amount, selected_services):
    """決済情報登録"""
    data = {
        'pay_type': 'Card',
        "job_code": "CAPTURE",
        "amount": amount,
        "client_field_1": selected_services
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

def main(request):
    """カード決済情報を決済代行会社に登録する"""
    function_name = "card_payment_test_api"
    
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            amount = extract_numbers_and_convert_to_hankaku(body.get('amount'))
            
            if amount == "0" or not amount:
                return JsonResponse({"message": "請求額が正しくありません。"}, status=400)
            
            is_basic = body.get('isBasic')
            is_option1 = body.get('isOption1')
            is_option2 = body.get('isOption2')
            selected_services = f"{Service.BASIC_NAME}={is_basic}, {Service.OPTION1_NAME}={is_option1}, {Service.OPTION2_NAME}={is_option2}"
                
            payment_response = card_payment(amount, selected_services)
            return JsonResponse({"data": payment_response})
        
        except ValueError as e:
            basic_log(function_name, e, request.user, f"request.body={request.body}")
            return JsonResponse({"message": str(e)}, status=400)
        
        except Exception as e:
            return handle_error(e, request, request.user, function_name, None, True, {"status": "500"}, f"request.body={request.body}")
    else:
        basic_log(function_name, None, request.user, "無効なリクエストがありました。")
        return JsonResponse({"message": "無効なリクエストです"}, status=400)
 
if __name__ == "__main__":
    main()