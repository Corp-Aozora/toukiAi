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
from allauth.account.views import SignupView as AllAuthSignupView

#重複メールアドレスチェック
def email_check(request):
    input_email = request.POST.get("email")
    is_duplicate = User.objects.filter(email = input_email).exists()
    
    if is_duplicate:
        context = {
            "message" : "このメールアドレスはすでに登録されてます",
        }
        return JsonResponse(context)
    
    try:
        validate_email(input_email)
        context = { "message": "" }

    except ValidationError:
        context = {
            "message" : "有効なメールアドレスを入力してください"
        }
        
    return JsonResponse(context)

#不正な投稿があったとき
def csrf_failure(request, reason=""):

    # 何かしらの処理

    return HttpResponseForbidden('<h1>403 アクセスが制限されています。</h1>', content_type='text/html')