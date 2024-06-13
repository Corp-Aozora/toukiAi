from allauth.account.models import EmailConfirmationHMAC, EmailConfirmation, EmailAddress
from allauth.account.utils import send_email_confirmation
from allauth.account.views import SignupView, LoginView, EmailVerificationSentView, ConfirmEmailView, PasswordResetView, PasswordChangeView
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
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
from django.utils import timezone
from django.views import View
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from smtplib import SMTPException

import json
import requests
import socket
import textwrap
import secrets
import random

from .account_common import *
from .forms import *
from .models import *
from common.utils import *
from common.const.common import *
from common.const import session_key
from toukiApp.company_data import *
from toukiApp.models import Decedent
from toukiApp.toukiAi_commons import *
from toukiApp.views import nav_to_last_user_page

class CustomSignupView(SignupView):
    """
    
        新規登録ページ
        
    """
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
    
    # def get(self, request, *args, **kwargs):          事前の利用条件確認は一旦停止中
    #     """条件確認ページからの遷移かチェック"""
    #     if not request.session.get('condition_passed', False):
    #         return redirect('toukiApp:condition')
    #     return super().get(request, *args, **kwargs)

class CustomLoginView(LoginView):
    """
    
        カスタムログインページ
        
        会員登録時に一時コードによるメールアドレス認証をしているためログイン時に認証テーブルは参照していない
        
    """
    template_name = 'account/login.html'
    
    def form_valid(self, form):
        """ユーザーがメールアドレスとパスワードでログインする際の処理"""
        email = form.cleaned_data.get('login')
        password = form.cleaned_data.get('password')
        remember_me = form.cleaned_data.get('remember')
        user = authenticate(self.request, username=email, password=password)
        
        if user is not None:
            login(self.request, user)
            
            if remember_me:
                self.request.session.set_expiry(30 * 24 * 60 * 60)
                
            return redirect('toukiApp:nav_to_last_user_page')
        
        return self.form_invalid(form)
    
    def form_invalid(self, form):
        """アカウント不存在時のカスタムメッセージ"""
        if '__all__' not in form.errors:
            form.errors['__all__'] = form.error_class(["入力されたメールアドレスとパスワードに一致するアカウントは見つかりませんでした。"])
            
        return super().form_invalid(form)
    
    def get_context_data(self, **kwargs):
        """正規 URL をテンプレートに渡す"""
        context = super(CustomLoginView, self).get_context_data(**kwargs)

        context['canonical_url'] = get_canonical_url(self.request, "account_login")
        return context
    
class CustomEmailVerificationSentView(EmailVerificationSentView):
    """
    
        仮登録メール送信ページ
        
    """
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
    """
    
        本登録確認ページ
        
    """
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
    """"
    
        パスワードの再設定（ログイン前でするページ）
        
    """
    def get_context_data(self, **kwargs):
        context = super(CustomPasswordResetView, self).get_context_data(**kwargs)
        
        context['company_email_address'] = CompanyData.MAIL_ADDRESS
        context["canonical_url"] = get_canonical_url(self.request, "accounts:account_reset_password")
        return context
    
class CustomPasswordChangeView(PasswordChangeView):
    """
    
        パスワードの変更（会員ページ内）
        
    """
    success_url = reverse_lazy('accounts:account_change_password')  # パスワード変更後のリダイレクト先

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, '受付完了 パスワードが変更されました。')
        return response

    def form_invalid(self, form):
        messages.error(self.request, '受付に失敗 現在のパスワードに誤りがある、または新しいパスワードと再入力が一致しませんでした。')
        return super().form_invalid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = get_object_or_404(User, email=self.request.user.email)
        decedent = Decedent.objects.filter(user=user).first()
        progress = decedent.progress if decedent else 1
            
        context.update({
            "progress": progress,
            "service_content" : Sections.SERVICE_CONTENT
        })
        
        return context

def save_option_select(user, form):
    """オプション選択のデータ登録"""
    function_name = get_current_function_name()
    
    try:
        instance = form.save(commit=False)
        instance.user = user
        instance.updated_by = user

        if not instance.pk:
            instance.created_by = user
            
        instance.save()
    except Exception as e:
        basic_log(function_name, e, user)
        raise e

