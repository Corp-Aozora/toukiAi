from allauth.account.models import EmailConfirmationHMAC, EmailConfirmation, EmailAddress
from allauth.account.utils import send_email_confirmation
from allauth.account.views import SignupView, LoginView, EmailVerificationSentView, ConfirmEmailView, PasswordResetView, PasswordChangeView
from datetime import datetime, timedelta
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.mail import send_mail, BadHeaderError, EmailMessage
from django.core.validators import validate_email
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.hashers import check_password
from django.contrib.sites.shortcuts import get_current_site
from django.db import transaction
from django.db.models import Max, Sum, Q, Func
from django.db.models.functions import Coalesce
from django.http import JsonResponse, HttpResponse, HttpResponseForbidden
from django_ratelimit.decorators import ratelimit
from django.shortcuts import render, redirect, get_object_or_404
from django.template.loader import render_to_string
from django.urls import reverse_lazy
from django.utils.decorators import method_decorator
from django.utils.safestring import mark_safe
from django.utils.timezone import make_aware
from django.views import View
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from smtplib import SMTPException

import json
import requests
import socket
import textwrap
import secrets

from .account_common import *
from .forms import *
from .models import *
from accounts.models import User
from common import *
from toukiApp.company_data import *
from toukiApp.models import Decedent
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
        context["canonical_url"] = get_canonical_url(self.request, "accounts:signup")
        return context
    
    def get(self, request, *args, **kwargs):
        """条件確認ページからの遷移かチェック"""
        if not request.session.get('condition_passed', False):
            return redirect('toukiApp:condition')
        return super().get(request, *args, **kwargs)

class CustomLoginView(LoginView):
    """カスタムログインページ"""
    template_name = 'account/login.html'

    def get_context_data(self, **kwargs):
        """正規 URL をテンプレートに渡す"""
        context = super(CustomLoginView, self).get_context_data(**kwargs)

        context['canonical_url'] = get_canonical_url(self.request, "account_login")
        return context

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
            EmailSender.send_email(
                email_confirmation.email_address.user,
                "account/email/registration_complete_subject.txt",
                "account/email/registration_complete_message.txt"
            )
            return super().post(request, *args, **kwargs)
        else:
            basic_log(get_current_function_name(), "CustomConfirmEmailView", email_confirmation.email_address.user.email, "アカウント登録完了後の処理でエラー")
            return super().post(request, *args, **kwargs)
    
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
        context["canonical_url"] = get_canonical_url(self.request, "accounts:account_reset_password")
        return context
    
class CustomPasswordChangeView(PasswordChangeView):
    """パスワードの変更（会員ページ内）"""
    success_url = reverse_lazy('accounts:account_change_password')  # パスワード変更後のリダイレクト先

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, '受付完了 パスワードの変更が完了しました')
        return response

    def form_invalid(self, form):
        messages.error(self.request, '受付に失敗 現在のパスワードに誤りがある、または新しいパスワードと再入力が一致しなかったことによりパスワードを変更できませんでした。')
        return super().form_invalid(form)

def save_option_select(user, form):
    """オプション選択のデータ登録"""
    function_name = get_current_function_name()
    try:
        instance = form.save(commit=False)
        instance.user = user
        instance.updated_by = user

        # 作成者は新規登録のときのみ
        if not instance.pk:
            instance.created_by = user
            
        instance.save()
    except Exception as e:
        basic_log(function_name, e, user)
        raise e

def get_option_select_data(user):
    """オプション選択データ"""
    unpaid_data = OptionRequest.objects.filter(user=user, is_recieved=False).first() # 未払い
    paid_data = OptionRequest.objects.filter(user=user, is_recieved=True) # 支払済み
    paid_option_and_amount = {
            'basic': False,
            'option1': False,
            'option2': False,
            'charge': 0,
        }

    if paid_data:
        paid_option_and_amount = {
            'basic': paid_data.aggregate(any_basic_true=BoolOr('basic'))['any_basic_true'],
            'option1': paid_data.aggregate(any_option1_true=BoolOr('option1'))['any_option1_true'],
            'option2': paid_data.aggregate(any_option2_true=BoolOr('option2'))['any_option2_true'],
            'charge': sum([zenkaku_currency_to_int(r.charge) for r in paid_data]),
        }
    
    return unpaid_data, paid_data, paid_option_and_amount

