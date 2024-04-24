from allauth.account.models import EmailConfirmationHMAC, EmailConfirmation
from allauth.account.utils import send_email_confirmation
from allauth.account.views import SignupView, EmailVerificationSentView, ConfirmEmailView, PasswordResetView
from datetime import datetime, timedelta
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import send_mail, BadHeaderError, EmailMessage
from django.core.validators import validate_email
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password
from django.db import transaction
from django.http import JsonResponse, HttpResponse, HttpResponseForbidden
from django_ratelimit.decorators import ratelimit
from django.shortcuts import render, redirect, get_object_or_404
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from smtplib import SMTPException
import json
import requests
import socket
import textwrap
import secrets
from .forms import *
from .models import *
from accounts.models import User
from toukiApp.company_data import *
from toukiApp.toukiAi_commons import *

class CustomSignupView(SignupView):
    """新規登録ページ"""
    template_name = 'account/signup.html'
    
    @method_decorator(never_cache)
    def dispatch(self, *args, **kwargs):
        """キャッシュしないようにして仮登録メール送信ページから戻ってこれないようにする"""
        return super().dispatch(*args, **kwargs)
    
    def get_context_data(self, **kwargs):
        """会社メールアドレスをテンプレートに渡す"""
        context = super(CustomSignupView, self).get_context_data(**kwargs)
        context['company_address'] = CompanyData.MAIL_ADDRESS
        return context
    
    def get(self, request, *args, **kwargs):
        """条件確認ページからの遷移かチェック"""
        if not request.session.get('condition_passed', False):
            return redirect('toukiApp:condition')
        return super().get(request, *args, **kwargs)

class CustomEmailVerificationSentView(EmailVerificationSentView):
    """仮登録メール送信ページ"""
    def get(self, request, *args, **kwargs):
        """利用条件の通過セッションを削除する"""
        response = super().get(request, *args, **kwargs)
        if request.session.get('condition_passed'):
            del request.session['condition_passed'] 
        return response
    
    def post(self, request, *args, **kwargs):
        """POSTリクエストで特定のセッションデータを設定する"""
        request.session['condition_passed'] = True
        # POSTリクエスト後に適切なページにリダイレクト
        return redirect("accounts:signup")

class CustomConfirmEmailView(ConfirmEmailView):
    """本登録確認ページ"""
    @method_decorator(never_cache)
    def dispatch(self, *args, **kwargs):
        """キャッシュしないようにする（本登録直後のページから戻ってこれないようにするため）"""
        return super().dispatch(*args, **kwargs)
    
    def post(self, request, *args, **kwargs):
        """メール確認後の処理"""
        key = kwargs.get('key')
        email_confirmation = EmailConfirmationHMAC.from_key(key)
        if email_confirmation:
            self.send_registration_complete_email(email_confirmation.email_address.user)
            return super().post(request, *args, **kwargs)
        else:
            basic_log(get_current_function_name(), "CustomConfirmEmailView", email_confirmation.email_address.user.email, "アカウント登録完了後の処理でエラー")
            return super().post(request, *args, **kwargs)
    
    def send_registration_complete_email(self, user):
        """登録完了メールを送信する"""
        context = {
            "company_data": CompanyData,
            "user_email": user.email,
        }
        subject = render_to_string('account/email/registration_complete_subject.txt', context).strip()
        message = render_to_string('account/email/registration_complete_message.txt', context).strip()
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    
    def get(self, request, *args, **kwargs):
        """会員登録した直後のページからの遷移かチェック"""
        response = super().get(request, *args, **kwargs)
        if request.session.get('account_created', False):
            return redirect('toukiApp:index')
        return response
    
    def get_success_url(self):
        # メール確認が完了した後にユーザーをリダイレクトするURL
        return reverse_lazy('toukiApp:step_one_trial')
    
class CustomPasswordResetView(PasswordResetView):
    """"パスワードの再設定（ログイン前でするページ）"""
    def get_context_data(self, **kwargs):
        context = super(CustomPasswordResetView, self).get_context_data(**kwargs)
        context['company_email_address'] = CompanyData.MAIL_ADDRESS
        return context
    
def is_valid_email_pattern(request):
    """Djangoのメール形式に合致するか判定する"""
    input_email = request.POST.get("email")
   
    try:
        validate_email(input_email)
        context = {"message": ""}

    except ValidationError:
        context = {"message" : "有効なメールアドレスを入力してください",}
        
    return JsonResponse(context)

