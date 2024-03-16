from django.shortcuts import render, redirect, get_object_or_404
from .prefectures import PREFECTURES
from .landCategorys import LANDCATEGORYS
from .customDate import *
from .sections import *
from .company_data import *
from .forms import *
from django.forms import formset_factory
from .models import *
from accounts.models import User
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
import datetime
import json
from django.http import JsonResponse
import requests
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib import messages
import textwrap
from django.core.mail import BadHeaderError, EmailMessage
from django.http import HttpResponse
from django.db import transaction, DatabaseError, OperationalError
from smtplib import SMTPException
import socket
from django.views.decorators.csrf import csrf_exempt
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict
from django.db.models import Q
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
import googleapiclient.errors 
from pydrive2.auth import GoogleAuth
from pydrive2.drive import GoogleDrive
import gdown
from django.core.files.storage import default_storage
import os
from django.conf import settings
from urllib.parse import urlparse, parse_qs
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from bs4 import BeautifulSoup
import logging

logger = logging.getLogger(__name__)

def index(request):
    is_inquiry = False
    
    if "post_success" in request.session and request.session["post_success"]:
        is_inquiry = True
        del request.session["post_success"]
    
    if request.method == "POST":
        form = OpenInquiryForm(request.POST)
        if form.is_valid():
            with transaction.atomic():
                try:
                    form.save()
                    subject = CompanyData.APP_NAME + "：お問い合わせありがとうございます"
                    content = textwrap.dedent('''
                        このメールはシステムからの自動返信です。
                        送信専用のメールアドレスのため、こちらにメールいただいても対応できません。

                        以下の内容でお問い合わせを受け付けました。
                        
                        原則２４時間以内にご回答いたしますので、恐れ入りますが今少しお時間をください。
                        ※金土日祝日にお問い合わせいただいた場合は、翌月曜日になることもあります。
                        
                        ----------------------------------

                        件名
                        {subject}

                        お問い合わせ内容
                        {content}
                        
                        -----------------------------------
                        {company_sub_name}
                        {company_name}
                        {company_post_number}
                        {company_address}
                        受信専用電話番号 {company_receiving_phone_number}
                        発信専用電話番号 {company_calling_phone_number}
                        営業時間 {company_opening_hours}
                        ホームページ {company_url}
                    ''').format(
                        subject=form.cleaned_data["subject"],
                        content=form.cleaned_data["content"],
                        company_name=CompanyData.NAME,
                        company_post_number=CompanyData.POST_NUMBER,
                        company_address=CompanyData.ADDRESS,
                        company_receiving_phone_number=CompanyData.RECEIVING_PHONE_NUMBER,
                        company_calling_phone_number=CompanyData.CALLING_PHONE_NUMBER,
                        company_opening_hours=CompanyData.OPENING_HOURS,
                        company_url=CompanyData.URL,
                    )
                    to_list = [form.cleaned_data["created_by"]]
                    bcc_list = ["toukiaidev@gmail.com"]
                    message = EmailMessage(subject=subject, body=content, from_email="toukiaidev@gmail.com", to=to_list, bcc=bcc_list)
                    message.send()
                    request.session["post_success"] = True
                    
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
            
        else:
            messages.warning(request, "入力内容に誤りがあったため受付できませんでした")
            
        return redirect("/toukiApp/index")
            
    else:
        forms = OpenInquiryForm()
        
    update_articles = UpdateArticle.objects.order_by("-updated_by")[:2]
    
    context = {
        "title" : "トップページ",
        "update_articles": update_articles,
        "forms": forms,
        "company_app_name": CompanyData.APP_NAME,
        "company_mail_address": CompanyData.MAIL_ADDRESS,
        "company_service": Service,
        "is_inquiry": is_inquiry,
    }
    
    return render(request, "toukiApp/index.html", context)

# ステップ１のデータ登録処理
def save_step_one_datas(user, forms, form_sets):
    # すべてのデータを削除する
    
    decedent = forms[0].save(commit=False)
    Decedent.objects.filter(user=user).delete()
    decedent.progress = 2
    decedent.user = user
    decedent.created_by = user
    decedent.updated_by = user
    decedent.save()
    
    # 配偶者
    spouse = forms[1].save(commit=False)
    spouse.decedent = decedent
    spouse.content_type = ContentType.objects.get_for_model(Decedent)
    spouse.object_id = decedent.id
    spouse.is_heir = forms[1].cleaned_data.get("is_live") and forms[1].cleaned_data.get("is_refuse") == False
    spouse.created_by = user
    spouse.updated_by = user
    spouse.save()
    
    # 子共通
    child_common = forms[2].save(commit=False)
    child_common.decedent = decedent
    child_common.created_by = user
    child_common.updated_by = user
    child_common.save()
    
    # 子
    child_dict = {}
    for form in form_sets[0]:
        if form.cleaned_data.get("name"):
            child = form.save(commit=False)
            child.decedent = decedent
            child.content_type1 = ContentType.objects.get_for_model(Decedent)
            child.object_id1 = decedent.id
            if(form.cleaned_data.get("target2") != ""):
                child.content_type2 = ContentType.objects.get_for_model(Spouse)
                child.object_id2 = spouse.id
            child.is_heir = form.cleaned_data.get("is_live") and form.cleaned_data.get("is_refuse") == False
            child.created_by = user
            child.updated_by = user
            child.save()
            child_dict[form.cleaned_data.get("index")] = child
            
    # 子の配偶者
    child_spouse_dict = {}
    for form in form_sets[1]:
        if form.cleaned_data.get("name"):
            child_spouse = form.save(commit=False)
            child_spouse.decedent = decedent
            if form.cleaned_data.get("target") in child_dict:
                child_spouse.content_type = ContentType.objects.get_for_model(Descendant)
                child_spouse.object_id = child_dict[form.cleaned_data.get("target")].id
            child_spouse.is_heir = form.cleaned_data.get("is_live") and form.cleaned_data.get("is_refuse") == False
            child_spouse.created_by = user
            child_spouse.updated_by = user
            child_spouse.save()
            child_spouse_dict[form.cleaned_data.get("index")] = child_spouse

            
    # 孫
    for form in form_sets[2]:
        if form.cleaned_data.get("name"):
            grand_child = form.save(commit=False)
            grand_child.decedent = decedent
            if form.cleaned_data.get("target1") in child_dict:
                grand_child.content_type1 = ContentType.objects.get_for_model(Descendant)
                grand_child.object_id1 = child_dict[form.cleaned_data.get("target1")].id
            if form.cleaned_data.get("target2") in child_spouse_dict:
                grand_child.content_type2 = ContentType.objects.get_for_model(Spouse)
                grand_child.object_id2 = child_spouse_dict[form.cleaned_data.get("target2")].id
            grand_child.is_heir = form.cleaned_data.get("is_live") and form.cleaned_data.get("is_refuse") == False
            grand_child.created_by = user
            grand_child.updated_by = user
            grand_child.save()
            
    # 尊属
    ascendant_dict = {}
    for idx, form in enumerate(form_sets[3]):
        
        if form.cleaned_data.get("name"):
            ascendant = form.save(commit=False)
            ascendant.decedent = decedent
            ascendant.is_heir = form.cleaned_data.get("is_live") and form.cleaned_data.get("is_refuse") == False
            
            if idx < 2:
                ascendant.content_type = ContentType.objects.get_for_model(Decedent)
                ascendant.object_id = decedent.id
            else:
                target = form.cleaned_data.get("target")
                if target in ascendant_dict:
                    ascendant.content_type = ContentType.objects.get_for_model(Ascendant)
                    ascendant.object_id = ascendant_dict[target].id
            ascendant.created_by = user
            ascendant.updated_by = user
            ascendant.save()
            ascendant_dict[form.cleaned_data.get("index")] = ascendant
            
    # 兄弟姉妹共通
    if forms[3].cleaned_data.get("is_exist") is not None:
        collateral_common = forms[3].save(commit=False)
        collateral_common.decedent = decedent
        collateral_common.created_by = user
        collateral_common.updated_by = user
        collateral_common.save()
        
    # 兄弟姉妹
    for form in form_sets[4]:
        if form.cleaned_data.get("name"):
            collateral = form.save(commit=False)
            collateral.decedent = decedent
            if form.cleaned_data.get("target1") != "":
                collateral.content_type1 = ContentType.objects.get_for_model(Ascendant)
                collateral.object_id1 = ascendant_dict[form.cleaned_data.get("target1")].id
            if form.cleaned_data.get("target2") != "":
                collateral.content_type2 = ContentType.objects.get_for_model(Ascendant)
                collateral.object_id2 = ascendant_dict[form.cleaned_data.get("target2")].id
            collateral.is_heir = form.cleaned_data.get("is_live") and form.cleaned_data.get("is_refuse") ==  False
            collateral.created_by = user
            collateral.updated_by = user
            collateral.save()