def option_select(request):
    """オプション選択"""
    function_name = get_current_function_name()
    current_url_name = "accounts:option_select"
    current_html = 'account/option_select.html'
    next_url_name = "accounts:bank_transfer"
    
    try:
        if not request.user.is_authenticated:
            messages.warning(request, "アクセス不可 会員専用のページです。ログインしてください。")
            return redirect("account_login")
        
        user = request.user
        unpaid_data, paid_data, paid_option_and_amount = get_option_select_data(user)
        
        if request.method == "POST":
            form = OptionSelectForm(request.POST, paid_option_and_amount=paid_option_and_amount, instance=unpaid_data)
            
            try:
                if form.is_valid():
                    
                    # 変更がないときは何もせずに銀行振込のページへ
                    if not form.has_changed():
                        return redirect(next_url_name)

                    with transaction.atomic():
                        save_option_select(user, form)
                        return redirect(next_url_name)
                else:
                    msg = mark_safe("受付に失敗 入力に不備がありました。<br>エラー内容をご確認ください。")
                    messages.warning(request, msg)
                    
            except Exception as e:
                basic_log(function_name, e, user, "POSTでエラー")
                raise e
        else:
            form = None
            latest_paid_data = paid_data.order_by('-updated_at').first()
            
            if unpaid_data:
                form = OptionSelectForm(instance=unpaid_data)
            elif latest_paid_data:
                form = OptionSelectForm(initial={
                    "name": latest_paid_data.name,
                    "payer": latest_paid_data.payer,
                    "address": latest_paid_data.address,
                    "phone_number": latest_paid_data.phone_number,
                })
            else:
                form = OptionSelectForm()

            if paid_option_and_amount["option2"]:
                messages.info(request, "利用不可 司法書士にご依頼いただいた場合、その他のオプションはご利用できなくなります。")
        
        context = {
            "title": "オプション選択",
            "company_data": CompanyData,
            "company_mail_address": CompanyData.MAIL_ADDRESS,
            "service": Service,
            "form": form,
            "field_names": list(form.fields.keys()), # エラーのラベル用
            "paid_option_and_amount": paid_option_and_amount,
            "paid": paid_option_and_amount["charge"],
            "fincode_public_key": settings.FINCODE_PUBLIC_KEY
        }

        return render(request, current_html, context)
    except Exception as e:
        return handle_error(
            e,
            request,
            user if "user" in locals() else None,
            function_name,
            current_url_name
        )
        
def bank_transfer(request):
    """銀行振込の場合"""
    function_name = get_current_function_name()
    current_url_name = "accounts:bank_transfer"
    current_html = 'account/bank_transfer.html'
    pre_url_name = "accounts:option_select"
    tab_title = "銀行振込の場合"
    
    try:
        
        if not request.user.is_authenticated:
            messages.warning(request, "アクセス不可 会員専用のページです。ログインしてください。")
            return redirect("account_login")
        
        user = request.user
        option_request_data = OptionRequest.objects.filter(user=user)
        
        # 司法書士に依頼して連絡を確認済みのとき
        if option_request_data.filter(is_recieved=True, option2=True).exists():
            return redirect(pre_url_name)

        not_paid_data = option_request_data.filter(is_recieved=False).first()
        # 未払の利用申込みがないとき、オプション選択ページにリダイレクトする
        if not not_paid_data:
            messages.warning(request, "アクセス不可 先にオプションを選択してください。")
            return redirect(pre_url_name)

        unique_payer = not_paid_data.payer + not_paid_data.phone_number[-4:]
        
        context = {
            "title": tab_title,
            "company_data": CompanyData,
            "service": Service,
            "user_email": user.email,
            "unique_payer": unique_payer,
            "not_paid_data": not_paid_data
        }

        return render(request, current_html, context)
    except Exception as e:
        return handle_error(
            e,
            request,
            user if "user" in locals() else None,
            function_name,
            current_url_name
        )