def get_option_select_data(user):
    """オプション選択データを取得する"""
    unpaid_data = OptionRequest.objects.filter(user=user, recieved_date__isnull=True).first() # 未払い
    paid_data = OptionRequest.objects.filter(user=user, recieved_date__isnull=False) # 支払済み
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

def get_forms_for_option_select(post_data, user, paid_option_and_amount, unpaid_data):
    """オプション選択ページのフォーム"""
    if post_data:
        option_select_form = OptionSelectForm(post_data, paid_option_and_amount=paid_option_and_amount, instance=unpaid_data)
    else:
        option_select_form = OptionSelectForm(instance=unpaid_data)
        
    user_form = None if user else RegistUserForm(post_data)
    email_verification_form = None if user else EmailVerificationForm(post_data)
    forms = [option_select_form] if user else [option_select_form, user_form, email_verification_form]
    
    return forms, option_select_form, user_form, email_verification_form

def get_target_email_verification_data(request, user_form, form = None, token = None):
    """既存の特定のメールアドレス認証データを取得する"""
    session_id = request.session.session_key
    email = user_form.cleaned_data.get("email")
    token = form.cleaned_data.get("token") if form else token
    within_24_hours = timezone.now() - timedelta(hours=24)
    instance = EmailVerification.objects.filter(
        user=None,
        session_id=session_id,
        email=email,
        token=token,
        created_at__gte=within_24_hours
        ).first()

    return instance

def option_select(request):
    """
    
        オプション選択ページの処理
    
    """
    function_name = get_current_function_name()
    current_url_name = "accounts:option_select"
    html = 'account/option_select.html'
    next_url_name = "accounts:bank_transfer"

    def save_email_verification(instance, user):
        """メールアドレス認証データの更新"""
        instance.user = user
        instance.is_verified = True
        instance.save()
    
    def handle_post_process(user, paid_option_and_amount, unpaid_data):
        """POSTのときの処理"""      
        
        def validate_forms(forms):
            """フォーム検証"""
            if all(form.is_valid() for form in forms):
                return True
            
            msg = mark_safe("受付に失敗 入力に不備がありました。<br>エラー内容をご確認ください。")
            messages.warning(request, msg)
            return False
        
        def is_email_verification_instance(user_form, email_verification_form):
            """メールアドレス認証データ存在確認"""
            if user:
                return True, None
            
            email_verification_instance = get_target_email_verification_data(request, user_form, email_verification_form)
            
            if email_verification_instance:
                return True, email_verification_instance
            
            msg = mark_safe("受付に失敗 入力された一時コードに誤りがあります。")
            email_verification_form.add_error('token', "入力された一時コードに誤りがあります。")
            messages.warning(request, msg)
            
            return False, None
        
        # メイン処理
        try:
            forms, option_select_form, user_form, email_verification_form = get_forms_for_option_select(request.POST, user, paid_option_and_amount, unpaid_data)
            if not validate_forms(forms):
                return option_select_form, user_form, email_verification_form
                
            result, email_verification_instance = is_email_verification_instance(user_form, email_verification_form)
            if not result:
                return option_select_form, user_form, email_verification_form
                
            # 変更がないときは何もせずに銀行振込のページへ
            if not option_select_form.has_changed():
                return True, True, True

            with transaction.atomic():
                # 非会員のとき
                if not user:
                    # 会員登録
                    user = user_form.save()
                    # メールアドレス認証登録
                    save_email_verification(email_verification_instance, user)
                    # ログイン状態にする
                    login(request, user, 'django.contrib.auth.backends.ModelBackend')
                    
                save_option_select(user, option_select_form)
                
                return True, True, True
        except Exception as e:
            message = f"user={user}, paid_option_and_amount={paid_option_and_amount}, unpaid_data={unpaid_data}"
            basic_log(get_current_function_name(), e, user, message)
            raise e    
        
    """
        メイン処理
    """
    try:
        user = request.user if request.user.is_authenticated else None
        unpaid_data, paid_data, paid_option_and_amount = get_option_select_data(user)

        # 銀行振込のときの処理(カード決済のときはafter_card_pay)
        if request.method == "POST":
            option_select_form, user_form, email_verification_form = handle_post_process(user, paid_option_and_amount, unpaid_data)
            if option_select_form == True and user_form == True and email_verification_form == True:
                return redirect(next_url_name)
        else:
            forms, option_select_form, user_form, email_verification_form = get_forms_for_option_select(None, user, paid_option_and_amount, unpaid_data)

            if paid_option_and_amount["option2"]:
                messages.info(request, "利用不可 司法書士にご依頼いただいた場合、その他のオプションはご利用できなくなります。")
        
        user_email = user.email if user else None
        company_mail_address = CompanyData.MAIL_ADDRESS
        option_select_form_field_names = list(option_select_form.fields.keys())
        user_form_field_names = list(user_form.fields.keys()) if user_form else None
        email_verification_form_field_names = list(email_verification_form.fields.keys()) if email_verification_form else None
        paid = paid_option_and_amount["charge"]
        fincode_public_key = settings.FINCODE_PUBLIC_KEY
        context = {
            "title": "オプション選択",
            "user_email": user_email,
            "company_data": CompanyData,
            "company_mail_address": company_mail_address,
            "service": Service,
            "option_select_form": option_select_form,
            "option_select_form_field_names": option_select_form_field_names,
            "user_form": user_form,
            "user_form_field_names": user_form_field_names,
            "email_verification_form": email_verification_form,
            "email_verification_form_field_names": email_verification_form_field_names,
            "paid_option_and_amount": paid_option_and_amount,
            "paid": paid,
            "fincode_public_key": fincode_public_key
        }

        return render(request, html, context)
    except Exception as e:
        return handle_error(
            e,
            request,
            request.user,
            function_name,
            current_url_name
        )
        