# ステップ１
# 被相続人情報と相続人情報の入力
def step_one(request):
    if not request.user.is_authenticated:
        return redirect(to='/account/login/')
    
    user = User.objects.get(email = request.user)
    child_form_set = formset_factory(form=StepOneDescendantForm, extra=1, max_num=15)
    grand_child_form_set = formset_factory(form=StepOneDescendantForm, extra=1, max_num=15)
    ascendant_form_set = formset_factory(form=StepOneAscendantForm, extra=6, max_num=6)
    child_spouse_form_set = formset_factory(form=StepOneSpouseForm, extra=1, max_num=15)
    collateral_form_set = formset_factory(form=StepOneCollateralForm, extra=1, max_num=15)
    
    if request.method == "POST":
        forms = [
            StepOneDecedentForm(request.POST, prefix="decedent"),
            StepOneSpouseForm(request.POST, prefix="spouse"),
            StepOneDescendantCommonForm(request.POST, prefix="child_common"),
            StepOneCollateralCommonForm(request.POST, prefix="collateral_common"),
            ]
        form_sets = [
            child_form_set(request.POST, prefix="child"),
            child_spouse_form_set(request.POST or None, prefix="child_spouse"),
            grand_child_form_set(request.POST or None, prefix="grand_child"), 
            ascendant_form_set(request.POST or None, prefix="ascendant"),
            collateral_form_set(request.POST or None, prefix="collateral")
            ]

        # if not all(form.is_valid() for form in forms) or not all(form_set.is_valid() for form_set in form_sets):
        #     for form in forms:
        #         if not form.is_valid():
        #             print(f"Form {form} errors: {form.errors}")
        #     for form_set in form_sets:
        #         if not form_set.is_valid():
        #             print(f"Formset {form_set} errors: {form_set.errors}")
        #     return redirect('/toukiApp/step_one')
        if all(form.is_valid() for form in forms) and all(form_set.is_valid() for form_set in form_sets):
            try:
                with transaction.atomic():
                    save_step_one_datas(user, forms, form_sets)
            except Exception as e:
                # ログにエラーメッセージを記録します
                print(f"Error occurred: {e}")
                # ユーザーにエラーが発生したことを通知します
                messages.error(request, 'データの保存中にエラーが発生しました。')
                return redirect('/toukiApp/step_one')
            else:
                return redirect('/toukiApp/step_two')
        else:
            for form in forms:
                if not form.is_valid():
                    print(f"Form {form} errors: {form.errors}")
            for form_set in form_sets:
                if not form_set.is_valid():
                    print(f"Formset {form_set} errors: {form_set.errors}")
            return redirect('/toukiApp/step_one')
    
    userDataScope = []
    spouse_data = {}
    childs_data = []
    child_heirs_data = []
    ascendant_data = []
    collateral_data = []
    progress = 1
    
    if user.decedent.first():
        decedent = user.decedent.first()
        progress = decedent.progress
        decedent_form = StepOneDecedentForm(prefix="decedent", instance=decedent)
        userDataScope.append("decedent")
        
        spouse_form = StepOneSpouseForm(prefix="spouse")
        spouse = Spouse.objects.filter(object_id=decedent.id).first()
        if spouse:
            spouse_data = model_to_dict(spouse)
            userDataScope.append("spouse")

            child_common = DescendantCommon.objects.filter(decedent=decedent).first()
            if child_common:
                child_common_form = StepOneDescendantCommonForm(prefix="child_common", instance=child_common)
                userDataScope.append("child_common")
                
                childs = Descendant.objects.filter(object_id1=decedent.id)
                if childs.exists():
                    childs_data = [
                        {
                            **{'id': child.id},
                            **{'count': Descendant.objects.filter(object_id1=child.id).count()},
                            **{'is_spouse': Spouse.objects.filter(decedent=decedent, object_id=child.id).count()},
                            **{f: model_to_dict(child).get(f) for f in StepOneDescendantForm().fields if f in model_to_dict(child)}
                        }
                        for child in childs
                    ]
                    userDataScope.append("child")
                    
                    child_spouses = Spouse.objects.filter(decedent=decedent)[1:]
                    if child_spouses.exists():
                        child_spouses_data = [
                            {
                                **{"child_id":child_spouse.object_id},
                                **{f: model_to_dict(child_spouse).get(f) for f in StepOneSpouseForm().fields if f in model_to_dict(child_spouse)}
                            }
                            for child_spouse in child_spouses
                        ]
                    else:
                        child_spouses_data = []
                        
                    grand_childs = Descendant.objects.filter(decedent=decedent).exclude(object_id1=decedent.id)
                    if grand_childs.exists():
                        grand_childs_data = [
                            {
                                **{"child_id":grand_child.object_id1},
                                **{f: model_to_dict(grand_child).get(f) for f in StepOneDescendantForm().fields if f in model_to_dict(grand_child)}
                            }
                            for grand_child in grand_childs
                        ]
                    else:
                        grand_childs_data = []
                        
                    if child_spouses_data or grand_childs_data:
                        userDataScope.append("child_heirs")
                        child_heirs_data = child_spouses_data + grand_childs_data
                        child_heirs_data.sort(key=lambda x: (x['child_id'], not (x in child_spouses_data)))

                ascendants = Ascendant.objects.filter(decedent=decedent)
                if ascendants.exists():
                    ascendant_data = [
                        {
                            **{'id': ascendant.id},
                            **{f: model_to_dict(ascendant).get(f) for f in StepOneAscendantForm().fields if f in model_to_dict(ascendant)}
                        }
                        for ascendant in ascendants
                    ]
                    ascendant_data = sorted(ascendant_data, key=lambda x: x['id'])
                    userDataScope.append("ascendant")

                collateral_common = CollateralCommon.objects.filter(decedent=decedent).first()
                if collateral_common:
                    collateral_common_form = StepOneCollateralCommonForm(prefix="collateral_common", instance=collateral_common)
                    userDataScope.append("collateral_common")
                    
                    collaterals = Collateral.objects.filter(decedent=decedent)
                    if collaterals.exists():
                        collateral_data = [
                            {
                                **{'id': collateral.id},
                                **{f: model_to_dict(collateral).get(f) for f in StepOneCollateralForm().fields if f in model_to_dict(collateral)}
                            }
                            for collateral in collaterals
                        ]
                        userDataScope.append("collateral")
                else:
                    collateral_common_form = StepOneCollateralCommonForm(prefix="collateral_common")
            else:
                child_common_form = StepOneDescendantCommonForm(prefix="child_common")
    else:
        decedent_form = StepOneDecedentForm(prefix="decedent")
        spouse_form = StepOneSpouseForm(prefix="spouse")
        child_common_form = StepOneDescendantCommonForm(prefix="child_common")
        collateral_common_form = StepOneCollateralCommonForm(prefix="collateral_common") 
    
    decedent_form_internal_field_name = ["user", "progress"]
    spouse_form_internal_field_name = ["decedent", "content_type", "object_id", "is_heir"]
    common_form_internal_field_name = ["decedent"]
    child_form_internal_field_name = ["decedent", "content_type1", "object_id1", "content_type2", "object_id2", "is_heir"]
    ascendant_form_internal_field_name = ["decedent", "content_type", "object_id", "is_heir"]
    ascendants_relation = ["父", "母", "父方の祖父", "父方の祖母", "母方の祖父", "母方の祖母"]
    collateral_form_internal_field_name = ["decedent", "content_type1", "object_id1", "content_type2", "object_id2", "is_heir"]
    
    context = {
        "title" : "１．" + Sections.STEP1,
        "user" : user,
        "progress": progress,
        "decedent_form": decedent_form,
        "decedent_form_internal_field_name": decedent_form_internal_field_name,
        "spouse_form": spouse_form,
        "spouse_form_internal_field_name": spouse_form_internal_field_name,
        "child_common_form" : child_common_form,
        "collateral_common_form" : collateral_common_form,
        "common_form_internal_field_name" : common_form_internal_field_name,
        "sections" : Sections.SECTIONS[Sections.STEP1],
        "service_content" : Sections.SERVICE_CONTENT,
        "child_form_set" : child_form_set(prefix="child"),
        "child_spouse_form_set" : child_spouse_form_set(prefix="child_spouse"),
        "grand_child_form_set" : grand_child_form_set(prefix="grand_child"),
        "ascendant_form_set" : ascendant_form_set(prefix="ascendant"),
        "child_form_internal_field_name" : child_form_internal_field_name,
        "ascendant_form_internal_field_name": ascendant_form_internal_field_name,
        "ascendants_relation" : ascendants_relation,
        "collateral_form_set" : collateral_form_set(prefix="collateral"),
        "collateral_form_internal_field_name" : collateral_form_internal_field_name,
        "userDataScope" : json.dumps(userDataScope),
        "spouse_data" : json.dumps(spouse_data),
        "childs_data" : json.dumps(childs_data),
        "child_heirs_data" : json.dumps(child_heirs_data),
        "ascendant_data" : json.dumps(ascendant_data),
        "collateral_data" : json.dumps(collateral_data),
    }
    
    return render(request, "toukiApp/step_one.html", context)

