from django.shortcuts import render, redirect
from .forms import *
from .models import *
from accounts.models import User
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
import datetime
import json
from django.http import JsonResponse
import requests
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from allauth.account.utils import send_email_confirmation

#重複メールアドレスチェック
def is_new_email(request):
    input_email = request.POST.get("email")
    is_duplicate = User.objects.filter(email = input_email).exists()
    
    if is_duplicate:
        context = {"message" : "このメールアドレスはすでに登録されてます",}
        return JsonResponse(context)
    
    try:
        validate_email(input_email)
        context = {"message": ""}

    except ValidationError:
        context = {"message" : "有効なメールアドレスを入力してください",}
        
    return JsonResponse(context)

#djangoのメール形式チェックと登録済みメールアドレスチェック
def is_user_email(request):
    input_email = request.POST.get("email")
    
    try:
        validate_email(input_email)
    except ValidationError:
        context = {"message" : "メールアドレスの規格と一致しません",}
        return JsonResponse(context)
    
    try:
        user = User.objects.get(email = input_email)
        context = {"message": "",}
        return JsonResponse(context)
    except User.DoesNotExist:
        context = {"message" : "入力されたメールアドレスは登録されてません",}
        return JsonResponse(context)

#不正な投稿があったとき
def csrf_failure(request, reason=""):

    # 何かしらの処理

    return HttpResponseForbidden('<h1>403 アクセスが制限されています。</h1>', content_type='text/html')

# メールアドレス認証リンクの再発行
def resend_confirmation(request):
    input_email = request.POST.get("email")
    
    try:
        validate_email(input_email)
    except ValidationError:
        context = {"message" : "メールアドレスの規格と一致しません",}
        return JsonResponse(context)
    
    try:
        user = User.objects.get(email = input_email)
        print(User.objects.filter(email = input_email).exists())
        send_email_confirmation(request, user)
        print(input_email)
        context = {"message": "",}
    except User.DoesNotExist:
        print("noExist")
        context = {"message" : "入力されたメールアドレスは登録されてません",}
        return JsonResponse(context)
    
    return JsonResponse(context)