def bank_transfer(request):
    """
    
        銀行振込によるオプション利用の申込みがあったときのページ
        
    """
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
        if option_request_data.filter(recieved_date__isnull=False, option2=True).exists():
            return redirect(pre_url_name)

        not_paid_data = option_request_data.filter(recieved_date__isnull=True).first()
        # 未払の利用申込みがないとき、オプション選択ページにリダイレクトする
        if not not_paid_data:
            messages.warning(request, "アクセス不可 先にオプションを選択してください。")
            return redirect(pre_url_name)

        user_email = user.email
        unique_payer = not_paid_data.payer + user.phone_number[-4:]
        context = {
            "title": tab_title,
            "company_data": CompanyData,
            "service": Service,
            "user_email": user_email,
            "unique_payer": unique_payer,
            "not_paid_data": not_paid_data
        }

        return render(request, current_html, context)
    except Exception as e:
        return handle_error(
            e,
            request,
            request.user,
            function_name,
            current_url_name
        )

def after_card_pay(request):
    """
    
        カード決済後の処理
        
    """
    
    if request.method != "POST":
        return JsonResponse("不正なリクエストです。", status=400)
    
    function_name = get_current_function_name()
    request_user = request.user
    user = request_user if request_user.is_authenticated else None
    body = json.loads(request.body)
    
    try:
        payment_data = body.get("paymentData") # fincodeからのresponse
        order_id = payment_data.get("id") # オーダーid
        access_id =  payment_data.get("access_id") # 取引id
        transaction_id = payment_data.get("transaction_id") # トランザクションID
        amount = payment_data.get("amount") # 金額<int>
        username = body.get("username")
        address = body.get("address")
        phone_number = body.get("phone_number")
        email = body.get("email")
        password = body.get("password1")
        charge = body.get("charge")
        
        datetime_format = "%Y/%m/%d %H:%M:%S.%f"
        original_process_date = payment_data.get("process_date")
        process_date = string_to_datetime(datetime_format, original_process_date) # 処理日時
        
        is_basic = checkbox_value_to_boolean(body.get("basic"))
        is_option1 = checkbox_value_to_boolean(body.get("option1"))
        is_option2 = checkbox_value_to_boolean(body.get("option2"))
        
        def update_option_request(user_instance):
            """オプション利用申請を更新"""
            instance = OptionRequest.objects.filter(user=user_instance, recieved_date__isnull=True).first()
            if instance is None:
                instance = OptionRequest(
                    user = user_instance,
                    created_by = user_instance,
                )

            instance.order_id = order_id
            instance.transaction_id = transaction_id
            instance.access_id = access_id
            instance.recieved_date = process_date
            instance.is_card = True
            instance.payer = ""
            instance.basic = is_basic
            instance.option1 = is_option1
            instance.option2 = is_option2
            instance.charge = charge
            instance.updated_by = user_instance
        
            instance.save()
            
            return instance.id
        
        def update_or_regist_user(user_instance):
            """会員情報を更新または新規登録"""
            if not user_instance:
                user_instance = User(
                    username = username,
                    address = address,
                    phone_number = phone_number,
                    email = email
                )
                user_instance.set_password(password)
                
            user_instance.pay_amount = user_instance.pay_amount + zenkaku_currency_to_int(charge)
                
            if is_basic:
                user_instance.basic_date = process_date
            if is_option1:
                user_instance.option1_date = process_date
            if is_option2:
                user_instance.option2_date = process_date
            
            user_instance.save()
            
            return user_instance
                
        def update_email_verification(new_user):
            """メールアドレス認証データを更新する"""
            instance = EmailVerification.objects.filter(session_id=request.session.session_key, email=new_user.email, token=body.get("token")).first()
            instance.user = new_user
            instance.is_verified = True
            instance.save()
        
        def validate_option_combination():
            """オプション選択のバリデーション"""
            if not any([is_basic, is_option1, is_option2]):
                return "オプションが選択されていません"
            
            if is_option2 and (is_basic or is_option1):
                return "オプションの選択の組み合わせが不適切です"
            
            return ""
        
        def create_receipt(username, option_request_id):
            """領収書をpdfにして返す"""
            company_email = settings.DEFAULT_FROM_EMAIL # 会社のメール
            received_date = original_process_date.split(' ')[0] # 受領日 年/月/日
            receipt_no = f"{received_date}/{option_request_id}" # 領収書番号 年/月/日/option_requestのid
            pay_amount = mojimoji.zen_to_han(charge) # 半角数字のコンマ付き
            
            # option2の金額の計算(他のオプションの利用状況によって変動することがあるため)
            option2_price_tax = int(amount / 1.1 * 0.1) if is_option2 else ""
            option2_price_exclude_tax = amount - (option2_price_tax) if is_option2 else ""
            option2_price_tax_str = f"{option2_price_tax:,}" if option2_price_tax else ""
            option2_price_exclude_tax_str = f"{option2_price_exclude_tax:,}" if option2_price_exclude_tax else ""

            context = {
                "company_data": CompanyData,
                "company_email": company_email,
                "service": Service,
                "received_date": received_date,
                "username": username,
                "receipt_no": receipt_no,
                "pay_amount": pay_amount,
                "is_basic": is_basic,
                "is_option1": is_option1,
                "is_option2": is_option2,
                "option2_price_exclude_tax": option2_price_exclude_tax_str,
                "option2_price_tax": option2_price_tax_str
            }
            html_content = render_to_string("account/receipt.html", context)
            
            pdf_url = ConvertHtmlToPdf.get_url_by_in_sync(html_content)
            pdf = download_file(pdf_url)
            if pdf["message"]:
                raise Exception(pdf["message"])
            
            return pdf["data"]
        
        def send_confirm_mail(user_instance, option_request_id):
            """ユーザーに完了メールを送る"""
            if is_basic:
                content = textwrap.dedent('''\
                    システムをご利用いただけるように設定いたしました。
                    
                    以下のurlからログインしてご利用ください。
                    {company_url}/account/login/
                    ''')
                content = content.format(company_url=CompanyData.URL)
                
                if is_option1:
                    content += textwrap.dedent('''
                        書類取得代行につきましては、本メールが届いた日を含めて平日3日以内に
                        下記のご住所に書類の取得を代行するための書類を発送します。
                        
                            {user_address}
                        ※誤りがある場合は、ご登録いただいたメールアドレスと訂正後のご住所をお知らせください。
                        
                        届きましたら同封の案内状に従って書類に署名押印などをお願いします。
                        ''').rstrip()
                    content = content.format(user_address=user_instance.address)
                    
            elif is_option1:
                content = textwrap.dedent('''\
                    本メールが届いた日を含めて平日3日以内に下記のご住所に必要書類の取得を代行するための書類を発送します。
                    
                        {user_address}
                        ※誤りがある場合は、ご登録いただいたメールアドレスと訂正後のご住所をお知らせください。
                    
                    届きましたら同封の案内状に従って書類に署名押印などをお願いします。
                    ''').rstrip()
                content = content.format(user_address=user_instance.address)
                
            else:
                content = textwrap.dedent('''\
                    本メールが届いた日を含めて平日3日以内に担当する司法書士の連絡先をメールいたします。
                    
                    そちらのメールが届きましたら数日以内に担当の司法書士からお客様にお電話またはメールにて
                    ご連絡がありますので、ご対応をお願いします。
                    
                    実費は別途登記申請前に司法書士からご請求がありますので、司法書士へ直接お支払いください。
                    ''').rstrip()
            
                        
            receipt = create_receipt(user_instance.username, option_request_id)
            attachments = [("領収書.pdf", receipt, 'application/pdf')]
            
            send_email_to_user(user_instance, "お申し込み誠にありがとうございます。", content, attachments)
        
        def sort_by_option_and_get_next_path():
            """選択されたオプション別に整理して次のパスを返す"""
            if is_option1:
                request.session[session_key.NewUser.OPTION1] = True
                
            if is_option2:
                request.session[session_key.NewUser.OPTION2] = True
            
            next_path = ""
            if is_basic:
                request.session[session_key.NewUser.BASIC] = True
                next_path = "/toukiApp/step_one"
            else:
                next_path = "/account/option_select/guidance"
                            
            return next_path
        
        # メイン処理
        error_message = validate_option_combination()
        if error_message:
            return JsonResponse({"message": error_message})
        
        with transaction.atomic():
            if not user:
                # ユーザー情報を更新
                user = update_or_regist_user(user)

                # メールアドレス認証
                update_email_verification(user)
            else:
                user = update_or_regist_user(user)
                
            # オプション利用情報を更新
            option_request_id = update_option_request(user)

            # 次のパスを取得する
            next_path = sort_by_option_and_get_next_path()
            
            # ログインした状態にする
            login(request, user, 'django.contrib.auth.backends.ModelBackend')
            
            # 完了メールを送る
            send_confirm_mail(user, option_request_id)
            
        return JsonResponse({"message": "", "next_path": next_path})
    
    except Exception as e:
        subject = "カード決済後にエラー"
        error_message = f"e={e}\n\nuser={request_user}\n\nbody={body if 'body' in locals() else None}\n\npaymentData={payment_data if 'paymentData' in locals() else None}"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [settings.DEFAULT_FROM_EMAIL]
        send_mail(subject, error_message, from_email, recipient_list, True)
            
        notice = f"*****重大*****\n\n{error_message}"
        return handle_error(e, request, request_user, function_name, None, True, notices=notice)

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
            client_field_1 = payload.get("client_field_1") # 氏名、電話番号、メールアドレス
            client_field_2 = payload.get("client_field_2") # 住所
            client_field_3 = payload.get("client_field_3") # 申込内容
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
                message=f'オーダーID: {order_id}\nトランザクションID: {transaction_id}\n処理日時: {transaction_date}\n取引ID: {access_id}\n決済方法: {pay_type}\nエラーコード: {error_code}\n申込者情報1: {client_field_1}\n申込者情報2: {client_field_2}\n申込内容: {client_field_3}\n決済金額: {amount}\n通貨: {currency}',
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