# 死亡している相続人候補を取得する
def get_deceased_persons(decedent):
    deceased_persons = []
    
    spouse = Spouse.objects.filter(decedent=decedent).first()
    if spouse and spouse.is_live is False:
        deceased_persons.append(spouse)
    
    childs = Descendant.objects.filter(object_id1=decedent.id)
    if childs.exists() and any(child for child in childs if child.is_live is False):
        deceased_persons += [child for child in childs if child.is_live is False]
        child_spouses = [spouse for spouse in Spouse.objects.filter(decedent=decedent)[1:] if spouse.is_live is False]
        grand_childs = [descendant for descendant in Descendant.objects.filter(decedent=decedent).exclude(object_id1=decedent.id) if descendant.is_live is False]
        child_heirs = child_spouses + grand_childs

        if child_heirs:
            # object_idまたはobject_id1を取得する関数
            def get_id(obj):
                return obj.object_id if isinstance(obj, Spouse) else obj.object_id1

            # 同じIDがある場合に、child_spousesの要素が先に来るようにする関数
            def compare(obj):
                return (get_id(obj), isinstance(obj, Descendant))

            # 比較関数に基づいてソート
            child_heirs = sorted(child_heirs, key=compare)
            deceased_persons += [child_heir for child_heir in child_heirs]
            
    ascendants = Ascendant.objects.filter(decedent=decedent)
    if ascendants.exists():
        deceased_persons += [ascendant for ascendant in ascendants if ascendant.is_live is False]
        
    collaterals = Collateral.objects.filter(decedent=decedent)
    if collaterals.exists():
        deceased_persons += [collateral for collateral in collaterals if collateral.is_live is False]
    
    return deceased_persons

def get_heirs(decedent):
    heirs = []
    
    spouse = Spouse.objects.filter(decedent=decedent).first()
    if spouse and spouse.is_heir:
        heirs.append(spouse)
    
    childs = Descendant.objects.filter(object_id1=decedent.id)
    if childs.exists() and any(child for child in childs if child.is_heir):
        heirs += [child for child in childs if child.is_heir]
    
    if childs.exists() and any(child for child in childs if child.is_live is False):
        child_spouses = [spouse for spouse in Spouse.objects.filter(decedent=decedent).exclude(object_id=decedent.id) if spouse.is_heir]
        grand_childs = [descendant for descendant in Descendant.objects.filter(decedent=decedent).exclude(object_id1=decedent.id) if descendant.is_heir]
        child_heirs = child_spouses + grand_childs

        if child_heirs:
            # object_idまたはobject_id1を取得する関数
            def get_id(obj):
                return obj.object_id if isinstance(obj, Spouse) else obj.object_id1

            # 同じIDがある場合に、child_spousesの要素が先に来るようにする関数
            def compare(obj):
                return (get_id(obj), isinstance(obj, Descendant))

            # 比較関数に基づいてソート
            child_heirs = sorted(child_heirs, key=compare)
            heirs += [child_heir for child_heir in child_heirs]
            
    ascendants = Ascendant.objects.filter(decedent=decedent)
    if ascendants.exists():
        heirs += [ascendant for ascendant in ascendants if ascendant.is_heir]
        
    collaterals = Collateral.objects.filter(decedent=decedent)
    if collaterals.exists():
        heirs += [collateral for collateral in collaterals if collateral.is_heir]
    
    return heirs

def get_prefecture_name(prefecture_code):
    for code, name in PREFECTURES:
        if code == prefecture_code:
            return name
    return '該当の都道府県番号がありません'  # キーが見つからない場合のデフォルト値

#ステップ２のデータを登録する
def save_step_two_datas(request):
    pass

# GoogleドライブのダウンロードリンクからファイルIDを抽出
def extract_file_id_from_url(url):
    query = urlparse(url).query
    params = parse_qs(query)
    return params['id'][0]

#ステップ２
#必要書類リスト
def step_two(request):
    if not request.user.is_authenticated:
        return redirect(to='/account/login/')

    user = User.objects.get(email = request.user)
    decedent = user.decedent.first()
    registry_files = Register.objects.filter(decedent=decedent)
    
    if request.method == "POST":
        try:
            with transaction.atomic():
                decedent.progress = 3
                decedent.save()

                # if os.getenv('DJANGO_SETTINGS_MODULE') == 'toukiAi.settings.development':
                    
                # サービスアカウントの認証情報ファイルのパス
                SERVICE_ACCOUNT_FILE = 'toukiai-development-7bf1692a5215.json'
                
                # サービスアカウント認証情報をロード
                credentials = service_account.Credentials.from_service_account_file(
                    SERVICE_ACCOUNT_FILE,
                    scopes=['https://www.googleapis.com/auth/drive'])
                
                # GoogleAuth オブジェクトの初期化
                gauth = GoogleAuth()
                gauth.credentials = credentials
                service = build('drive', 'v3', credentials=credentials)
                    
                #不動産登記簿は常に全削除と全登録を行う
                if registry_files.exists():
                    for file in registry_files:
                        # Googleドライブからファイルを削除
                        file_id = extract_file_id_from_url(file.path)
                        service.files().delete(fileId=file_id).execute()
                    registry_files.delete()
                    
                for i in range(len(request.FILES)):
                    pdf = request.FILES['pdf' + str(i)]
                    if not pdf:
                        continue
                    relative_path = default_storage.save(os.path.join('tmp/', pdf.name), pdf)
                    absolute_path = os.path.join(settings.MEDIA_ROOT, relative_path)
                    # ファイルのメタデータ
                    file_metadata = {
                        'name': pdf.name,
                        'parents': ['1iEOCvgmg8tzYyWMV_LFGvbVsJK8_wxRl']  # 親フォルダのID
                    }
                    # ファイルのアップロードを実行
                    media = MediaFileUpload(absolute_path, mimetype='application/pdf')
                    file_drive = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
                    # ファイルのアクセス権限を設定
                    service.permissions().create(
                                fileId=file_drive['id'],
                                body={'type': 'anyone', 'role': 'reader'},
                                fields='id'
                            ).execute()
                    # 新しいRegisterオブジェクトを作成し、属性に値を設定
                    register = Register(
                        decedent=decedent,
                        title=pdf.name,
                        path=f'https://drive.google.com/uc?export=download&id={file_drive["id"]}',  # Gドライブ上のファイルへのダウンロードリンク
                        file_size=os.path.getsize(absolute_path),
                        extension=os.path.splitext(pdf.name)[1][1:],  # 拡張子を取得
                        created_by=user,
                        updated_by=user
                    )
                    register.save()  # データベースに保存
        except googleapiclient.errors.HttpError as e:
            print(f'Error occurred: {e}')
        except Exception as e:
            print(f"Error occurred: {e}")
            messages.error(request, 'データの保存中にエラーが発生しました。')
            return JsonResponse({'status': 'error'})
        else:
            return JsonResponse({'status': 'success'})
    
    # 不動産登記簿があるとき
    file_server_file_name_and_file_path = []
    if registry_files.exists():
        for file in registry_files:
            # ファイルの保存先のパスを追加
            file_server_file_name_and_file_path.append({"name": file.title, "path": file.path})
            
    app_server_file_name_and_file_path = []
    for file_name_and_file_path in file_server_file_name_and_file_path:
        # ダウンロード先のパス
        output = os.path.join(settings.MEDIA_ROOT, 'download_tmp', file_name_and_file_path["name"])

        # ファイルをダウンロード
        print("aaaaa" + file_name_and_file_path["path"])
        gdown.download(file_name_and_file_path["path"], output, quiet=True)

        # ダウンロードしたファイルの名前とパスを配列に追加
        app_server_file_name_and_file_path.append({"name": file_name_and_file_path["name"], "path": settings.MEDIA_URL + 'download_tmp/' + file_name_and_file_path["name"]})

    # 配列をJSON形式に変換
    app_server_file_name_and_file_path = json.dumps(app_server_file_name_and_file_path)
    
    progress = decedent.progress
    deceased_persons = get_deceased_persons(decedent)
    heirs = get_heirs(decedent)
    minors = [heir for heir in heirs if hasattr(heir, 'is_adult') and heir.is_adult is False]
    overseas = [heir for heir in heirs if hasattr(heir, 'is_japan') and heir.is_japan is False]
    family_registry_search_word = "戸籍 郵送請求"
    family_registry_query = f"{decedent.domicile_prefecture}{decedent.domicile_city} {family_registry_search_word}"
    response = requests.get(f"https://www.googleapis.com/customsearch/v1?key=AIzaSyAmeV3HS-AshtCAHWit7eAEEudyEkwtnxE&cx=9242f933284cb4535&q={family_registry_query}")
    data = response.json()
    top_link = data["items"][0]["link"]
    context = {
        "title" : "２．必要書類一覧",
        "user" : user,
        "progress": progress,
        "prefectures": PREFECTURES,
        "decedent": decedent,
        "app_server_file_name_and_file_path": app_server_file_name_and_file_path,
        "file_server_file_name_and_file_path": file_server_file_name_and_file_path,
        "top_link": top_link,
        "deceased_persons": deceased_persons,
        "heirs": heirs,
        "minors": minors,
        "overseas": overseas,
        "sections" : Sections.SECTIONS[Sections.STEP2],
        "service_content" : Sections.SERVICE_CONTENT,
    }
    return render(request, "toukiApp/step_two.html", context)