def after_card_pay(request):
    """
    
        カード決済後の処理
        
    """
    
    if request.method != "POST":
        return JsonResponse("不正なリクエストです。", status=400)
    
    user = request.user
    body = json.loads(request.body)
    
    try:
        payment_data = body.get("paymentData")
        order_id = payment_data.get("id")
        access_id =  payment_data.get("access_id")
        transaction_id = payment_data.get("transaction_id")
        
        datetime_format = "%Y/%m/%d %H:%M:%S.%f"
        process_date_naive = datetime.strptime(payment_data.get("process_date"), datetime_format)
        process_date = make_aware(process_date_naive)
        
        name = body.get("name")
        address = body.get("address")
        phone_number = body.get("phone_number")
        charge = body.get("charge")
        is_basic = True if body.get("basic") == "on" else False
        is_option1 = True if body.get("option1") == "on" else False
        is_option2 = True if body.get("option2") == "on" else False
        
        def update_option_request():
            """オプション利用申請を更新"""
            instance = OptionRequest.objects.filter(user=user, is_recieved=False).first()
            if instance is None:
                instance = OptionRequest(
                    user = user,
                    created_by = user,
                )

            instance.order_id = order_id
            instance.transaction_id = transaction_id
            instance.access_id = access_id
            instance.is_recieved = True
            instance.is_recieved_date = process_date
            instance.is_card = True
            instance.name = name
            instance.payer = ""
            instance.address = address
            instance.phone_number = phone_number
            instance.basic = is_basic
            instance.option1 = is_option1
            instance.option2 = is_option2
            instance.charge = charge
            instance.updated_by = user
        
            instance.save()
        
        def update_user():
            """ユーザー情報を更新"""
            user.username = name
            user.address = address
            user.phone_number = phone_number
            user.pay_amount = user.pay_amount + zenkaku_currency_to_int(charge)
            user.last_update = process_date
            
            if is_basic:
                user.basic = is_basic
                user.basic_date = process_date
            if is_option1:
                user.option1 = is_option1
                user.option1_date = process_date
            if is_option2:
                user.option2 = is_option2
                user.option2_date = process_date
            
            user.save()
        
        def update_decedent():
            """被相続人を更新"""
            instance = Decedent.objects.filter(user=user).first()
            if instance:
                instance.progress = 1
                instance.save()
        
        with transaction.atomic():
            # オプション利用情報を更新
            update_option_request()
            
            # ユーザー情報を更新
            update_user()
            
            # システム利用の申込みがあるとき
            if is_basic:
                # 被相続人を更新
                update_decedent()
                request.session["new_basic_user"] = True
                
                if is_option1:
                    request.session["new_option1_user"] = True
                    
                next_path = "/toukiApp/step_one"
                
            elif is_option1 or is_option2:
                
                if is_option1:
                    request.session["new_option1_user"] = True
                    
                if is_option2:
                    request.session["new_option2_user"] = True
                    
                next_path = "/account/option_select/guidance"
            else:
                return JsonResponse({"message": "オプションが選択されていません"})
                
        return JsonResponse({"message": "", "next_path": next_path})
    except Exception as e:
        send_mail(
            "カード決済後にエラー",
            f"user={user if 'user' in locals() else None}\n body={body if 'body' in locals() else None}\npaymentData={payment_data if 'paymentData' in locals() else None}",
            settings.DEFAULT_FROM_EMAIL,
            [settings.DEFAULT_FROM_EMAIL],
            True
        )
            
        notice = f"*****重大*****\nbody={body if 'body' in locals() else None}\npaymentData={payment_data if 'paymentData' in locals() else None}"
        return handle_error(
            e, 
            request, 
            user, 
            get_current_function_name(), 
            None, 
            True, 
            notices=notice
        )
        