def guidance(request):
    """
    
        カード決済後の戸籍取得代行または司法書士紹介の流れについてのページを表示する
        
    """
    def get_tab_title(is_option1, is_option2):
        """タブのタイトルを取得する"""
        if is_option1:
            return f"{Service.OPTION1_NAME}の流れについて"
        elif is_option2:
            return f"{Service.OPTION2_NAME}の流れについて"
        else:
            messages.warning(request, "アクセス制限 オプションを選択してください")
            return ""

    function_name = get_current_function_name()
    html = 'account/guidance.html'
    option_select_url = "accounts:option_select"
    request_user = request.user

    if not is_valid_request_method(request, "GET", True):
        return redirect("toukiApp:index")
    
    try:
        if is_anonymous(request):
            return redirect("accounts:account_login")
        
        user = request_user
        is_option1 = get_boolean_session(request.session, session_key.NewUser.OPTION1)
        is_option2 = get_boolean_session(request.session, session_key.NewUser.OPTION2)
        
        tab_title = get_tab_title(is_option1, is_option2)
        if tab_title == "":
            return redirect(option_select_url)
        
        context = {
            "title": tab_title,
            "company_data": CompanyData,
            "service": Service,
            "user_email": user.email,
            "user_address": user.address,
            "is_option1": is_option1,
            "is_option2": is_option2
        }

        return render(request, html, context)
    except Exception as e:
        return handle_error(
            e,
            request,
            request_user,
            function_name,
            option_select_url,
            notices=request,
        )
        
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
    """
    
        アカウント削除
        
    """
    if not is_valid_request_method(request, ["GET", "POST"], True):
        return redirect("toukiApp:index")
    
    function_name = get_current_function_name()
    this_url_name = "accounts:delete_account"
    html = "account/delete_account.html"
    next_url_name = "toukiApp:index"
    title = "アカウント削除"
    request_user = request.user 
    
    try:
        if is_anonymous(request):
            return redirect("accounts:account_login")
        
        user = request_user
        form = DeleteAccountForm(user, request.POST or None)
        
        if request.method == "POST":
            if form.is_valid():
                with transaction.atomic():
                    try:
                        request_user.delete()
                        logout(request)
                        request.session["account_delete"] = True
                    
                        return redirect(next_url_name)
                    
                    except Exception as e:
                        cleaned_data_str = ", ".join(f"{field_name}={value}" for field_name, value in form.cleaned_data.items())
                        raise Exception(f"POSTでエラー\n{cleaned_data_str}") from e
            else:
                messages.warning(request, "削除に失敗 入力されたメールアドレスまたはパスワードに誤りがあるため、アカウントを削除できませんでした。")
        
        progress = get_decedent_progress(user)
        service_content = Sections.SERVICE_CONTENT
        context = {
            "title": title,
            "form": form,
            "progress": progress,
            "service_content": service_content
        }
        
        return render(request, html, context)
    
    except Exception as e:
        return handle_error(
            e,
            request,
            request_user,
            function_name,
            this_url_name,
            notices = f"request.POST={request.POST}"
        )