"""

ステップ３関連

"""

def check_type_of_division_conditions(data):
    """登録されている遺産分割方法のデータが入力完了しているものか判別する
    
    Args:
        data (TypeOfDivision): 遺産分割方法のデータ

    Returns:
        bool: 入力完了であればtrue、未完了はfalse
    """
    # data.property_allocationの値が存在するかどうか
    condition1 = bool(data.property_allocation)
    
    # data.content_type1 と data.object_id1 の両方の値が存在するかどうか
    condition2 = bool(data.content_type1) and bool(data.object_id1)
    
    # data.cash_allocationの値が存在するかどうか
    condition3 = bool(data.cash_allocation)
    
    # data.content_type2 と data.object_id2 の両方の値が存在するかどうか
    condition4 = bool(data.content_type2) and bool(data.object_id2)
    
    # data.type_of_divisionが存在するかどうか
    condition5 = bool(data.type_of_division)

    # 組み合わせた条件
    # data.property_allocationが存在する または data.content_type1 と data.object_id1 の両方が存在する
    combined_condition1 = condition1 or condition2

    # data.cash_allocationが存在する または data.content_type2 と data.object_id2 の両方が存在する
    combined_condition2 = condition3 or condition4

    # 最終的な条件：上記の条件とdata.type_of_divisionが存在する
    final_condition = combined_condition1 and combined_condition2 and condition5

    return final_condition

def step_three_input_status(data):
    """登録されているステップ３のデータをチェックしてどこまで入力が完了しているか判別する
    
    Args:
        data (_type_): ステップ３で使用するデータ

    Returns:
        bool: 入力完了はtrue、未完了はfalse
    """
    #被相続人データのとき
    if data.__class__ == Decedent:
        #チェック対象の属性リスト
        attr = [
            data.name,
            data.death_year, data.death_month, data.death_date, 
            data.birth_year, data.birth_month, data.birth_date, 
            data.prefecture, data.city, data.address, 
            data.domicile_prefecture, data.domicile_city, data.domicile_address
        ]
        #チェック対象が全て値を持つときTrueを返す
        if all(attr):
            return True
    elif data.__class__ == RegistryNameAndAddress:
        if all([all([d.name, d.prefecture, d.city, d.address]) for d in data]):
            return True
    elif data.__class__ in [Spouse, Ascendant, Descendant, Collateral]:
        #ループ処理できるようにdataを配列形式に変える
        if not isinstance(data, list):
            data = [data]
            
        flg = True
        for d in data:
            attr = [
                d.name,
                d.birth_year, d.birth_month, d.birth_date
            ]
            #卑属又は兄弟姉妹のとき前配偶者又は異父母データを追加する
            if d.__class__ in [Descendant, Collateral]:
                attr.append(d.object_id2)
            #死亡して相続放棄してない又は空欄とき、死亡年月日を追加
            if d.is_live is False and not d.is_refuse:
                attr.extend([d.death_year, d.death_month, d.death_date])
            #不動産を取得するとき、都道府県、市区町村、町域・番地を追加
            if d.is_acquire is True:
                attr.extend([d.prefecture, d.city, d.address])
            #全項目をチェック
            if not all(attr):
                flg = False
                break
        return flg
    elif data.__class__ == TypeOfDivision:
        return check_type_of_division_conditions(data)
    elif data.__class__ == NumberOfProperties:
        attr = [data.land, data.house, data.bldg]
        if any(x > 0 for x in attr):
            return True
    elif data.__class__ in [Land, House, Bldg]:
        attr = [data.number, data.address, data.purparty, data.price, data.is_exchange, data.office]
        if all(attr):
            return True
    elif data.__class__ == Site:
        attr = [data.bldg, data.number, data.address_and_land_number, data.type, 
                data.purparty_bottom, data.purparty_top, data.price,]
        if all(attr):
            return True
    elif data.__class__ in [PropertyAcquirer, CashAcquirer]:
        attr = [data.content_type1, data.object_id1, data.content_object1, 
                data.content_type2, data.object_id2, data.content_object2,
                data.percentage]
        if all(attr):
            return True
    elif data.__class__ == Application:
        if data.is_agent is not None:
            attr = []
            if data.is_agent == True:
                attr = [data.content_type, data.object_id,
                        data.agent_name, data.agent_address, data.agent_phone_number,
                        data.is_return, data.is_mail]
            else:
                attr = [data.content_type, data.object_id, data.phone_number,
                        data.is_return, data.is_mail]
            if all(attr):
                return True        
            
    return False

def get_registry_name_and_address_initial_data(data):
    """登記簿上の氏名住所の初期データ生成処理。

    Args:
        data (RegistryNameAndAddress): データセットまたはモデルのインスタンス。

    Returns:
        list of dict: 初期データのリスト。
    """
    initial_data = []
    for d in data:
        data_dict = {
            "name": d.name,
            "prefecture": d.prefecture,
            "city": d.city,
            "address": d.address,
            "bldg": d.bldg,
        }
        
        initial_data.append(data_dict)

    return initial_data

def get_spouse_or_ascendant_initial_data(data):
    """配偶者又は直系尊属の初期データ生成処理。

    Args:
        data (Spouse or Ascendant): データセットまたはモデルのインスタンス。

    Returns:
        list of dict: 初期データのリスト。
    """
    initial_data = []
    for d in data:
        data_dict = {
            "name": d.name,
            "death_year": getattr(d, 'death_year', None),
            "death_month": getattr(d, 'death_month', None),
            "death_date": getattr(d, 'death_date', None),
            "birth_year": getattr(d, 'birth_year', None),
            "birth_month": getattr(d, 'birth_month', None),
            "birth_date": getattr(d, 'birth_date', None),
            "is_acquire": getattr(d, 'is_acquire', None),
            "prefecture": getattr(d, 'prefecture', None),
            "city": getattr(d, 'city', None),
            "address": getattr(d, 'address', None),
            "bldg": getattr(d, 'bldg', None),
            "is_live": getattr(d, 'is_live', None),
            "is_heir": getattr(d, 'is_heir', None),
            "is_refuse": getattr(d, 'is_refuse', None),
            "is_exist": getattr(d, 'is_exist', None),
            "is_japan": getattr(d, 'is_japan', None),
            "content_type": getattr(d, 'content_type', None),
            "object_id": getattr(d, 'object_id', None),
            "content_type1": getattr(d, 'content_type1', None),
            "object_id1": getattr(d, 'object_id1', None),
            "content_type2": getattr(d, 'content_type2', None),
            "object_id2": getattr(d, 'object_id2', None),            
        }
        if hasattr(d, 'id') and hasattr(d, 'content_type'):
            data_dict["id_and_content_type"] = f"{d.id}_{ContentType.objects.get_for_model(d).id}"
        
        initial_data.append(data_dict)

    return initial_data

def get_descendant_or_collateral_initial_data(data, content_type_model):
    """_summary_
    初期表示する直系卑属又は傍系データを返す

    Args:
        data (Descendant or Collateral): 直系卑属又は傍系のデータ

    Returns:
        dict: 辞書型に格納したデータ
    """
    content_type = ContentType.objects.get_for_model(content_type_model)
    related_individual_content_type = ContentType.objects.get_for_model(RelatedIndividual)

    initial_data = []
    for d in data:
        other_parent_name = None
        if d.content_type2 == related_individual_content_type:
            related_individual = RelatedIndividual.objects.filter(
                id=d.object_id2,
                object_id=d.id,
                content_type=content_type
            ).first()
            other_parent_name = related_individual.name if related_individual else None

        # 辞書データを生成
        data_dict = {
            "name": d.name,
            "death_year": d.death_year,
            "death_month": d.death_month,
            "death_date": d.death_date,
            "birth_year": d.birth_year,
            "birth_month": d.birth_month,
            "birth_date": d.birth_date,
            "is_acquire": d.is_acquire,
            "prefecture": d.prefecture,
            "city": d.city,
            "address": d.address,
            "bldg": d.bldg,
            "content_type1": d.content_type1,
            "object_id1": d.object_id1,
            "content_type2": d.content_type2,
            "object_id2": d.object_id2,
            "other_parent_name": other_parent_name,
            "is_live": d.is_live,
            "is_heir": d.is_heir,
            "is_refuse": d.is_refuse,
            "is_exist": d.is_exist,
            "is_japan": d.is_japan,
            "is_adult": d.is_adult,
            "id_and_content_type": f"{d.id}_{content_type.id}",
        }

        initial_data.append(data_dict)

    return initial_data     

