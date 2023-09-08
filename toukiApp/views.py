from django.shortcuts import render, redirect
from .prefectures import PREFECTURES
from .landCategorys import LANDCATEGORYS
from .customDate import *
from .sections import *
from .company_data import *
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

# Create your views here.
def index(request):
    update_articles = UpdateArticle.objects.order_by("-updated_by")[:2]
    context = {
        "title" : "トップページ",
        "update_articles": update_articles,
    }
    return render(request, "toukiApp/index.html", context)

@login_required
def step_one(request):
    user = User.objects.get(email = request.user)
    
    if request.method == "POST":
        pass
        decendant_form = StepOneDecendantForm(request.POST)
        # relation_form = StepOneRelationForm(request.POST)

        # トランザクションが必要
        # 被相続人情報の保存
        if decendant_form.is_valid():
            decendant_form.save()
            
        # 親族情報の保存
            return redirect(to='/toukiapp/service-stepTwo')
    else:
        pass
        decendant_form = StepOneDecendantForm()
        # relation_form = StepOneRelationForm()
    
    prefectures = []
    for p in PREFECTURES:
        prefectures.append(p[1])
    
    context = {
        "title" : "１．" + Sections.STEP1,
        "prefectures" : prefectures,
        "user" : user,
        "decendant_form": decendant_form,
        "sections" : Sections.SECTIONS[Sections.STEP1],
        "service_content" : Sections.SERVICE_CONTENT,
    }
    return render(request, "toukiApp/step_one.html", context)

#ユーザー情報
@login_required
def step_user(request):
    user = request.user
    
    context = {
        "title": "ユーザー情報",
        "user": user,
    }

    return render(request, 'toukiApp/step_user.html', context)

#お問い合わせ
@login_required
def step_inquiry(request):
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