def is_new_email(request):
    """
    
        djangoのメールアドレス検証と重複チェック
        
    """
    function_name = get_current_function_name()
    email = request.POST.get("email")

    try:
        validate_email(email)
        is_duplicate = User.objects.filter(email=email).exists()
        if is_duplicate:
            return JsonResponse({"message": "このメールアドレスはすでに登録されてます"}, status=409)
    
        return JsonResponse({"message": ""}, status=200)

    except (ValueError, ValidationError) as e:
        return JsonResponse({"message": "有効なメールアドレスを入力してください"}, status=400)
    except Exception as e:
        return handle_error(
            e,
            request,
            request.user,
            function_name,
            None,
            True,
        )

def send_verification_mail(request):
    """
    
        メールアドレス認証コードを送信する
        
    """
    function_name = get_current_function_name()
    
    body = json.loads(request.body)
    email = body.get("email")

    def generate_unique_token(session_id):
        """一意のトークンを生成する"""
        while True:
            token = random.randint(1000, 9999)
            within_24_hours = timezone.now() - timedelta(hours=24)
            if not EmailVerification.objects.filter(
                user=None,
                session_id=session_id,
                email=email,
                token=token,
                created_at__gte=within_24_hours
                ).exists():
                
                return token

    def create_email_verification():
        """EmailVerificationに登録"""
        session_id = get_or_create_session_id(request)
        token = generate_unique_token(session_id)
        instance = EmailVerification.objects.create(
            session_id=session_id,
            email=email,
            token=token,
        )
        return instance
    
    def send_verification_mail(instance):
        """一時コードをメールする"""
        user = {"email": email, "username": email}
        subject = "一時コードを発行しました"
        content = textwrap.dedent(f'''\
            以下の番号をオプション選択ページの「一時コード」にご入力ください。
            
                {instance.token}
                ※有効期限1日
            ''').rstrip()
        send_email_to_user(user, subject, content)

    try:
        if request.user.is_authenticated:
            return JsonResponse({"message": "不正なリクエストです"}, status=400)
        
        with transaction.atomic():
            instance = create_email_verification()
            
            send_verification_mail(instance)
            
            return JsonResponse({"message": ""}, status=200)
    except Exception as e:
        return handle_error(
            e,
            request,
            request.user,
            function_name,
            None,
            True,
        )