def get_property_initial_data(data):
    """不動産の初期データ生成処理。

    Args:
        data (Land or House or Bldg or Site): データセットまたはモデルのインスタンス。

    Returns:
        list of dict: 初期データのリスト。
    """
    initial_data = []
    for d in data:
        data_dict = {
            "decedent": d.decedent,
            "bldg": getattr(d, "bldg", None),
            "register": getattr(d, "register", None),
            "number": d.number,
            "address": getattr(d, "address", None),
            "address_and_land_number": getattr(d, "address_and_land_number", None),
            "land_number": getattr(d, "land_number", None),
            "house_number": getattr(d, "house_number", None),
            "bldg_number": getattr(d, "bldg_number", None),
            "type": getattr(d, "type", None),
            "purparty": getattr(d, "purparty", None),
            "purparty_bottom": getattr(d, "purparty_bottom", None),
            "purparty_top": getattr(d, "purparty_top", None),
            "office": getattr(d, "office", None),
            "price": d.price,
            "is_exchange": d.is_exchange,
        }
        
        initial_data.append(data_dict)

    return initial_data

def get_acquirer_initial_data(data):
    """取得者の初期データ生成処理。

    Args:
        data (PropertyAcquirer or CashAcquirer): データセットまたはモデルのインスタンス。

    Returns:
        list of dict: 初期データのリスト。
    """
    initial_data = []
    for d in data:
        data_dict = {
            "decedent": d.decedent,
            "content_type1": d.content_type1,
            "object_id1": d.object_id1,
            "content_object1": d.content_object1,
            "content_type2": d.content_type2,
            "object_id2": d.object_id2,
            "content_object2": d.content_object2,
            "percentage": d.percentage,
        }
        
        initial_data.append(data_dict)

    return initial_data

# データ登録処理
def save_step_three_datas(user, forms, form_sets):
    # すべてのデータを削除する
    forms_idx = {
        "decedent": 0,
        "spouse": 1,
        "type_of_division": 2,
        "number_of_properties": 3,
        "application": 4,
    }
    form_sets_idx = {
        "registry_name_and_address": 0,
        "child": 1,
        "child_spouse": 2,
        "grand_child": 3,
        "ascendant": 4,
        "collateral": 5,
        "land": 6,
        "land_acquirer": 7,
        "land_cash_acquirer": 8,
        "house": 9,
        "house_acquirer": 10,
        "house_cash_acquirer": 11,
    }
 
    decedent = forms[forms_idx["decedent"]].save(commit=False)
    decedent.progress = 4
    decedent.save()
    
    # 配偶者
    spouse = forms[forms_idx["spouse"]].save(commit=False)
    spouse.save()
    
    # 遺産分割方法、不動産の数、申請情報
    type_of_division = forms[forms_idx["type_of_division"]].save(commit=False)
    number_of_properties = forms[forms_idx["number_of_properties"]].save(commit=False)
    application = forms[forms_idx["application"]].save(commit=False)
    #新規登録のときはdecedent, created_byの登録が必要
    if not type_of_division.decedent:
        type_of_division.decedent = decedent
        type_of_division.created_by = user
        number_of_properties.decedent = decedent
        number_of_properties.created_by = user 
        application.decedent = decedent
        number_of_properties.created_by = user
    type_of_division.updated_by = user
    type_of_division.save()
    number_of_properties.updated_by = user
    number_of_properties.save()
    application.updated_by = user
    application.save()
    
    # 登記簿上の氏名住所
    RegistryNameAndAddress.objects.filter(decedent=decedent).delete()
    for form in form_sets[form_sets_idx["registry_name_and_address"]]:
        registry_name_and_address = form.save(commit=False)
        registry_name_and_address.decedent = decedent
        registry_name_and_address.created_by = user
        registry_name_and_address.updated_by = user
        registry_name_and_address.save()
    
    # 子（前配偶者がいるとき、前配偶者の新規登録又は更新をしてから更新する）
    child_content_type = ContentType.objects.get_for_model(Descendant)
    for form in form_sets[form_sets_idx["child"]]:
        child = form.save(commit=False)
        # if(form.cleaned_data.get("other_parent_name") != ""):
        #     other_parent = 
        child.save()
            
def get_data_for_step_three(decedent):
    """_summary_
    被相続人に紐づくステップ３で使用するデータを取得する
    Args:
        decedent (Decedent): 被相続人のデータ
    """
    try:
        registry_name_and_address_data = RegistryNameAndAddress.objects.filter(decedent=decedent)
        spouse_data = Spouse.objects.filter(object_id=decedent.id).first()
        child_data = Descendant.objects.filter(object_id1=decedent.id)
        child_ids = child_data.values_list('id', flat=True)  # child_dataの各要素が持つIDのリストを取得
        child_spouse_data = Spouse.objects.filter(object_id__in=child_ids)
        grand_child_data = Descendant.objects.filter(object_id1__in=child_ids)
        ascendant_data = Ascendant.objects.filter(decedent=decedent)
        collateral_data = Collateral.objects.filter(decedent=decedent)
        type_of_division_data = TypeOfDivision.objects.filter(decedent=decedent).first()
        number_of_properties_data = NumberOfProperties.objects.filter(decedent=decedent).first()
        land_data = Land.objects.filter(decedent=decedent)
        land_content_type = ContentType.objects.get_for_model(Land)
        land_acquirer_data = PropertyAcquirer.objects.filter(decedent=decedent, content_type1=land_content_type)
        land_cash_acquirer_data = CashAcquirer.objects.filter(decedent=decedent, content_type1=land_content_type)
        house_data = House.objects.filter(decedent=decedent)
        house_content_type = ContentType.objects.get_for_model(House)
        house_acquirer_data = PropertyAcquirer.objects.filter(decedent=decedent, content_type1=house_content_type)
        house_cash_acquirer_data = CashAcquirer.objects.filter(decedent=decedent, content_type1=house_content_type)
        bldg_data = Bldg.objects.filter(decedent=decedent)
        site_data = Site.objects.filter(decedent=decedent)
        bldg_content_type = ContentType.objects.get_for_model(Bldg)
        bldg_acquirer_data = PropertyAcquirer.objects.filter(decedent=decedent, content_type1=bldg_content_type)
        bldg_cash_acquirer_data = CashAcquirer.objects.filter(decedent=decedent, content_type1=bldg_content_type)
        application_data = Application.objects.filter(decedent=decedent).first()
        return [registry_name_and_address_data,
                spouse_data, child_data, child_spouse_data, grand_child_data, ascendant_data, collateral_data,
                type_of_division_data,
                number_of_properties_data,
                land_data, land_acquirer_data, land_cash_acquirer_data,
                house_data, house_acquirer_data, house_cash_acquirer_data,
                bldg_data, site_data, bldg_acquirer_data, bldg_cash_acquirer_data,
                application_data,]
    except MultipleObjectsReturned:
        logger.error(f"get_data_for_step_three：重複データが存在します")
        return HttpResponse("データ取得中にエラーが発生しました。", status=500)
    except DatabaseError as e:
        logger.error(f"get_data_for_step_three：データベースでの処理中にエラーが発生しました: {e}")
        redirect(to='/toukiApp/step_three/')
    except Exception as e:
        logger.error(f"get_data_for_step_three：Unexpected error occurred: {e}")
        return HttpResponse("データ取得中にエラーが発生しました。", status=500)
               
