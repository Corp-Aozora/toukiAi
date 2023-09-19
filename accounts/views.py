from django.shortcuts import render, redirect
from .forms import *
from .models import *
from accounts.models import User
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
import json
from django.http import JsonResponse
import requests
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from allauth.account.utils import send_email_confirmation
from django.contrib.auth.hashers import check_password
from django.contrib import messages
import textwrap
from django.core.mail import BadHeaderError, EmailMessage
from django.http import HttpResponse
from django.db import transaction
from smtplib import SMTPException
import socket
from toukiApp.company_data import *
import secrets
from datetime import datetime, timedelta

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

#パスワードの同一チェック
def is_oldpassword(request):
    input = request.POST.get("oldpassword")
    user = request.user
    
    data = {
        'is_valid': check_password(input, user.password)
    }
    return JsonResponse(data)

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

# メールアドレス認証リンクの再発行
def change_email(request):
    user = request.user
    email = user.email

    if request.method == "POST":
        data = request.POST.copy()
        data["user"] = user.id
        data["token"] = secrets.token_hex()
        forms = ChangeEmailForm(data)
        if forms.is_valid():
            with transaction.atomic():
                try:
                    forms.save()
                    #他のトークンがあるとき削除する
                    if EmailChange.objects.filter(user = user).count() > 1:
                         # 今回の申請より前のトークンを取得
                        old_tokens = EmailChange.objects.filter(user=user).exclude(id=forms.instance.id)
                        # 古いトークンを削除
                        old_tokens.delete()
                        
                    subject = CompanyData.APP_NAME + "：メールアドレス変更認証リンク"
                    content = textwrap.dedent('''
                        このメールはシステムからの自動返信です。
                        送信専用のメールアドレスのため、こちらにメールいただいても対応できません。

                        ----------------------------------
                        以下のリンク先にある確定ボタンを押してメールアドレスの変更を確定させてください
                        http://127.0.0.1:8000/account/confirm/{token}
                        
                        -----------------------------------
                        {company_name}
                        {company_post_number}
                        {company_address}
                        TEL {company_phone_number}
                        営業時間 {company_opening_hours}
                        ホームページ {company_url}
                    ''').format(
                        company_name=CompanyData.NAME,
                        company_post_number=CompanyData.POST_NUMBER,
                        company_address=CompanyData.ADDRESS,
                        company_phone_number=CompanyData.PHONE_NUMBER,
                        company_opening_hours=CompanyData.OPENING_HOURS,
                        company_url=CompanyData.URL,
                        token=forms.instance.token,
                    )
                    to_list = [forms.cleaned_data["email"]]
                    bcc_list = ["toukiaidev@gmail.com"]
                    message = EmailMessage(subject=subject, body=content, from_email="toukiaidev@gmail.com", to=to_list, bcc=bcc_list)
                    message.send()
                    messages.success(request, "メールを送信しました")
                    
                except BadHeaderError:
                    return HttpResponse("無効なヘッダが検出されました。")
                except SMTPException as e:
                    messages.error(request, f'SMTPエラーが発生しました {e}')
                except socket.error as e:
                    messages.error(request, f'ネットワークエラーが発生しました {e}')
                except ValidationError as e:
                    messages.warning(request, "データの保存に失敗しました。入力内容を確認してください。")
                except Exception as e:
                    messages.error(request, f'予期しないエラーが発生しました {e}')
            
            return redirect("/account/change_email")
            
    else:
        forms = ChangeEmailForm()
    
    context = {
        "title" : "メールアドレスを変更",
        "forms": forms,
        "email": email,
    }
    
    return render(request, "account/change_email.html", context)

def confirm_email(request, token):
    try:
        data = EmailChange.objects.filter(token = token).first()
        
        #データがない又は申請から1日以上経過しているときは、リンク切れのページを表示する
        if not data or (timezone.now() - data.updated_at) > timedelta(days = 1):
            return redirect("403")
        
        with transaction.atomic():
            
            # ログイン処理をする
            user = User.objects.get(id=data.user.id)
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            
            # ユーザーのアドレスを変更する
            user.email = data.email
            user.save()
            
            # 申請データを削除する
            data.delete()
           
            messages.success(request,"メールアドレスの変更が完了しました")
            
            return redirect("/account/change_email")
           
    except User.DoesNotExist:
        messages.error(request, "ユーザーが存在しません") 
    except Exception as e:
        messages.error(request, f'予期しないエラーが発生しました {e}')
    
    return redirect("/403/")

def error_403(request):
    return render(request, "403.html", status=403)