def is_user_email(request):
    """
    
        djangoによるメール形式チェック
    
    """
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
            request.user,
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
            request.user,
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
    """
    
        メールアドレス認証リンクの再発行
        
    """
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
            request.user,
            function_name,
            None,
            True,
        )

def change_email(request):
    """
    
        メールアドレスの変更のページ
        
    """
    if not is_valid_request_method(request, ["GET", "POST"], True):
        return redirect("toukiApp:index")
    
    function_name = get_current_function_name()
    this_url_name = "accounts:change_email"
    html = "account/change_email.html"
    title = "メールアドレス変更"
    request_user = request.user
    
    def get_form(request):
        """フォームを取得する"""
        if request.method == "POST":
            data = request.POST.copy()
            data["user"] = user.id
            data["token"] = secrets.token_hex()
            return ChangeEmailForm(user, data), data["token"]
        
        return ChangeEmailForm(user), None
    
    def delete_old_tokens(user, form):
        """他のトークンがあるとき削除する"""
        if EmailChange.objects.filter(user = user).count() > 1:
            old_data = EmailChange.objects.filter(user=user).exclude(id=form.instance.id)
            old_data.delete()
    
    try:
        if is_anonymous(request):
            return redirect("accounts:account_login")
        
        user = request_user
        form, token = get_form(request)
        
        if request.method == "POST":
            if form.is_valid():
                with transaction.atomic():
                    try:
                        form.save()
                        
                        delete_old_tokens(user, form)
                        
                        EmailSender.send_email(
                            user,
                            "account/email/change_email_subject.txt",
                            "account/email/change_email_message.txt",
                            {"token": token }
                        )
                        
                        messages.success(request, "メールを送りました 新しいメールアドレスに届いたメールに記載されたURLにアクセスをお願いします。")
                        
                        return redirect(this_url_name)
                    
                    except Exception as e:
                        cleaned_data_str = ", ".join(f"{field_name}={value}" for field_name, value in form.cleaned_data.items())
                        raise Exception(f"POSTでエラー\n{cleaned_data_str}") from e
            else:
                messages.warning(request, f"変更に失敗 入力に不備があるため変更できませんでした。")
        
        progress = get_decedent_progress(user)
        company_mail_address = CompanyData.MAIL_ADDRESS
        service_content = Sections.SERVICE_CONTENT
        context = {
            "title" : title,
            "progress": progress,
            "form": form,
            "company_mail_address": company_mail_address,
            "service_content": service_content
        }
        
        return render(request, html, context)
    
    except Exception as e:
        return handle_error(
            e,
            request,
            request_user,
            function_name,
            this_url_name,
            notices = f"request.POST={request.POST}"
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
            request.user,
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