#メイン
def step_three(request):
    #ログインユーザー以外はログインページに遷移させる
    if not request.user.is_authenticated:
        return redirect(to='/account/login/')
    
    #ユーザーに紐づく被相続人データを取得する
    user = User.objects.get(email = request.user)
    decedent = user.decedent.first()
    
    #被相続人データがないときは、ステップ１に遷移させる
    if not decedent:
        redirect(to='/toukiApp/step_one/')
    
    #被相続人に紐づくデータを取得する
    data = get_data_for_step_three(decedent)
    data_idx = {
        "registry_name_and_address": 0,
        "spouse": 1,
        "child": 2,
        "child_spouse": 3,
        "grand_child": 4,
        "ascendant": 5,
        "collateral": 6,
        "type_of_division": 7,
        "number_of_properties": 8,
        "land": 9,
        "land_acquirer": 10,
        "land_cash_acquirer": 11,
        "house": 12,
        "house_acquirer": 13,
        "house_cash_acquirer": 14,
        "bldg": 15,
        "site": 16,
        "bldg_acquirer": 17,
        "bldg_cash_acquirer": 18,
        "application": 19,
    }
    
    #フォームセット
    registry_name_and_address_form_set = formset_factory(form=StepThreeRegistryNameAndAddressForm, extra=1, max_num=10)
    child_form_set = formset_factory(form=StepThreeDescendantForm, extra=0, max_num=15)
    child_spouse_form_set = formset_factory(form=StepThreeSpouseForm, extra=0, max_num=15)
    grand_child_form_set = formset_factory(form=StepThreeDescendantForm, extra=0, max_num=15)
    ascendant_form_set = formset_factory(form=StepThreeAscendantForm, extra=0, max_num=15)
    collateral_form_set = formset_factory(form=StepThreeCollateralForm, extra=0, max_num=15)
    land_form_set = formset_factory(form=StepThreeLandForm, extra=1, max_num=20)
    land_acquirer_form_set = formset_factory(form=StepThreeLandAcquirerForm, extra=1, max_num=20)
    land_cash_acquirer_form_set = formset_factory(form=StepThreeLandCashAcquirerForm, extra=1, max_num=20)
    house_form_set = formset_factory(form=StepThreeHouseForm, extra=1, max_num=20)
    house_acquirer_form_set = formset_factory(form=StepThreeHouseAcquirerForm, extra=1, max_num=20)
    house_cash_acquirer_form_set = formset_factory(form=StepThreeHouseCashAcquirerForm, extra=1, max_num=20)
    bldg_form_set = formset_factory(form=StepThreeBldgForm, extra=1, max_num=20)
    site_form_set = formset_factory(form=StepThreeSiteForm, extra=1, max_num=20)
    bldg_acquirer_form_set = formset_factory(form=StepThreeBldgAcquirerForm, extra=1, max_num=20)
    bldg_cash_acquirer_form_set = formset_factory(form=StepThreeBldgCashAcquirerForm, extra=1, max_num=20)
    
    #フォームからデータがPOSTされたとき
    # if request.method == "POST":
        # if request.user != decedent.user:
        #     messages.error(request, 'アカウントデータが一致しません。')
        #     return redirect('/toukiApp/index')
            
        # forms = [
        #     StepThreeDecedentForm(request.POST, instance=decedent, prefix="decedent"),
        #     StepThreeSpouseForm(request.POST, instance=spouse_data, prefix="spouse"),
        #     StepThreeTypeOfDivisionForm(request.POST, prefix="type_of_division"),
        #     StepThreeNumberOfPropertiesForm(request.POST, prefix="number_of_properties"),
        #     StepThreeApplicationForm(request.POST, prefix="application"),
        # ]
        # form_sets = [
        #     registry_name_and_address_form_set(request.POST or None, prefix="registry_name_and_address"),
        #     child_form_set(request.POST or None, prefix="child"),
        #     child_spouse_form_set(request.POST or None, prefix="child_spouse"),
        #     grand_child_form_set(request.POST or None, prefix="grand_child"),
        #     ascendant_form_set(request.POST or None, prefix="ascendant"),
        #     collateral_form_set(request.POST or None, prefix="collateral"),
        #     land_form_set(request.POST or None, prefix="land"),
        #     land_acquirer_form_set(request.POST or None, prefix="land_acquirer"),
        #     land_cash_acquirer_form_set(request.POST or None, prefix="land_cash_acquirer"),
        #     house_form_set(request.POST or None, prefix="house"),
        #     house_acquirer_form_set(request.POST or None, prefix="house_acquirer"),
        #     house_cash_acquirer_form_set(request.POST or None, prefix="house_cash_acquirer"),
        # ]

        # # if not all(form.is_valid() for form in forms) or not all(form_set.is_valid() for form_set in form_sets):
        # #     for form in forms:
        # #         if not form.is_valid():
        # #             print(f"Form {form} errors: {form.errors}")
        # #     for form_set in form_sets:
        # #         if not form_set.is_valid():
        # #             print(f"Formset {form_set} errors: {form_set.errors}")
        # #     return redirect('/toukiApp/step_one')
        # if all(form.is_valid() for form in forms) and all(form_set.is_valid() for form_set in form_sets):
        #     try:
        #         with transaction.atomic():
        #             save_step_three_datas(user, forms, form_sets)
        #     except Exception as e:
        #         # ログにエラーメッセージを記録します
        #         print(f"Error occurred: {e}")
        #         # ユーザーにエラーが発生したことを通知します
        #         messages.error(request, 'データの保存中にエラーが発生しました。')
        #         return redirect('/toukiApp/step_three')
        #     else:
        #         return redirect('/toukiApp/step_four')
        # else:
        #     for form in forms:
        #         if not form.is_valid():
        #             print(f"Form {form} errors: {form.errors}")
        #     for form_set in form_sets:
        #         if not form_set.is_valid():
        #             print(f"Formset {form_set} errors: {form_set.errors}")
        #     return redirect('/toukiApp/step_three')
    
    #入力が完了している項目を取得するための配列
    user_data_scope = [] 
    progress = decedent.progress
    #被相続人のデータを初期値にセットしたフォーム
    decedent_form = StepThreeDecedentForm(prefix="decedent", instance=decedent)
    #被相続人データのうちhtmlには表示しない内部データ
    decedent_form_internal_field_name = ["user", "progress"]
    
    #登記簿上の氏名住所のデータを取得してデータがあるとき
    registry_name_and_address_data = data[data_idx["registry_name_and_address"]]
    if registry_name_and_address_data.exists():
        #余分なフォームを消すためにextraを0に変更して、初期値を与える
        registry_name_and_address_form_set = formset_factory(
            form=StepThreeRegistryNameAndAddressForm, 
            extra=0, 
            max_num=10
        )
        registry_name_and_address_forms = registry_name_and_address_form_set(
            initial = get_registry_name_and_address_initial_data(registry_name_and_address_data),
            prefix="registry_name_and_address"
        )
        #被相続人情報の入力状況チェック
        if step_three_input_status(decedent):
            user_data_scope.append("decedent")
        #登記簿上の氏名住所の入力状況チェック
        if step_three_input_status(registry_name_and_address_data):
            user_data_scope.append("registry_name_and_address")
    #ないとき    
    else:
        registry_name_and_address_forms = registry_name_and_address_form_set(prefix="registry_name_and_address")
    #配偶者
    spouse_data = data[data_idx["spouse"]]
    if spouse_data:
        spouse_form = StepThreeSpouseForm(prefix="spouse", instance=spouse_data)
        if step_three_input_status(spouse_data):
            user_data_scope.append("spouse")
    else:
        spouse_form = StepThreeSpouseForm(prefix="spouse")
    #子
    child_data = data[data_idx["child"]]
    if child_data.exists():
        child_forms = child_form_set(
            initial=get_descendant_or_collateral_initial_data(child_data, Descendant),
            prefix="child"
        )
        if step_three_input_status(child_data):
            user_data_scope.append("child")
    else:
        child_forms = child_form_set(prefix="child")
    #子の配偶者
    child_spouse_data = data[data_idx["child_spouse"]]
    if child_spouse_data.exists():
        child_spouse_forms = child_spouse_form_set(
            initial=get_spouse_or_ascendant_initial_data(child_spouse_data), 
            prefix="child_spouse")
        if step_three_input_status(child_spouse_data):
            user_data_scope.append("child_spouse")
    else:
        child_spouse_forms = child_spouse_form_set(prefix="child")
    #孫
    grand_child_data = data[data_idx["grand_child"]]
    if grand_child_data.exists():
        grand_child_forms = grand_child_form_set(
            initial=get_descendant_or_collateral_initial_data(grand_child_data, Descendant),
            prefix="grand_child"
        )
        if step_three_input_status(grand_child_data):
            user_data_scope.append("grand_child")
    else:
        grand_child_forms = grand_child_form_set(prefix="grand_child")
    #尊属
    ascendant_data = data[data_idx["ascendant"]]
    if ascendant_data.exists():
        ascendant_forms = ascendant_form_set(
            initial=get_spouse_or_ascendant_initial_data(ascendant_data),
            prefix="ascendant")
        if step_three_input_status(ascendant_data):
            user_data_scope.append("ascendant")
    else:
        ascendant_forms = ascendant_form_set(prefix="ascendant")
    #兄弟姉妹
    collateral_data = data[data_idx["collateral"]]
    if collateral_data.exists():
        collateral_forms = collateral_form_set(
            initial=get_descendant_or_collateral_initial_data(collateral_data, Collateral),
            prefix="collateral"
        )
        if step_three_input_status(collateral_data):
            user_data_scope.append("collateral")
    else:
        collateral_forms = collateral_form_set(prefix="collateral")
    #遺産分割方法
    type_of_division_data = data[data_idx["type_of_division"]]
    if type_of_division_data:
        type_of_division_form = StepThreeTypeOfDivisionForm(prefix="type_of_division", instance=type_of_division_data)
        if step_three_input_status(type_of_division_data):
            user_data_scope.append("type_of_division")
    else:
        type_of_division_form = StepThreeTypeOfDivisionForm(prefix="type_of_division")
    #不動産の数
    number_of_properties_data = data[data_idx["number_of_properties"]]
    if number_of_properties_data:
        number_of_properties_form = StepThreeNumberOfPropertiesForm(prefix="number_of_properties", instance=number_of_properties_data)
        if step_three_input_status(number_of_properties_data):
            user_data_scope.append("number_of_properties")
    else:
        number_of_properties_form = StepThreeNumberOfPropertiesForm(prefix="number_of_properties")
    #土地
    land_data = data[data_idx["land"]]
    if land_data.exists():
        land_form_set = formset_factory(
            form=StepThreeLandForm,
            extra=0,
            max_num=20
        )
        land_forms = land_form_set(
            initial=get_property_initial_data(land_data),
            prefix="land"
        )
        if step_three_input_status(land_data):
            user_data_scope.append("land")
    else:
        land_forms = land_form_set(prefix="land")
        
    #土地取得者
    land_acquirer_data = data[data_idx["land_acquirer"]]
    if land_acquirer_data.exists():
        land_acquirer_form_set = formset_factory(
            form=StepThreeLandAcquirerForm,
            extra=0,
            max_num=20
        )
        land_acquirer_forms = land_acquirer_form_set(
            initial=get_acquirer_initial_data(land_acquirer_data), 
            prefix="land_acquirer"
        )
        if step_three_input_status(land_acquirer_data):
            user_data_scope.append("land_acquirer")
    else:
        land_acquirer_forms = land_acquirer_form_set(prefix="land_acquirer")
        
    #土地金銭取得者
    land_cash_acquirer_data = data[data_idx["land_cash_acquirer"]]
    if land_cash_acquirer_data.exists():
        land_cash_acquirer_form_set = formset_factory(
            form=StepThreeLandCashAcquirerForm,
            extra=0,
            max_num=20
        )
        land_cash_acquirer_forms = land_cash_acquirer_form_set(
            initial=get_acquirer_initial_data(land_cash_acquirer_data),
            prefix="land_cash_acquirer"
        )
        if step_three_input_status(land_cash_acquirer_data):
            user_data_scope.append("land_cash_acquirer")
    else:
        land_cash_acquirer_forms = land_cash_acquirer_form_set(prefix="land_cash_acquirer")
    #建物
    house_data = data[data_idx["house"]]
    if house_data.exists():
        house_form_set = formset_factory(
            form=StepThreeHouseForm,
            extra=0,
            max_num=20
        )
        house_forms = house_form_set(
            initial=get_property_initial_data(house_data),
            prefix="house"
        )
        if step_three_input_status(house_data):
            user_data_scope.append("house")
    else:
        house_forms = house_form_set(prefix="house")
    #建物取得者
    house_acquirer_data = data[data_idx["house_acquirer"]]
    if house_acquirer_data.exists():
        house_acquirer_form_set = formset_factory(
            form=StepThreeHouseAcquirerForm,
            extra=0,
            max_num=20
        )
        house_acquirer_forms = house_acquirer_form_set(
            initial=get_acquirer_initial_data(house_acquirer_data),
            prefix="house_acquirer"
        )
        if step_three_input_status(house_acquirer_data):
            user_data_scope.append("house_acquirer")
    else:
        house_acquirer_forms = house_acquirer_form_set(prefix="house_acquirer")
      
    #建物金銭取得者
    house_cash_acquirer_data = data[data_idx["house_cash_acquirer"]]
    if house_cash_acquirer_data.exists():
        house_cash_acquirer_form_set = formset_factory(
            form=StepThreeHouseCashAcquirerForm, 
            extra=0,
            max_num=20
        )
        house_cash_acquirer_forms = house_cash_acquirer_form_set(
            initial=get_acquirer_initial_data(house_cash_acquirer_data),
            prefix="house_cash_acquirer"
        )
        if step_three_input_status(house_cash_acquirer_data):
            user_data_scope.append("house_cash_acquirer")
    else:
        house_cash_acquirer_forms = house_cash_acquirer_form_set(prefix="house_cash_acquirer")    
    #区分建物
    bldg_data = data[data_idx["bldg"]]
    if bldg_data.exists():
        bldg_form_set = formset_factory(
            form=StepThreeBldgForm,
            extra=0,
            max_num=20
        )
        bldg_forms = bldg_form_set(
            initial=get_property_initial_data(bldg_data), 
            prefix="bldg"
        )
        if step_three_input_status(bldg_data):
            user_data_scope.append("bldg")
    else:
        bldg_forms = bldg_form_set(prefix="bldg")
    #敷地権
    site_data = data[data_idx["site"]]
    if site_data.exists():
        site_form_set = formset_factory(
            form=StepThreeSiteForm,
            extra=0,
            max_num=20
        )
        site_forms = site_form_set(
            initial=get_property_initial_data(site_data),
            prefix="site"
        )
        if step_three_input_status(site_data):
            user_data_scope.append("site")
    else:
        site_forms = site_form_set(prefix="site")
    #区分建物取得者
    bldg_acquirer_data = data[data_idx["bldg_acquirer"]]
    if bldg_acquirer_data.exists():
        bldg_acquirer_form_set = formset_factory(
            form=StepThreeBldgAcquirerForm,
            extra=0,
            max_num=20
        )
        bldg_acquirer_forms = bldg_acquirer_form_set(
            initial=get_acquirer_initial_data(bldg_acquirer_data),
            prefix="bldg_acquirer"
        )
        if step_three_input_status(bldg_acquirer_data):
            user_data_scope.append("bldg_acquirer")
    else:
        bldg_acquirer_forms = bldg_acquirer_form_set(prefix="bldg_acquirer")
    #区分建物金銭取得者
    bldg_cash_acquirer_data = data[data_idx["bldg_cash_acquirer"]]
    if bldg_cash_acquirer_data.exists():
        bldg_cash_acquirer_form_set = formset_factory(
            form=StepThreeBldgCashAcquirerForm, 
            extra=0,
            max_num=20
        )
        bldg_cash_acquirer_forms = bldg_cash_acquirer_form_set(
            initial=get_acquirer_initial_data(bldg_cash_acquirer_data),
            prefix="bldg_cash_acquirer"
        )
        if step_three_input_status(bldg_cash_acquirer_data):
            user_data_scope.append("bldg_cash_acquirer")
    else:
        bldg_cash_acquirer_forms = bldg_cash_acquirer_form_set(prefix="bldg_cash_acquirer")
    #申請情報
    application_data = data[data_idx["application"]]
    if application_data:
        application_form = StepThreeApplicationForm(prefix="application", instance=application_data)
        if step_three_input_status(application_data):
            user_data_scope.append("application")
    else:
        application_form = StepThreeApplicationForm(prefix="application")

    context = {
        "title" : "３．データ入力",
        "progress": progress,
        "user" : user,
        "user_data_scope": user_data_scope,
        "decedent": decedent,
        "decedent_form": decedent_form,
        "decedent_form_internal_field_name": decedent_form_internal_field_name,
        "registry_name_and_address_forms": registry_name_and_address_forms,
        "spouse_form": spouse_form,
        "child_forms": child_forms,
        "child_spouse_forms": child_spouse_forms,
        "grand_child_forms": grand_child_forms,
        "ascendant_forms": ascendant_forms,
        "collateral_forms": collateral_forms,
        "type_of_division_form": type_of_division_form,
        "number_of_properties_form": number_of_properties_form,
        "land_forms": land_forms,
        "land_acquirer_forms": land_acquirer_forms,
        "land_cash_acquirer_forms": land_cash_acquirer_forms,
        "house_forms": house_forms,
        "house_acquirer_forms": house_acquirer_forms,
        "house_cash_acquirer_forms": house_cash_acquirer_forms,
        "bldg_forms": bldg_forms,
        "site_forms": site_forms,
        "bldg_acquirer_forms": bldg_acquirer_forms,
        "bldg_cash_acquirer_forms": bldg_cash_acquirer_forms,
        "application_form": application_form,
        "sections" : Sections.SECTIONS[Sections.STEP3],
        "service_content" : Sections.SERVICE_CONTENT,
    }
    return render(request, "toukiApp/step_three.html", context)