@method_decorator(csrf_exempt, name='dispatch')
class FincodeWebhookView(View):

    def post(self, request, *args, **kwargs):
        """
        
            fincodeからのwebhookによる通知
            
        """
        function_name = "FincodeWebhookView > post"
        
        try:
            if settings.FINCODE_WEBHOOK_SIGNATURE != request.headers.get('Fincode-Signature'):
                return JsonResponse({'error': 'Invalid signature'}, status=400)
            
            # fincodeから届くデータ
            payload = json.loads(request.body)
            
            # 必要な情報を抽出
            event = payload.get("event") # 処理内容(決済登録, 決済実行など)(fincodeのwebhook設定による)
            order_id = payload.get('order_id') # オーダーID(fincodeでの注文管理番号)
            transaction_id = payload.get('transaction_id') # トランザクションID(fincodeでの取引管理番号)
            transaction_date = payload.get('transaction_date') # トランザクションID(fincodeでの取引管理番号)
            access_id = payload.get('access_id') # トランザクションID(fincodeでの取引管理番号)
            pay_type = payload.get("pay_type") # 決済方法
            error_code = payload.get("error_code") # エラーコード
            client_field_1 = payload.get("client_field_1") # 申込内容
            client_field_2 = payload.get("client_field_2") # 個人情報
            amount = payload.get('amount') # 決済金額
            currency = payload.get('currency') # 通貨

            subject = "決済登録" if event == "payments.card.regist" else \
                "決済実行" if event == "payments.card.exec" else \
                "売上確定" if event == "payments.card.capture" else \
                "キャンセル" if event == "payments.card.cancel" else \
                "不明なイベントパラメータ"
            # メール送信
            send_mail(
                subject=f"カード決済情報 種類:{subject}",
                message=f'オーダーID: {order_id}\nトランザクションID: {transaction_id}\n処理日時: {transaction_date}\n取引ID: {access_id}\n決済方法: {pay_type}\nエラーコード: {error_code}\n申込者: {client_field_2}\n申込内容: {client_field_1}\n決済金額: {amount}\n通貨: {currency}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.DEFAULT_FROM_EMAIL],
            )

            return JsonResponse({'receive': '0'}, status=200)
        
        except json.JSONDecodeError as e:
            # JSONデコードエラー
            basic_log(function_name, e, None, "jsonのデコードエラー")
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

        except BadHeaderError as e:
            # メール送信時のヘッダーエラー
            basic_log(function_name, e, None, "メールのヘッダーエラー")
            return JsonResponse({'error': 'Invalid header found'}, status=400)
        
        except Exception as e:
            basic_log(function_name, e, None, "fincodeからのwebhookによる通知の受取に失敗したため再試行")
            return JsonResponse({'receive': '1'}, status=200)

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
            messages.warning(request, "アクセス不可 会員専用のページです。アカウント登録が必要です。")
            return redirect("accounts:signup")
        
        user = request.user
        
        if request.method == "POST":
            form = DeleteAccountForm(user, request.POST,)
            if form.is_valid():
                request.user.delete()
                logout(request)
                request.session["account_delete"] = True
                return redirect(next_url_name)
            else:
                messages.error(request, "削除に失敗 入力されたメールアドレスまたはパスワードに誤りがあるため、アカウントを削除できませんでした。")
        else:            
            form = DeleteAccountForm(user)
        
        context = {
            "form": form,
        }
        
        return render(request, current_html, context)
    except Exception as e:
        return handle_error(
            e,
            request,
            user if "user" in locals() else None,
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

def change_email(request):
    """メールアドレスの変更"""
    function_name = get_current_function_name()
    current_url_name = "accounts:change_email"
    current_html = "account/change_email.html"
    
    try:
        if not request.user.is_authenticated:
            messages.warning(request, "アクセス不可 会員専用のページです。アカウント登録が必要です。")
            return redirect("accounts:signup")
        
        user = request.user

        if request.method == "POST":
            
            # トークンを持たせる
            data = request.POST.copy()
            data["user"] = user.id
            data["token"] = secrets.token_hex()
            form = ChangeEmailForm(user, data)
            
            if form.is_valid():
                
                with transaction.atomic():
                    try:
                        form.save()
                        # 他のトークンがあるとき削除する
                        if EmailChange.objects.filter(user = user).count() > 1:
                            # 今回の申請より前のトークンを取得
                            old_tokens = EmailChange.objects.filter(user=user).exclude(id=form.instance.id)
                            # 古いトークンを削除
                            old_tokens.delete()
                        
                        EmailSender.send_email(
                            user,
                            "account/email/change_email_subject.txt",
                            "account/email/change_email_message.txt",
                            {"token": data["token"]}
                        )
                        
                        messages.success(request, "受付完了 新しいメールアドレス宛に変更を完了させるためのURLをお送りしましたので、そのURLにアクセスをお願いします。")
                        
                    except Exception as e:
                        basic_log(function_name, e, user, "POSTでのエラー")
                        raise e
                
                return redirect(current_url_name)
            else:
                messages.warning(request, f"変更に失敗 入力に不備があるため変更できませんでした。")
        else:
            form = ChangeEmailForm(user)
        
        context = {
            "title" : "メールアドレスを変更",
            "form": form,
            "company_mail_address": CompanyData.MAIL_ADDRESS
        }
        
        return render(request, current_html, context)
    except Exception as e:
        return handle_error(
            e,
            request,
            user if "user" in locals() else None,
            function_name,
            current_url_name
        )

def confirm_email(request, token):
    """メールアドレス変更の認証リンクがクリックされたとき"""
    
    function_name = get_current_function_name()
    login_url_name = "account_login"
    signup_url_name = "accounts:signup"
    change_email_url_name = "accounts:change_email"
    
    try:
        email_change_data = EmailChange.objects.filter(token = token).first()
        
        #データがない又は申請から1日以上経過しているときは、リンク切れのページを表示する
        if not email_change_data or (timezone.now() - email_change_data.updated_at) > timedelta(days = 1):
            messages.warning(request, "アクセス不可 メールアドレス変更のリンクが無効になっています。")
            return redirect(login_url_name)
        
        with transaction.atomic():
            
            # ログイン処理をする
            user = User.objects.get(id=email_change_data.user.id)
            user.backend = 'django.contrib.auth.backends.ModelBackend'
            login(request, user)
            
            # Userのアドレスを変更する
            new_email = email_change_data.email
            user.email = new_email
            user.save()
            
            # EmailChangeから削除する
            email_change_data.delete()
            
            # allauthのメールアドレス管理テーブルからユーザーデータを削除して新規登録する
            EmailAddress.objects.filter(user=user).delete()
            new_email_address = EmailAddress.objects.create(
                user=user,
                email=new_email,
                primary=True,
                verified=True
            )
            new_email_address.save()
            
            messages.success(request,"受付完了 メールアドレスの変更が完了しました")
            return redirect(change_email_url_name)
           
    except User.DoesNotExist:
        messages.error(request, "受付に失敗 ユーザーが存在しません")
        basic_log(function_name, e, None, "メールアドレス変更処理でUser.DoesNotExistのエラー発生")
        return redirect(signup_url_name)
    except Exception as e:
        return handle_error(
            e,
            request,
            user if "user" in locals() else None,
            function_name,
            login_url_name
        )    

def error_403(request, exception):
    """カスタム403エラーページ"""
    function_name = get_current_function_name()
    
    basic_log(function_name, None, request.user, f"request.path={request.path}\nexception={str(exception)}")
    
    context = {
        "company_data": CompanyData,
        "reason": str(exception),
    }
    
    return render(request, "403.html", context, status=403)

def error_404(request, exception=None):
    """カスタム404エラーページ"""
    function_name = get_current_function_name()
    
    basic_log(function_name, None, request.user, f"存在しないパスにアクセスがありました\nrequest.path={request.path}")
    
    context = {
        "company_data": CompanyData
    }
    
    return render(request, "404.html", context, status=404)

def error_500(request):
    """カスタム500エラーページ"""
    function_name = get_current_function_name()
    
    basic_log(function_name, None, request.user, f"request.path={request.path}")
    
    context = {
        "company_data": CompanyData,
        "traceback": traceback.format_exc()
    }
    
    return render(request, "500.html", context, status=500)

def csrf_failure(request, reason=""):
    """CSRF専用の403エラーページ"""
    function_name = get_current_function_name()
    
    basic_log(function_name, None, request.user, f"request.path={request.path}\nexception={str(reason)}")

    context = {
        "company_data": CompanyData,
        "reason": str(reason),
    }

    return render(request, "403.html", context, status=403)