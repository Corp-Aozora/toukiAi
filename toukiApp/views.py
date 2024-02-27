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
from django.http import JsonResponse
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
from django.db import transaction
from smtplib import SMTPException
import socket
from django.views.decorators.csrf import csrf_exempt
from django.contrib.contenttypes.models import ContentType
from django.forms.models import model_to_dict
from operator import itemgetter
from django.db.models import Q
from googleapiclient.http import MediaFileUpload
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from googleapiclient.errors import HttpError
from pydrive2.auth import GoogleAuth
from pydrive2.drive import GoogleDrive
import gdown
from django.core.files.storage import default_storage
import os
from django.conf import settings
from urllib.parse import urlparse, parse_qs

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
                        TEL {company_phone_number}
                        営業時間 {company_opening_hours}
                        ホームページ {company_url}
                    ''').format(
                        subject=form.cleaned_data["subject"],
                        content=form.cleaned_data["content"],
                        company_name=CompanyData.NAME,
                        company_post_number=CompanyData.POST_NUMBER,
                        company_address=CompanyData.ADDRESS,
                        company_phone_number=CompanyData.PHONE_NUMBER,
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
    spouse.is_heir = forms[1].cleaned_data.get("is_live") and not forms[1].cleaned_data.get("is_refuse")
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
            child.is_heir = form.cleaned_data.get("is_live") and not form.cleaned_data.get("is_refuse")
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
            child_spouse.is_heir = form.cleaned_data.get("is_live") and not form.cleaned_data.get("is_refuse")
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
            grand_child.is_heir = form.cleaned_data.get("is_live") and not form.cleaned_data.get("is_refuse")
            grand_child.created_by = user
            grand_child.updated_by = user
            grand_child.save()
            
    # 尊属
    ascendant_dict = {}
    for idx, form in enumerate(form_sets[3]):
        
        if form.cleaned_data.get("name"):
            ascendant = form.save(commit=False)
            ascendant.decedent = decedent
            ascendant.is_heir = form.cleaned_data.get("is_live") and not form.cleaned_data.get("is_refuse")
            
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
            collateral.is_heir = form.cleaned_data.get("is_live") and not form.cleaned_data.get("is_refuse")
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
                
                gauth = GoogleAuth()
                # gauth.LocalWebserverAuth() #毎回認証画面を出さないようにコメントアウト
                drive = GoogleDrive(gauth)
                
                #不動産登記簿は常に全削除と全登録を行う
                if registry_files.exists():
                    for file in registry_files:
                        # Googleドライブからファイルを削除
                        file_id = extract_file_id_from_url(file.path)
                        file_drive = drive.CreateFile({'id': file_id})  # file.file_idはGoogleドライブ上のファイルID
                        file_drive.Delete()
                    registry_files.delete()
                    
                for i in range(len(request.FILES)):
                    pdf = request.FILES['pdf' + str(i)]
                    relative_path = default_storage.save(os.path.join('tmp/', pdf.name), pdf)
                    absolute_path = os.path.join(settings.MEDIA_ROOT, relative_path)
                    file_drive = drive.CreateFile({'title': pdf.name, 'parents': [{'id': '1iEOCvgmg8tzYyWMV_LFGvbVsJK8_wxRl'}]})
                    file_drive.SetContentFile(absolute_path)
                    file_drive.Upload()
                    # ファイルのアクセス権限を設定
                    file_drive.InsertPermission({
                        'type': 'anyone',
                        'value': 'anyone',
                        'role': 'reader'
                    })
                    # 新しいRegisterオブジェクトを作成し、属性に値を設定
                    register = Register(
                        decedent=decedent,
                        title=file_drive['title'],
                        path='https://drive.google.com/uc?export=download&id=' + file_drive['id'],  # Gドライブ上のファイルへのダウンロードリンク
                        file_size=os.path.getsize(absolute_path),
                        extension=os.path.splitext(file_drive['title'])[1][1:],  # 拡張子を取得
                        created_by=user,
                        updated_by=user
                    )
                    register.save()  # データベースに保存
                    

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
        gdown.download(file_name_and_file_path["path"], output, quiet=True)

        # ダウンロードしたファイルの名前とパスを配列に追加(ローカル起動用)
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

#ステップ３関連

#user_data_scopeへの追加処理（各情報の入力状況チェック）
def step_three_input_status(data):
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
    elif data.__class__ == Land:
        attr = [data.number, data.address, data.purparty, data.price, data.is_exchange]
        if all(attr):
            return True
    elif data.__class__ in [PropertyAcquirer, CashAcquirer]:
        attr = [data.content_type1, data.object_id1, data.content_object1, 
                data.content_type2, data.object_id2, data.content_object2,
                data.percentage]
        if all(attr):
            return True

    return False
    
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
    
    #登記簿上の氏名住所のフォームセット
    registry_name_and_address_form_set = formset_factory(form=StepThreeRegistryNameAndAddressForm, extra=1, max_num=10)
    child_form_set = formset_factory(form=StepThreeDescendantForm, extra=0, max_num=15)
    child_spouse_form_set = formset_factory(form=StepThreeSpouseForm, extra=0, max_num=15)
    grand_child_form_set = formset_factory(form=StepThreeDescendantForm, extra=0, max_num=15)
    ascendant_form_set = formset_factory(form=StepThreeAscendantForm, extra=0, max_num=15)
    collateral_form_set = formset_factory(form=StepThreeCollateralForm, extra=0, max_num=15)
    land_form_set = formset_factory(form=StepThreeLandForm, extra=1, max_num=20)
    land_acquirer_form_set = formset_factory(form=StepThreeLandAcquirerForm, extra=1, max_num=20)
    land_cash_acquirer_form_set = formset_factory(form=StepThreeLandCashAcquirerForm, extra=1, max_num=20)
    
    #フォームからデータがPOSTされたとき
    if request.method == "POST":
        pass
    
    #入力が完了している項目を取得するための配列
    user_data_scope = [] 
    progress = decedent.progress
    #被相続人のデータを初期値にセットしたフォーム
    decedent_form = StepThreeDecedentForm(prefix="decedent", instance=decedent)
    #htmlには表示しない内部データ
    decedent_form_internal_field_name = ["user", "progress"]
    
    #登記簿上の氏名住所のデータを取得してデータがあるとき
    registry_name_and_address_data = RegistryNameAndAddress.objects.filter(decedent=decedent)
    if registry_name_and_address_data.exists():
        #余分なフォームを消すためにextraを0に変更して、初期値を与える
        registry_name_and_address_form_set = formset_factory(form=StepThreeRegistryNameAndAddressForm, extra=0, max_num=10)
        registry_name_and_address_forms = registry_name_and_address_form_set(initial=[
            {
                "name": r.name,
                "prefecture": r.prefecture,
                "city": r.city,
                "address": r.address,
                "bldg": r.bldg,
            }
            for r in registry_name_and_address_data
        ], prefix="registry_name_and_address")
        
        #被相続人情報の入力状況チェック
        if step_three_input_status(decedent):
            user_data_scope.append("decedent")
        #登記簿上の氏名住所の入力状況チェック
        if step_three_input_status(registry_name_and_address_data):
            user_data_scope.append("registry_name_and_address")
    #ないとき    
    else:
        registry_name_and_address_forms = registry_name_and_address_form_set(prefix="registry_name_and_address")
    
    #配偶者データを取得して、データが存在するとき
    spouse_data = Spouse.objects.filter(object_id=decedent.id).first()
    if spouse_data:
        #配偶者用フォームに配偶者データを初期値としてセットする
        spouse_form = StepThreeSpouseForm(prefix="spouse", instance=spouse_data)
        #配偶者の入力状況チェック
        if step_three_input_status(spouse_data):
            user_data_scope.append("spouse")
    #ないとき
    else:
        spouse_form = StepThreeSpouseForm(prefix="spouse")
    
    #子データを取得して、データが存在するとき
    childs_data = Descendant.objects.filter(object_id1=decedent.id)
    if childs_data.exists():
        #余分なフォームを消すためにextraを0に変更して、初期値を与える
        child_forms = child_form_set(initial=[
            {
                "name": c.name,
                "death_year": c.death_year,
                "death_month": c.death_month,
                "death_date": c.death_date,
                "birth_year": c.birth_year,
                "birth_month": c.birth_month,
                "birth_date": c.birth_date,
                "is_acquire": c.is_acquire,
                "prefecture": c.prefecture,
                "city": c.city,
                "address": c.address,
                "bldg": c.bldg,
                "content_type1": c.content_type1,
                "object_id1": c.object_id1,
                "content_type2": c.content_type2,
                "object_id2": c.object_id2,
                "is_live": c.is_live,
                "is_heir": c.is_heir,
                "is_refuse": c.is_refuse,
                "is_exist": c.is_exist,
                "is_japan": c.is_japan,
                "is_adult": c.is_adult,
                "id_and_content_type": str(c.id) + "_" + str(ContentType.objects.get_for_model(c).id),
            }
            for c in childs_data
        ], prefix="child")
        #子の入力状況チェック
        if step_three_input_status(childs_data):
            user_data_scope.append("child")
    #ないとき    
    else:
        child_forms = child_form_set(prefix="child")
        
    #子の配偶者データを取得して、データが存在するとき
    child_ids = childs_data.values_list('id', flat=True)  # childs_dataの各要素が持つIDのリストを取得
    child_spouses_data = Spouse.objects.filter(object_id__in=child_ids)
    if child_spouses_data.exists():
        #余分なフォームを消すためにextraを0に変更して、初期値を与える
        child_spouse_forms = child_spouse_form_set(initial=[
            {
                "name": c.name,
                "death_year": c.death_year,
                "death_month": c.death_month,
                "death_date": c.death_date,
                "birth_year": c.birth_year,
                "birth_month": c.birth_month,
                "birth_date": c.birth_date,
                "is_acquire": c.is_acquire,
                "prefecture": c.prefecture,
                "city": c.city,
                "address": c.address,
                "bldg": c.bldg,
                "content_type": c.content_type,
                "object_id": c.object_id,
                "is_live": c.is_live,
                "is_heir": c.is_heir,
                "is_refuse": c.is_refuse,
                "is_exist": c.is_exist,
                "is_japan": c.is_japan,
                "id_and_content_type": str(c.id) + "_" + str(ContentType.objects.get_for_model(c).id),
            }
            for c in child_spouses_data
        ], prefix="child_spouse")
        #子の配偶者の入力状況チェック
        if step_three_input_status(child_spouses_data):
            user_data_scope.append("child_spouse")
    #ないとき    
    else:
        child_spouse_forms = child_spouse_form_set(prefix="child")
        
    #孫データを取得して、データが存在するとき
    grand_childs_data = Descendant.objects.filter(object_id1__in=child_ids)
    if grand_childs_data.exists():
        #余分なフォームを消すためにextraを0に変更して、初期値を与える
        grand_child_forms = grand_child_form_set(initial=[
            {
                "name": c.name,
                "death_year": c.death_year,
                "death_month": c.death_month,
                "death_date": c.death_date,
                "birth_year": c.birth_year,
                "birth_month": c.birth_month,
                "birth_date": c.birth_date,
                "is_acquire": c.is_acquire,
                "prefecture": c.prefecture,
                "city": c.city,
                "address": c.address,
                "bldg": c.bldg,
                "content_type1": c.content_type1,
                "object_id1": c.object_id1,
                "content_type2": c.content_type2,
                "object_id2": c.object_id2,
                "is_live": c.is_live,
                "is_heir": c.is_heir,
                "is_refuse": c.is_refuse,
                "is_exist": c.is_exist,
                "is_japan": c.is_japan,
                "is_adult": c.is_adult,
                "id_and_content_type": str(c.id) + "_" + str(ContentType.objects.get_for_model(c).id),
            }
            for c in grand_childs_data
        ], prefix="grand_child")
        #孫の入力状況チェック
        if step_three_input_status(grand_childs_data):
            user_data_scope.append("grand_child")
    #ないとき    
    else:
        grand_child_forms = grand_child_form_set(prefix="grand_child")
        
    #尊属データを取得して、データが存在するとき
    ascendants_data = Ascendant.objects.filter(decedent=decedent)
    if ascendants_data.exists():
        #余分なフォームを消すためにextraを0に変更して、初期値を与える
        ascendant_forms = ascendant_form_set(initial=[
            {
                "name": a.name,
                "death_year": a.death_year,
                "death_month": a.death_month,
                "death_date": a.death_date,
                "birth_year": a.birth_year,
                "birth_month": a.birth_month,
                "birth_date": a.birth_date,
                "is_acquire": a.is_acquire,
                "prefecture": a.prefecture,
                "city": a.city,
                "address": a.address,
                "bldg": a.bldg,
                "content_type": a.content_type1,
                "object_id": a.object_id1,
                "is_live": a.is_live,
                "is_heir": a.is_heir,
                "is_refuse": a.is_refuse,
                "is_exist": a.is_exist,
                "is_japan": a.is_japan,
                "id_and_content_type": str(a.id) + "_" + str(ContentType.objects.get_for_model(a).id),
            }
            for a in ascendants_data
        ], prefix="ascendant")
        #尊属の入力状況チェック
        if step_three_input_status(ascendants_data):
            user_data_scope.append("ascendant")
    #ないとき    
    else:
        ascendant_forms = ascendant_form_set(prefix="ascendant")
        
    #兄弟姉妹データを取得して、データが存在するとき
    collaterals_data = Collateral.objects.filter(decedent=decedent)
    if collaterals_data.exists():
        #余分なフォームを消すためにextraを0に変更して、初期値を与える
        collateral_forms = collateral_form_set(initial=[
            {
                "name": c.name,
                "death_year": c.death_year,
                "death_month": c.death_month,
                "death_date": c.death_date,
                "birth_year": c.birth_year,
                "birth_month": c.birth_month,
                "birth_date": c.birth_date,
                "is_acquire": c.is_acquire,
                "prefecture": c.prefecture,
                "city": c.city,
                "address": c.address,
                "bldg": c.bldg,
                "content_type1": c.content_type1,
                "object_id1": c.object_id1,
                "content_type2": c.content_type2,
                "object_id2": c.object_id2,
                "is_live": c.is_live,
                "is_heir": c.is_heir,
                "is_refuse": c.is_refuse,
                "is_exist": c.is_exist,
                "is_japan": c.is_japan,
                "is_adult": c.is_adult,
                "id_and_content_type": str(c.id) + "_" + str(ContentType.objects.get_for_model(c).id),
            }
            for c in collaterals_data
        ], prefix="collateral")
        #子の入力状況チェック
        if step_three_input_status(collaterals_data):
            user_data_scope.append("collateral")
    #ないとき    
    else:
        collateral_forms = collateral_form_set(prefix="collateral")
        
    #遺産分割方法のフォーム
    type_of_division = TypeOfDivision.objects.filter(decedent=decedent).first()
    if type_of_division:
        type_of_division_form = StepThreeTypeOfDivisionForm(prefix="type_of_division", instance=type_of_division)
        if (type_of_division.type_of_division and type_of_division.property_allocation and type_of_division.cash_allocation):
            if type_of_division.property_allocation == "一人のみ" and type_of_division.object_id1 != "":
                if type_of_division.cash_allocation == "一人のみ" and type_of_division.object_id2 != "":
                    user_data_scope.append("type_of_division")
    else:
        type_of_division_form = StepThreeTypeOfDivisionForm(prefix="type_of_division")
        
    #不動産の数フォーム
    number_of_properties = NumberOfProperties.objects.filter(decedent=decedent).first()
    if number_of_properties:
        number_of_properties_form = StepThreeNumberOfPropertiesForm(prefix="number_of_properties", instance=number_of_properties)
        if number_of_properties.land and number_of_properties.house and number_of_properties.bldg :
            user_data_scope.append("number_of_properties")
    else:
        number_of_properties_form = StepThreeNumberOfPropertiesForm(prefix="number_of_properties")

    #土地のフォーム
    lands_data = Land.objects.filter(decedent=decedent)
    if lands_data.exists():
        land_form_set = formset_factory(form=StepThreeLandForm, extra=0, max_num=20)
        land_forms = land_form_set(initial=[
            {
                "decedent": l.decedent,
                "register": l.register,
                "number": l.number,
                "address": l.address,
                "land_number": l.land_number,
                "type": l.type,
                "size": l.size,
                "purparty": l.purparty,
                "price": l.price,
                "is_exchange": l.is_exchange,
            }
            for l in lands_data
        ], prefix="land")
        #子の入力状況チェック
        if step_three_input_status(collaterals_data):
            user_data_scope.append("land")
    #ないとき    
    else:
        land_forms = land_form_set(prefix="land")
        
    #土地取得者のフォーム
    land_content_type = ContentType.objects.get_for_model(Land)
    land_acquirer_data = PropertyAcquirer.objects.filter(decedent=decedent, content_type1=land_content_type)
    if land_acquirer_data.exists():
        land_acquirer_form_set = formset_factory(form=StepThreeLandAcquirerForm, extra=0, max_num=20)
        land_acquirer_forms = land_acquirer_form_set(initial=[
            {
                "decedent": l.decedent,
                "content_type1": l.content_type1,
                "object_id1": l.object_id1,
                "content_object1": l.content_object1,
                "content_type2": l.content_type2,
                "object_id2": l.object_id2,
                "content_object2": l.content_object2,
                "percentage": l.percentage,
            }
            for l in land_acquirer_data
        ], prefix="land_acquirer")
        #子の入力状況チェック
        if step_three_input_status(land_acquirer_data):
            user_data_scope.append("land_acquirer")
    #ないとき    
    else:
        land_acquirer_forms = land_acquirer_form_set(prefix="land_acquirer")
        
    #土地金銭取得者のフォーム
    land_cash_acquirer_data = CashAcquirer.objects.filter(decedent=decedent, content_type1=land_content_type)
    if land_cash_acquirer_data.exists():
        land_cash_acquirer_form_set = formset_factory(form=StepThreeLandCashAcquirerForm, extra=0, max_num=20)
        land_cash_acquirer_forms = land_cash_acquirer_form_set(initial=[
            {
                "decedent": l.decedent,
                "content_type1": l.content_type1,
                "object_id1": l.object_id1,
                "content_object1": l.content_object1,
                "content_type2": l.content_type2,
                "object_id2": l.object_id2,
                "content_object2": l.content_object2,
                "percentage": l.percentage,
            }
            for l in land_cash_acquirer_data
        ], prefix="land_cash_acquirer")
        #子の入力状況チェック
        if step_three_input_status(land_cash_acquirer_data):
            user_data_scope.append("land_cash_acquirer")
    #ないとき    
    else:
        land_cash_acquirer_forms = land_cash_acquirer_form_set(prefix="land_cash_acquirer")
        
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
    if progress is not None:
        decedent.progress = int(progress)
        decedent.save()
        return JsonResponse({'status': 'success'})
    else:
        return JsonResponse({'status': 'error'})