#ステップ4
#書類印刷
def step_four(request):
    if not request.user.is_authenticated:
        return redirect(to='/account/login/')
    
    user = User.objects.get(email = request.user)
    
    context = {
        "title" : "４．書類の印刷",
        "user" : user,
        "sections" : Sections.SECTIONS[Sections.STEP4],
        "service_content" : Sections.SERVICE_CONTENT,
    }
    return render(request, "toukiApp/step_four.html", context)

#ステップ5
#申請
def step_five(request):
    if not request.user.is_authenticated:
        return redirect(to='/account/login/')
    
    user = User.objects.get(email = request.user)
    
    context = {
        "title" : "５．法務局に郵送",
        "user" : user,
        "sections" : Sections.SECTIONS[Sections.STEP5],
        "service_content" : Sections.SERVICE_CONTENT,
    }
    return render(request, "toukiApp/step_five.html", context)

#ステップ6
#申請後について
def step_six(request):
    if not request.user.is_authenticated:
        return redirect(to='/account/login/')
    
    user = User.objects.get(email = request.user)
    
    context = {
        "title" : "申請後について",
        "user" : user,
        "sections" : Sections.SECTIONS[Sections.STEP6],
        "service_content" : Sections.SERVICE_CONTENT,
    }
    return render(request, "toukiApp/step_six.html", context)

