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
                        company_sub_name=CompanyData.SUB_NAME,                        
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
        "is_inquiry": is_inquiry,
    }
    
    return render(request, "toukiApp/index.html", context)

# ステップ１のデータ登録処理
def save_step_one_datas(user, forms, form_sets):
    # すべてのデータを削除する
    
    decedent = forms[0].save(commit=False)
    Decedent.objects.filter(user=user).delete()
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
        print("00000")
        if form.cleaned_data.get("name"):
            ascendant = form.save(commit=False)
            ascendant.decedent = decedent
            ascendant.is_heir = form.cleaned_data.get("is_live") and not form.cleaned_data.get("is_refuse")
            print("11111")
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
            print("22222")
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
    
    if user.decedent.first():
        decedent = user.decedent.first()
        decedent_form = StepOneDecedentForm(prefix="decedent", instance=decedent)
        userDataScope.append("decedent")
        
        spouse_form = StepOneSpouseForm(prefix="spouse")
        spouse = Spouse.objects.filter(decedent=decedent).first()
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
        
    spouse_form_internal_field_name = ["decedent", "content_type", "object_id", "is_heir"]
    common_form_internal_field_name = ["decedent"]
    child_form_internal_field_name = ["decedent", "content_type1", "object_id1", "content_type2", "object_id2", "is_heir"]
    ascendant_form_internal_field_name = ["decedent", "content_type", "object_id", "is_heir"]
    ascendants_relation = ["父", "母", "父方の祖父", "父方の祖母", "母方の祖父", "母方の祖母"]
    collateral_form_internal_field_name = ["decedent", "content_type1", "object_id1", "content_type2", "object_id2", "is_heir"]
    
    context = {
        "title" : "１．" + Sections.STEP1,
        "user" : user,
        "decedent_form": decedent_form,
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

#ステップ２
#必要書類リスト
def step_two(request):
    if not request.user.is_authenticated:
        return redirect(to='/account/login/')
    
    user = User.objects.get(email = request.user)
  
    context = {
        "title" : "２．必要書類一覧",
        "user" : user,
        "sections" : Sections.SECTIONS[Sections.STEP2],
        "service_content" : Sections.SERVICE_CONTENT,
    }
    return render(request, "toukiApp/step_two.html", context)

#ステップ３
#申請データ入力
def step_three(request):
    if not request.user.is_authenticated:
        return redirect(to='/account/login/')
    
    user = User.objects.get(email = request.user)
    
    prefectures = []
    for p in PREFECTURES:
        prefectures.append(p[1])
        
    landCategorys = []
    for l in LANDCATEGORYS:
        landCategorys.append(l[1])
    
    context = {
        "title" : "３．データ入力",
        "prefectures" : prefectures,
        "landCategorys" : landCategorys,
        "user" : user,
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

# ユーザーに紐づくstep1の被相続人の市区町村データを取得する
def get_user_city_data(request):
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