def delete_account(request):
    """アカウント削除"""
    function_name = get_current_function_name()
    current_url_name = "accounts:delete_account"
    current_html = "account/delete_account.html"
    next_url_name = "toukiApp:index"

    try:
        if not request.user.is_authenticated:
            messages.warning(request, "会員専用のページです アカウント登録が必要です")
            return redirect("accounts:signup")
        
        user = User.objects.get(email=request.user)
        if request.method == "POST":
            form = DeleteAccountForm(request.POST, instance=request.user)
            if form.is_valid():
                request.user.delete()
                messages.info()
                return redirect(next_url_name)
        else:            
            form = DeleteAccountForm()
        
        context = {
            "form": form,
        }
        
        return render(request, current_html, context)
        
    except Exception as e:
        return handle_error(
            e,
            request,
            user,
            function_name,
            current_url_name,
        )

def is_new_email(request):
    """djangoのメールアドレス検証と重複チェック"""
    function_name = get_current_function_name()
    email = request.POST.get("email")

    try:
        validate_email(email)
        is_duplicate = User.objects.filter(email=email).exists()
        if is_duplicate:
            return JsonResponse({
                "error_level": "warning",
                "message": "このメールアドレスはすでに登録されてます",
            })
    
        return JsonResponse({
            "error_level": "success",
            "message": "",
        })

    except (ValueError, ValidationError) as e:
        context = {
            "error_level": "warning",
            "message": "有効なメールアドレスを入力してください",
         }
        return JsonResponse(context)
    except Exception as e:
        return handle_error(
            e,
            request,
            None,
            function_name,
            None,
            True,
        )

#djangoのメール形式チェックと登録済みメールアドレスチェック
def is_user_email(request):
    function_name = get_current_function_name()
    input_email = request.POST.get("email")
    
    try:
        validate_email(input_email)
    except (ValueError, ValidationError) as e:
        context = {
            "error_level": "warning",
            "message": "有効なメールアドレスを入力してください",
         }
        return JsonResponse(context)
    except Exception as e:
        return handle_error(
            e,
            request,
            None,
            function_name,
            None,
            True,
        )
    
    try:
        user = User.objects.get(email = input_email)
        context = {"message": "",}
        return JsonResponse(context)
    except User.DoesNotExist:
        context = {"message" : "入力されたメールアドレスは登録されてません",}
        return JsonResponse(context)
    except Exception as e:
        return handle_error(
            e,
            request,
            None,
            function_name,
            None,
            True,
        )

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

@ratelimit(key='ip', rate='5/h', block=True)
def resend_confirmation(request):
    """メールアドレス認証リンクの再発行"""
    function_name = get_current_function_name()
    input_email = request.POST.get("email")
    
    try:
        validate_email(input_email)
    
        user = User.objects.get(email = input_email)
        send_email_confirmation(request, user)
        return JsonResponse({
            "error_level": "success",
            "message": "",
        })
    except ValidationError:
        return JsonResponse({
            "error_level": "warning",
            "message": "メールアドレスの規格と一致しません"
        })
    except User.DoesNotExist:
        return JsonResponse({
            "error_level": "warning",
            "message" : "入力されたメールアドレスは登録されてません"
        })
    except Exception as e:
        return handle_error(
            e,
            request,
            None,
            function_name,
            None,
            True,
        )

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
                        受信専用電話番号 {company_receiving_phone_number}
                        発信専用電話番号 {company_calling_phone_number}
                        ※弊社からの電話は発信専用番号が表示されます。
                        営業時間 {company_opening_hours}
                        ホームページ {company_url}
                    ''').format(
                        company_name=CompanyData.NAME,
                        company_post_number=CompanyData.POST_NUMBER,
                        company_address=CompanyData.ADDRESS,
                        company_receiving_phone_number=CompanyData.RECEIVING_PHONE_NUMBER,
                        company_calling_phone_number=CompanyData.CALLING_PHONE_NUMBER,
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
            
            return redirect("/account/change_email/")
            
    else:
        forms = ChangeEmailForm()
    
    context = {
        "title" : "メールアドレスを変更",
        "forms": forms,
        "email": email,
    }
    
    return render(request, "account/change_email.html", context)

#メールアドレス変更の認証リンクがクリックされたとき
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
            
            return redirect("/account/change_email/")
           
    except User.DoesNotExist:
        messages.error(request, "ユーザーが存在しません") 
    except Exception as e:
        messages.error(request, f'予期しないエラーが発生しました {e}')
    
    return redirect("/403/")

#403が発生したとき
def error_403(request):
    return render(request, "403.html", status=403)