#ユーザー情報
def step_option_select(request):
    if not request.user.is_authenticated:
        return redirect(to='/account/login/')
    
    user = request.user
    
    context = {
        "title": "ユーザー情報",
        "user": user,
    }

    return render(request, 'toukiApp/step_option_select.html', context)

#お問い合わせ
def step_inquiry(request):
    if not request.user.is_authenticated:
        return redirect(to='/account/login/')
    
    user = User.objects.get(email = request.user)
    
    context = {
        "title" : "お問い合わせ",
        "sections" : Sections.SECTIONS,
        "service_content" : Sections.SERVICE_CONTENT,
        "user" : user,
    }
    return render(request, "toukiApp/step_inquiry.html", context)

#お問い合わせ・運営者情報
def administrator(request):
    context = {
        "title" : "運営者情報・お問い合わせ",
        "CompanyData" : CompanyData,
    }
    return render(request, "toukiApp/administrator.html", context)

#特商法
def commerceLaw(request):
    context = {
        "title" : "特定商取引法に基づく表記",
        "CompanyData" : CompanyData,
    }
    return render(request, "toukiApp/commerce-law.html", context)

#プライバシーポリシー
def privacy(request):
    context = {
        "title" : "プライバシーポリシー",
        "CompanyData" : CompanyData,
    }
    return render(request, "toukiApp/privacy.html", context)

#利用規約
def terms(request):
    context = {
        "title" : "利用規約",
        "CompanyData" : CompanyData,
    }
    return render(request, "toukiApp/terms.html", context)

#利用条件確認
def condition(request):
    context = {
        "title" : "利用条件確認",
    }
    return render(request, "toukiApp/condition.html", context)

#不正な投稿があったとき
def csrf_failure(request, reason=""):

    # 何かしらの処理

    return HttpResponseForbidden('<h1>403 アクセスが制限されています。</h1>', content_type='text/html')

# ユーザーに紐づく被相続人の市区町村データを取得する
def get_decedent_city_data(request):
    user = User.objects.get(email = request.user)
    decedent = Decedent.objects.filter(user=user).first()
    
    if decedent:
        repsonse_data = {
            'city': decedent.city,
            'domicileCity': decedent.domicile_city
        }
    else:
        repsonse_data = {}
        
    return JsonResponse(repsonse_data)

# ユーザーに紐づく被相続人の登記上の住所の市区町村データリストを取得する
def get_registry_name_and_address_city_data(request):
    user = User.objects.get(email = request.user)
    decedent = Decedent.objects.filter(user=user).first()
    registry_name_and_address_datas = RegistryNameAndAddress.objects.filter(decedent=decedent)
    
    if registry_name_and_address_datas.exists():
        citys = [data.city for data in registry_name_and_address_datas]
    else:
        citys = []
    repsonse_data = {
        'citys': citys,
    }
    return JsonResponse(repsonse_data)

# ユーザーに紐づく相続人の住所の市区町村データリストを取得する
def get_heirs_city_data(request):
    try:
        user = User.objects.get(email = request.user)
        decedent = Decedent.objects.filter(user=user).first()
        spouse_datas = Spouse.objects.filter(Q(decedent=decedent) & Q(is_heir=True) & ~Q(city__isnull=True) & ~Q(city=""))
        is_ascendant = True
        datas = []
        if spouse_datas.exists():
            contentType = str(ContentType.objects.get_for_model(Spouse).id)
            for d in spouse_datas:
                datas.append([d.id, contentType, d.city])
                if d.object_id != decedent.id:
                    is_ascendant = False
                                
        descendant_datas = Descendant.objects.filter(Q(decedent=decedent) & Q(is_heir=True) & ~Q(city__isnull=True) & ~Q(city=""))
        if descendant_datas.exists():
            contentType = str(ContentType.objects.get_for_model(Descendant).id)
            is_ascendant = False
            for d in descendant_datas:
                datas.append([d.id, contentType, d.city])

        if is_ascendant:
            ascendant_datas = Ascendant.objects.filter(Q(decedent=decedent) & Q(is_heir=True) & ~Q(city__isnull=True) & ~Q(city=""))
            if ascendant_datas.exists():
                contentType = str(ContentType.objects.get_for_model(Ascendant).id)
                for d in ascendant_datas:
                    datas.append([d.id, contentType, d.city])
            else:
                collateral_datas = Collateral.objects.filter(Q(decedent=decedent) & Q(is_heir=True) & ~Q(city__isnull=True) & ~Q(city=""))
                if collateral_datas.exists():
                    contentType = str(ContentType.objects.get_for_model(Collateral).id)
                    for d in collateral_datas:
                        datas.append([d.id, contentType, d.city])
        
        repsonse_data = {
            'datas': datas,
        }
        return JsonResponse(repsonse_data)
    except (OperationalError, ConnectionError) as e:
        return JsonResponse({'error': 'ネットワークエラーが発生しました', 'details': str(e)}, status=500)
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'データがありません'}, status=404)
    except Exception as e:
        return JsonResponse({'error': 'エラーが発生しました', 'details': str(e)}, status=500)

# 選択された都道府県から市区町村データを取得する
def get_city(request):
    data = json.loads(request.body)
    prefecture = data["prefecture"]
        
    url = "https://www.land.mlit.go.jp/webland/api/CitySearch?area=" + prefecture
    r = requests.get(url)
    r = r.json()
    r = r['data']
    
    if r:
        context = {
            "city": r,
        }
    else:
        context = {
            "city" : "",
        }
        
    return JsonResponse(context)

# 入力された不動産番号から法務局データを取得する
def get_office(request):
    try:
        data = json.loads(request.body)
        officeCode = data["officeCode"]
        office_data = Office.objects.filter(code=officeCode).first()

        if office_data:
            office = office_data.office_name
        else:
            office = ""

        repsonse_data = {
            'office': office,
        }
        return JsonResponse(repsonse_data)
    except (OperationalError, ConnectionError) as e:
        return JsonResponse({'error': 'ネットワークエラーが発生しました', 'details': str(e)}, status=500)
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'データがありません'}, status=404)
    except Exception as e:
        return JsonResponse({'error': 'エラーが発生しました', 'details': str(e)}, status=500)

#djangoのメール形式チェック
def is_email(request):
    input_email = request.POST.get("email")
    
    try:
        validate_email(input_email)
    except ValidationError:
        context = {"message" : "メールアドレスの規格と一致しません",}
        return JsonResponse(context)

    context = {"message":"",}
    
    return JsonResponse(context)

def step_back(request):
    user = User.objects.get(email = request.user)
    decedent = Decedent.objects.filter(user=user).first()
    data = json.loads(request.body)
    progress = data.get('progress')
    print(progress)
    if progress is not None:
        decedent.progress = int(progress)
        decedent.save()
        return JsonResponse({'status': 'success'})
    else:
        return JsonResponse({'status': 'error'})

# 法務局データスクレイピング用（どこかのstep内に配置してデータを更新する）
# def import_offices(html_file_path):
#     with open(html_file_path, 'r', encoding='utf-8') as file:
#         soup = BeautifulSoup(file, 'html.parser')
        
#     for row in soup.find_all('tr'):
#         cols = row.find_all('td')
#         if cols and not cols[0].has_attr('class'):
#             code = cols[0].text.strip()
#             name = cols[1].text.strip()
#             try:
#                 with transaction.atomic():
#                     Office.objects.get_or_create(code=code, name=name, created_by=user, updated_by=user)
#             except Exception as e:
#                 # ログにエラーメッセージを記録します
#                 print(f"Error occurred: {e}")
# HTMLファイルのパスを指定して実行
# import_offices('toukiApp/登記所選択.html')