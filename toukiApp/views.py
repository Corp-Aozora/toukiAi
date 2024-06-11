from bs4 import BeautifulSoup
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP
from django import forms
from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.storage import default_storage
from django.core.validators import validate_email
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ObjectDoesNotExist, MultipleObjectsReturned
from django.core.mail import BadHeaderError, EmailMessage
from django.db import transaction, DatabaseError, OperationalError, IntegrityError, DataError
from django.db.models import Q, F
from django.forms import formset_factory
from django.forms.models import model_to_dict
from django.http import HttpResponseForbidden, HttpResponse,  JsonResponse, HttpResponseRedirect, HttpResponseServerError
from django.shortcuts import render, redirect, get_object_or_404
# from django.template.loader import render_to_string
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from fractions import Fraction
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from pydrive2.auth import GoogleAuth
from pydrive2.drive import GoogleDrive
from requests.exceptions import HTTPError, ConnectionError, Timeout
from smtplib import SMTPException
from time import sleep
from typing import List, Dict, Set, Tuple, Any
from urllib.parse import urlparse, parse_qs
# from weasyprint import HTML

import copy
import gdown
import googleapiclient.errors 
import itertools
import json
import mojimoji
import os
import requests
import socket
import textwrap
import unicodedata

from accounts.models import User
from .company_data import *
from .customDate import *
from .external_info import ExternalLinks
from .forms import *
from .get_data_for_application_form import *
from .landCategorys import LANDCATEGORYS
from .models import *
from .prefectures_and_city import *
from .sections import *
from .toukiAi_commons import *
from common.utils import *
from common.const import session_key

class ToukiAppUrlName:
    """toukiAppで使用するurlのname"""
    root = "toukiApp:"
    
    step_one = f"{root}step_one"
    step_two = f"{root}step_two"
    step_three = f"{root}step_three"
    step_four = f"{root}step_four"
    step_five = f"{root}step_five"
    step_six = f"{root}step_six"
    step_inquiry = f"{root}step_inquiry"

def index(request):
    """トップページの処理"""
    
    function_name = get_current_function_name()
    this_url_name = "toukiApp:index"
    this_html = "toukiApp/index.html"
    tab_title = "相続登記を自分で行いたい方のためのシステム"
    meta_description = "相続登記を自分で行い費用を節約したい方のためのシステムです。システムの案内に従って手続を進めるだけで相続登記が完了します。詳細な解説と迅速なお問い合わせ対応もありますので、悩みなくスムーズに手続を進めることができます。必要に応じてオプション（有料）もご利用いただけます。"
    
    try:
        canonical_url = get_canonical_url(request, this_url_name)

        # お問い合わせが成功したメッセージを表示するためのセッション（messagesのsuccessはログアウトメッセージと重複するため）
        is_inquiry = get_boolean_session(request.session, "post_success")
        is_account_delete = get_boolean_session(request.session, "account_delete")
        
        # お問い合わせがあったとき
        if request.method == "POST":
            
            form = OpenInquiryForm(request.POST)
            if form.is_valid():
                with transaction.atomic():
                    try:
                        form.save()
                        send_auto_email_to_inquiry(form.cleaned_data, form.cleaned_data["created_by"], False)
                        request.session["post_success"] = True
                        
                        return redirect(this_url_name)
                    except Exception as e:
                        basic_log(function_name, e, None, "POST(お問い合わせの送信)でエラー")
                        raise e
            else:
                basic_log(function_name, None, None, f"{form.errors}")
                messages.warning(request, "入力に不備があるため受付できませんでした。")
        else:
            form = OpenInquiryForm()
        
        # 更新情報（表示は最新２つまで）
        update_articles = UpdateArticle.objects.order_by("-updated_at")[:2]
        print()
        context = {
            "title" : tab_title,
            "update_articles": update_articles,
            "form": form,
            "field_names": list(form.fields.keys()),
            "company_data": CompanyData,
            "company_service": Service,
            "is_inquiry": is_inquiry,
            "is_account_delete": is_account_delete,
            "canonical_url": canonical_url,
            "meta_description": meta_description
        }
        return render(request, this_html, context)
    except Exception as e:
        return handle_error(
            e, 
            request,
            None, 
            function_name, 
            this_url_name,
        )

"""

    ステップ１関連

"""
def create_formset(form, extra, max_num):
    """フォームセットを生成する"""
    return formset_factory(form=form, extra=extra, max_num=max_num)

def create_formsets_by_configuration(configuration):
    """
    
        configurationに基づいてフォームセットを生成する
        
        configuration は [(form_class, extra, max_num), ...] の形式
    """
    return [create_formset(form, extra, max_num) for form, extra, max_num in configuration]

def create_forms_by_configuration(configuration, request):
    """
    
        単一のフォームを一括で生成する
        
        configuration は [(form_class, prefix), ...] の形式
    
    """
    return [form_class(request.POST or None, prefix=prefix) for form_class, prefix in configuration]

def is_form_in_formset(formset):
    """フォームセット内の各フォームにデータがあるかどうかをチェックする
    
        フォームセット内の少なくとも一つのフォームに初期値から変更があるデータがあればTrue、そうでなければFalse
    """
    for form in formset:
        if form.has_changed():
            return True
    return False

def check_is_heir(form):
    """法定相続人判定"""
    return bool(form.cleaned_data.get("is_live") and form.cleaned_data.get("is_refuse") ==  False)

def save_step_one_datas(user, forms, form_sets, is_trial):
    """ステップ１のデータ登録処理

    常に被相続人のデータ削除と新規登録
    
    他のデータは全て被相続人と紐づいてるため全データが削除される
    
    Args:
        user (User): requestしたユーザー
        forms (_type_): _description_
        form_sets (_type_): _description_
        is_trial (boolean): 無料アカウント用ページか判別フラグ
    """            
    
    @staticmethod
    def format_error_log(relation, is_trial, instance, message=None):
        """エラーログのテンプレ"""
        return f"ステップ１の{relation}のデータ登録時にエラー\nis_trial={is_trial}\ninstance={instance}" + (f"\n{message}" if message else "")
        

    def save_decedent(form, user, is_trial):
        """被相続人のデータ登録
        
            無料アカウントのときはprogressを0.5、有料の場合は次のステップへ遷移できるよう2にする
        """
        try:
            instance = form.save(commit=False)
            instance.progress = 0.5 if is_trial else 2
            instance.user = user
            instance.created_by = user
            instance.updated_by = user
            instance.save()
            
            return instance
        except Exception as e:
            basic_log(get_current_function_name(), e, user, format_error_log("被相続人", is_trial, instance))
            raise e

    def save_decedent_spouse(form, user, is_trial, decedent_content_type):
        """被相続人の配偶者のデータ登録"""
        try:
            instance = form.save(commit=False)
            add_required_for_data(instance, user, decedent)
            instance.content_type = decedent_content_type
            instance.object_id = decedent.id          
            instance.is_heir = check_is_heir(form)
            instance.save()
            
            return instance
        except Exception as e:
            basic_log(get_current_function_name(), e, user, format_error_log("被相続人の配偶者", is_trial, instance))
            raise e

    def save_common(form, user, decedent):
        """子供全員または兄弟姉妹全員のデータ登録"""
        form_class_name = type(form).__name__
        relation = "子供全員" if form_class_name == 'StepOneDescendantCommonForm' else "兄弟姉妹全員"
            
        try:
            instance = form.save(commit=False)
            add_required_for_data(instance, user, decedent)
            instance.save()
        except Exception as e:
            basic_log(get_current_function_name(), e, user, format_error_log(relation, is_trial, instance))
            raise e

    def save_child(formset, user, decedent, decedemt_ct, spouse, spouse_ct):
        """子のデータ登録
        
            return {子のindex: 子のインスタンス}
        """
        index_with_instance = {}
        
        for form in formset:
            try:
                if not form.has_changed():
                    continue
                
                instance = form.save(commit=False)
                add_required_for_data(instance, user, decedent)
                instance.content_type1 = decedemt_ct
                instance.object_id1 = decedent.id
                
                if(form.cleaned_data.get("target2") != ""):
                    instance.content_type2 = spouse_ct
                    instance.object_id2 = spouse.id
                    
                instance.is_heir = check_is_heir(form)
                instance.save()
                
                index_with_instance[form.cleaned_data.get("index")] = instance
            except Exception as e:
                basic_log(get_current_function_name(), e, user, format_error_log("子", is_trial, instance))
                raise e
            
        return index_with_instance
    
    def save_child_spouse(formset, user, decedent, child_dict, descendant_ct):
        """子の配偶者のデータ登録
        
            return {子の配偶者のindex: 子の配偶者のインスタンス}
        """
        function_name = get_current_function_name()
        index_with_instance = {}
        
        for form in formset:
            try:
                if not form.has_changed():
                    continue
                
                instance = form.save(commit=False)
                add_required_for_data(instance, user, decedent)
                
                target = form.cleaned_data.get("target")
                if target in child_dict:
                    instance.content_type = descendant_ct
                    instance.object_id = child_dict[target].id
                else:
                    log = f"{function_name}でエラー発生\n子と紐づいてない子の配偶者です\ntarget={target}\nchild_dict={child_dict}"
                    basic_log(function_name, None, user, log)
                    raise ValidationError(log)
                    
                instance.is_heir = check_is_heir(form)
                instance.save()
                index_with_instance[form.cleaned_data.get("index")] = instance
                
            except Exception as e:
                basic_log(function_name, e, user, format_error_log("子の配偶者", is_trial, instance))
                raise e
            
        return index_with_instance

    def save_grand_child(formset, user, decedent, child_dict, descendant_ct, child_spouse_dict, spouse_ct):
        """孫のデータ登録"""
        function_name = get_current_function_name()
        
        for form in formset:
            try:
                if not form.has_changed():
                    continue
                
                instance = form.save(commit=False)
                add_required_for_data(instance, user, decedent)
                
                target1 = form.cleaned_data.get("target1")
                if target1 in child_dict:
                    instance.content_type1 = descendant_ct
                    instance.object_id1 = child_dict[target1].id
                else:
                    log = f"{function_name}でエラー発生\n子と紐づいてない孫です\ntarget1={target1}\nchild_dict={child_dict}"
                    basic_log(function_name, None, user, log)
                    raise ValidationError(log)

                target2 = form.cleaned_data.get("target2")
                if target2 in child_spouse_dict:
                    instance.content_type2 = spouse_ct
                    instance.object_id2 = child_spouse_dict[target2].id
                    
                instance.is_heir = check_is_heir(form)
                instance.save()
            except Exception as e:
                basic_log(get_current_function_name(), e, user, format_error_log("孫", is_trial, instance))
                raise e    
    
    def save_ascendant(formset, user, decedent, decedent_ct, ascendant_ct):
        """尊属のデータ登録
        
            return {子の配偶者のindex: 子の配偶者のインスタンス}
        """
        function_name = get_current_function_name()
        index_with_instance = {}
        
        for idx, form in enumerate(formset):
            try:
                if not form.has_changed():
                    continue
                
                instance = form.save(commit=False)
                add_required_for_data(instance, user, decedent)
                instance.is_heir = check_is_heir(form)
                
                # 父母のフォームのとき
                if idx < 2:
                    instance.content_type = decedent_ct
                    instance.object_id = decedent.id
                else:
                    # 祖父母のフォームのとき
                    target = form.cleaned_data.get("target")
                    if target in index_with_instance:
                        instance.content_type = ascendant_ct
                        instance.object_id = index_with_instance[target].id
                    else:
                        log = f"{function_name}でエラー\n祖父母のtargetに一致する父母のindexありません\ntarget={target}\nindex_with_instance={index_with_instance}"
                        basic_log(function_name, None, user, log)
                        raise ValidationError(log)
                        
                instance.save()
                index_with_instance[form.cleaned_data.get("index")] = instance    
            except Exception as e:
                basic_log(function_name, e, user, format_error_log("尊属", is_trial, instance))
                raise e    
            
        return index_with_instance
    
    def save_collateral(formset, user, decedent, ascendant_dict, ascendant_ct):
        """兄弟姉妹のデータ登録"""
        function_name = get_current_function_name()
        
        for form in formset:
            try:
                if not form.has_changed():
                    continue
                
                instance = form.save(commit=False)
                target1 = form.cleaned_data.get("target1")
                target2 = form.cleaned_data.get("target2")
                if target1 == "" and target2 == "":
                    index = form.cleaned_data.get("index")
                    log = f"{function_name}でエラー発生\n\
                        兄弟姉妹のtargetが父母の両方のindexに一致しません\n\
                        index={index}\n\
                        target1={target1}\n\
                        target2={target2}\n\
                        ascendant_dict={ascendant_dict}"
                    basic_log(function_name, None, user, log)
                    raise ValidationError(log)
                
                add_required_for_data(instance, user, decedent)
                
                if target1 != "":
                    instance.content_type1 = ascendant_ct
                    instance.object_id1 = ascendant_dict[target1].id
                    
                if target2 != "":
                    instance.content_type2 = ascendant_ct
                    instance.object_id2 = ascendant_dict[target2].id
                    
                instance.is_heir = check_is_heir(form)
                instance.save()
            except Exception as e:
                basic_log(function_name, e, user, format_error_log("兄弟姉妹", is_trial, instance))
                raise e    
            
    # 被相続人関連のデータを全削除してから被相続人データを登録
    Decedent.objects.filter(user=user).delete() 
    decedent = save_decedent(forms[0], user, is_trial)
    
    # 配偶者
    decedent_content_type = ContentType.objects.get_for_model(Decedent)
    spouse = save_decedent_spouse(forms[1], user, is_trial, decedent_content_type)
    
    # 子共通
    save_common(forms[2], user, decedent)
    
    # 子
    if is_form_in_formset(form_sets[0]):
        child_dict = {}
        spouse_content_type = ContentType.objects.get_for_model(Spouse)
        child_dict = save_child(form_sets[0], user, decedent, decedent_content_type, spouse, spouse_content_type)
        
        # 子の配偶者
        child_spouse_dict = {}
        descendant_content_type = ContentType.objects.get_for_model(Descendant)
        if is_form_in_formset(form_sets[1]):
            child_spouse_dict = save_child_spouse(form_sets[1], user, decedent, child_dict, descendant_content_type)

        # 孫
        grand_child_fs = form_sets[2]
        if is_form_in_formset(grand_child_fs):
            save_grand_child(grand_child_fs, user, decedent, child_dict, descendant_content_type, child_spouse_dict, spouse_content_type)
            
    # 尊属
    ascendant_fs = form_sets[3]
    if(is_form_in_formset(ascendant_fs)):
        ascendant_content_type = ContentType.objects.get_for_model(Ascendant)
        ascendant_dict = save_ascendant(ascendant_fs, user, decedent, decedent_content_type, ascendant_content_type)
                
        # 兄弟姉妹共通
        collateral_common_f = forms[3]
        if collateral_common_f.cleaned_data.get("is_exist") is not None:
            save_common(collateral_common_f, user, decedent)
            
            # 兄弟姉妹
            save_collateral(form_sets[4], user, decedent, ascendant_dict, ascendant_content_type)

def get_step_one_childs_data(decedent, querysets, form_fields):
    """各子のデータをステップ１用に整形してリストにして返す"""
    return [
        {
            **{'id': q.id},
            **{'count': Descendant.objects.filter(object_id1=q.id).count()}, # 対象の子の子の数
            **{'is_spouse': Spouse.objects.filter(decedent=decedent, object_id=q.id).count()}, # 子の配偶者の数
            **{x: model_to_dict(q).get(x) for x in form_fields if x in model_to_dict(q)}
        }for q in querysets
    ]
    
def get_step_one_child_heirs_data(querysets, form_fields):
    """子の配偶者または子の子のデータをステップ１用に整形してリストにして返す"""
    return [
        {
            **{"child_id": getattr(q, 'object_id', getattr(q, 'object_id1', None))},
            **{f: model_to_dict(q).get(f) for f in form_fields if f in model_to_dict(q)}
        }for q in querysets
    ] if querysets.exists() else []

def get_step_one_ascendant_or_collateral_data(querysets, form_fields):
    """尊属または傍系のデータをステップ１用に整形して返す"""
    return [
        {
            **{'id': q.id},
            **{f: model_to_dict(q).get(f) for f in form_fields if f in model_to_dict(q)}
        }
        for q in querysets
    ]

def validate_and_log(item, prefix, function_name, user):
    """フォームの検証とログ出力"""
    is_valid = item.is_valid()

    if not is_valid:
        error_detail = f"{prefix}の欄でエラー\n 対象の入力欄: {item.errors}"
        basic_log(function_name, None, user, error_detail)
        
    return is_valid


def step_one_trial(request):
    """ステップ1(公開用)
    
        POSTに成功してもステップ2には遷移せずに法定相続人を表示するだけにする
        
        データはsessionに登録する
        
        利用条件の確認も兼ねている
    """
    # リクエストはGETとPOSTのみ
    if not is_valid_request_method(request, ["GET", "POST"], True):
        return redirect("toukiApp:index")
    
    FORMSETS_CONFIGURATION = [
        (StepOneDescendantForm, 1, 15), # 子
        (StepOneSpouseForm, 1, 15), # 子の配偶者
        (StepOneDescendantForm, 1, 15), # 孫
        (StepOneAscendantForm, 6, 6),
        (StepOneCollateralForm, 1, 15),
    ]
    
    FORMSETS_IDXS = {
        "child": 0,
        "child_spouse": 1,
        "grand_child": 2,
        "ascendant": 3,
        "collateral": 4
    }
    
    FORMS_CONFIGURATION = [
        (StepOneDecedentForm, "decedent"),
        (StepOneSpouseForm, "spouse"),
        (StepOneDescendantCommonForm, "child_common"),
        (StepOneCollateralCommonForm, "collateral_common"),
    ]

    FORMS_IDXS = {
        "decedent": 0,
        "spouse": 1,
        "child_common": 2,
        "collateral_common": 3
    }
    
    function_name = get_current_function_name()
    this_url_name = "toukiApp:step_one_trial"
    html = "toukiApp/step_one_trial.html"
    request_user = request.user
    
    session_id = get_or_create_session_id(request)
    session_key_form = session_key.Step1.Form
    session_key_form_set = session_key.Step1.Formset
    
    userDataScope = []
    spouse_data = {}
    childs_data = []
    child_heirs_data = []
    ascendant_data = []
    collateral_data = []
    progress = 0 # トライアルは常に0
    persons_data = []
    
    def ini_formsets(form_sets, request):
        """フォームセットを初期化して返す"""
        child = form_sets[FORMSETS_IDXS["child"]](request.POST or None, prefix="child")
        child_spouse = form_sets[FORMSETS_IDXS["child_spouse"]](request.POST or None, prefix="child_spouse")
        grand_child = form_sets[FORMSETS_IDXS["grand_child"]](request.POST or None, prefix="grand_child") 
        ascendant = form_sets[FORMSETS_IDXS["ascendant"]](request.POST or None, prefix="ascendant")
        collateral = form_sets[FORMSETS_IDXS["collateral"]](request.POST or None, prefix="collateral")
        
        return [child, child_spouse, grand_child, ascendant, collateral]
    
    def save_to_session(forms, form_sets):
        """セッションにフォームデータを保存する"""
        
        def save_form(session_key, form):
            """フォームを保存"""
            try:
                if session_key == session_key_form.DECEDENT_SPOUSE:
                    form.cleaned_data["is_heir"] = check_is_heir(form)
                    
                request.session[session_key] = form.cleaned_data
            except Exception as e:
                basic_log(get_current_function_name(), e, None, f"session_key={session_key}, form.cleaned_data={form.cleaned_data}", False)
                raise
        
        def save_formset(session_key, form_set):
            """フォームセットを保存"""
            try:
                if not is_form_in_formset(form_set):
                    return False
                
                for f in form_set:
                    f.cleaned_data["is_heir"] = check_is_heir(f)
                
                request.session[session_key] = [f.cleaned_data for f in form_set]
                
                return True
            except Exception as e:
                basic_log(get_current_function_name(), e, None, f"session_key={session_key}, form_set_cleaned_data={[f.cleaned_data for f in form_set]}", False)
                raise

        def process_save(key_and_data):
            """保存処理"""
            for key, data in key_and_data:
                if key in session_key_form.LIST:
                    save_form(key, data)
                else:
                    if key in [session_key_form_set.CHILD, session_key_form_set.ASCENDANT]:
                        if not save_formset(key, data):
                            break
                    else:
                        save_formset(key, data)
                
        key_and_data_group = [
            [
                (session_key_form.DECEDENT, forms[FORMS_IDXS["decedent"]]),
                (session_key_form.DECEDENT_SPOUSE, forms[FORMS_IDXS["spouse"]]),
                (session_key_form.CHILD_COMMON, forms[FORMS_IDXS["child_common"]])
            ],
            [
                (session_key_form_set.CHILD, form_sets[FORMSETS_IDXS["child"]]),
                (session_key_form_set.CHILD_SPOUSE, form_sets[FORMSETS_IDXS["child_spouse"]]),
                (session_key_form_set.GRAND_CHILD, form_sets[FORMSETS_IDXS["grand_child"]])
            ],
            [
                (session_key_form_set.ASCENDANT, form_sets[FORMSETS_IDXS["ascendant"]]),
                (session_key_form.COLLATERAL_COMMON, forms[FORMS_IDXS["collateral_common"]]),
                (session_key_form_set.COLLATERAL, form_sets[FORMSETS_IDXS["collateral"]])
            ]
        ]
        for x in key_and_data_group:
            process_save(x)
    
    def add_person_data(arr, data):
        """配列に各関係者のデータを追加する"""
        if not data.get("name"):
            return
        
        is_deceased = data.get("is_live") == False and data.get("is_refuse") == False
        
        arr.append({
            "name": data.get("name"),
            "is_heir": data.get("is_heir"),
            "is_deceased": is_deceased,
            "is_refuse": data.get("is_refuse"),
            "is_adult": data.get("is_adult"),
            "is_japan": data.get("is_japan"),
        })
    
    def check_session_data(session_key, relation):
        """セッションデータの有無をチェックする"""
        data = request.session.get(session_key)
        if data:
            userDataScope.append(relation)
            
            return True, data
        
        return False, None
    
    def ini_decedent_or_common_form(session_key):
        """被相続人、子共通、兄弟姉妹共通の復元"""
        if session_key == session_key_form.DECEDENT:
            relation = "decedent"
            form_class = StepOneDecedentForm
        elif session_key == session_key_form.CHILD_COMMON:
            relation = "child_common"
            form_class = StepOneDescendantCommonForm
        elif session_key == session_key_form.COLLATERAL_COMMON:
            relation = "collateral_common"
            form_class = StepOneCollateralCommonForm
        else:
            msg = f"引数の値が不適切です。\n\
                session_keyは{session_key_form.DECEDENT}, {session_key_form.CHILD_COMMON}, {session_key_form.COLLATERAL_COMMON}のいずれかにしてください。\n\
                session_key={session_key}"
            basic_log(get_current_function_name(), None, request_user, msg)
            
            raise ValueError(msg)
        
        result, data = check_session_data(session_key, relation)
        form = form_class(prefix=relation, initial=data) if result else form_class(prefix=relation)
            
        return result, form
    
    def get_decedent_spouse_data():
        """被相続人の配偶者のデータを取得する"""
        result, data = check_session_data(session_key_form.DECEDENT_SPOUSE, "spouse")
        if result:
            add_person_data(persons_data, data)
            
        return data
    
    def get_childs_data():
        """子のデータを取得する"""
        result, data = check_session_data(session_key_form_set.CHILD, "child")
        if result:
            for x in data:
                x["id"] = x.get("index")
                x["count"] = x.get("child_count")
                x["is_spouse"] = x.get("is_spouse")
                
                add_person_data(persons_data, x)
        
        return data
    
    def get_child_heirs_data():
        """子の相続人のデータを取得する"""
        
        def get_data(session_key):
            data = request.session.get(session_key)
            if data:
                for x in data:
                    x["child_id"] = x.get("target") if session_key == session_key_form_set.CHILD_SPOUSE else x.get("target1")
            
            return data
                    
        child_spouses_data = get_data(session_key_form_set.CHILD_SPOUSE)
        grand_childs_data = get_data(session_key_form_set.GRAND_CHILD)
        child_heirs_data = None
        
        if child_spouses_data or grand_childs_data:
            userDataScope.append("child_heirs")
            
            child_heirs_data = child_spouses_data + grand_childs_data
            child_heirs_data.sort(key=lambda x: (x['child_id'], not (x in child_spouses_data)))
            
            for x in child_heirs_data:
                add_person_data(persons_data, x)
                
        return child_heirs_data
    
    def get_ascendant_or_collateral_data(session_key):
        """尊属のデータを取得する"""
        if session_key == session_key_form_set.ASCENDANT:
            relation = "ascendant"
        elif session_key == session_key_form_set.COLLATERAL:
            relation = "collateral"
        else:
            msg = f"引数の値が不適切です。\n\
                session_keyは{session_key_form_set.ASCENDANT}, {session_key_form_set.COLLATERAL}のいずれかにしてください。\n\
                session_key={session_key}"
            basic_log(get_current_function_name(), None, request_user, msg)
            
            raise ValueError(msg)
            
        result, data = check_session_data(session_key, relation)
        if result:
            for x in data:
                x["id"] = x.get("index")
                
                add_person_data(persons_data, x)
                
            if session_key == session_key_form_set.ASCENDANT:
                data = sorted(data, key=lambda x: x['id'])
            
        return data
                
    """メイン"""   
    try:
        # ログイン中のシステム利用会員はstep_oneに遷移させる
        if request_user.is_authenticated and request_user.basic_date:
            return redirect("toukiApp:step_one")
        
        form_sets = create_formsets_by_configuration(FORMSETS_CONFIGURATION)
        child_form_set,\
        child_spouse_form_set,\
        grand_child_form_set,\
        ascendant_form_set,\
        collateral_form_set = ini_formsets(form_sets, request)
        
        decedent_form,\
        spouse_form,\
        child_common_form,\
        collateral_common_form = create_forms_by_configuration(FORMS_CONFIGURATION, request)
        
        if request.method == "POST":
            forms = [
                ("被相続人", decedent_form),
                ("配偶者", spouse_form),
                ("子供全員", child_common_form),
                ("兄弟姉妹全員", collateral_common_form),
            ]
            form_sets = [
                ("子", child_form_set),
                ("子の配偶者", child_spouse_form_set),
                ("孫", grand_child_form_set), 
                ("父母または祖父母", ascendant_form_set),
                ("兄弟姉妹", collateral_form_set)
            ]

            is_forms_valid = all(validate_and_log(form[1], form[0], function_name, request_user) for form in forms)
            is_form_sets_valid = all(validate_and_log(form_set[1], form_set[0], function_name, request_user) for form_set in form_sets)

            if is_forms_valid and is_form_sets_valid:
                cleaned_forms = [f[1] for f in forms]
                cleaned_form_sets = [fs[1] for fs in form_sets]
                save_to_session(cleaned_forms, cleaned_form_sets)
            else:
                messages.warning(request, "受付に失敗。 入力に不備があるためデータを保存できませんでした。\n再度入力をお願いします。\n同じメッセージが表示される場合はお問い合わせをお願いします。")
            
            return redirect(this_url_name)

        result, decedent_form = ini_decedent_or_common_form(session_key_form.DECEDENT)
        if result:
            spouse_data = get_decedent_spouse_data()

            result, child_common_form = ini_decedent_or_common_form(session_key_form.CHILD_COMMON)
            if result:
                
                childs_data = get_childs_data()
                if childs_data:
                    child_heirs_data = get_child_heirs_data()

                ascendant_data = get_ascendant_or_collateral_data(session_key_form_set.ASCENDANT)

                result, collateral_common_form = ini_decedent_or_common_form(session_key_form.COLLATERAL_COMMON)
                if result:
                    collateral_data = get_ascendant_or_collateral_data(session_key_form_set.COLLATERAL)
        
        deceased_person_names = [x["name"] for x in persons_data if x["is_deceased"]] if len(persons_data) > 0 else []
        decedent_form_internal_field_name = ["user", "progress"]
        spouse_or_ascendant_internal_field_name = ["decedent", "content_type", "object_id", "is_heir"]
        common_form_internal_field_name = ["decedent"]
        descendant_or_collateral_internal_field_name = ["decedent", "content_type1", "object_id1", "content_type2", "object_id2", "is_heir"]
        ascendants_relation = ["父", "母", "父方の祖父", "父方の祖母", "母方の祖父", "母方の祖母"]
        
        context = {
            "title" : Sections.STEP1,
            "progress": progress,
            "deceased_person_names": deceased_person_names,
            "decedent_name": decedent_form.initial.get("name"),
            "persons_data": persons_data,
            "decedent_form": decedent_form,
            "decedent_form_internal_field_name": decedent_form_internal_field_name,
            "spouse_form": spouse_form,
            "spouse_or_ascendant_internal_field_name": spouse_or_ascendant_internal_field_name,
            "child_common_form" : child_common_form,
            "collateral_common_form" : collateral_common_form,
            "common_form_internal_field_name" : common_form_internal_field_name,
            "sections" : Sections.SECTIONS[Sections.STEP1],
            "service_content" : Sections.SERVICE_CONTENT,
            "child_form_set" : child_form_set,
            "child_spouse_form_set" : child_spouse_form_set,
            "grand_child_form_set" : grand_child_form_set,
            "ascendant_form_set" : ascendant_form_set,
            "descendant_or_collateral_internal_field_name" : descendant_or_collateral_internal_field_name,
            "ascendants_relation" : ascendants_relation,
            "collateral_form_set" : collateral_form_set,
            "userDataScope" : json.dumps(userDataScope),
            "spouse_data" : json.dumps(spouse_data),
            "childs_data" : json.dumps(childs_data),
            "child_heirs_data" : json.dumps(child_heirs_data),
            "ascendant_data" : json.dumps(ascendant_data),
            "collateral_data" : json.dumps(collateral_data),
            "persons_data_for_modal": json.dumps(persons_data)
        }

        return render(request, html, context)
    except Exception as e:
        if not "session_id" in locals():
            session_id = request.session.session_key
        return handle_error(e, request, request_user, function_name, this_url_name, notices=f"session_id={session_id}")
   
def step_one(request):
    """
    
        ステップ１．基本データ入力
        
    """
    function_name = get_current_function_name()
    this_url_name = "toukiApp:step_one"
    html = "toukiApp/step_one.html"
    next_url_name = "toukiApp:step_two"
    step_progress = 1
    request_user = request.user
    
    try:
        # システム利用の会員以外はアカウント登録ページに遷移させる
        result, redirect_to = is_basic_user(request)
        if not result:
            return redirect(redirect_to)
        
        if get_boolean_session(request.session, "new_basic_user"):
            message = "サービス開始 ご利用いただき誠にありがとうございます。\n\nお客様の相続登記が完了するまでしっかりサポートさせていただきます!\n\nご不明なことがありましたら、お気軽にお問い合わせください。"
            if get_boolean_session(request.session, "new_option1_user"):
                message += f"\n\n{Service.OPTION1_NAME}につきましては、平日3日以内に弊社からご入力いただいたご住所に書類を発送いたしますので到着まで今しばらくお待ちください。"
                
            messages.success(request, message)
        
        user = User.objects.get(email = request_user.email)
        decedent = user.decedent.first()
        
        child_form_set = formset_factory(form=StepOneDescendantForm, extra=1, max_num=15)
        grand_child_form_set = formset_factory(form=StepOneDescendantForm, extra=1, max_num=15)
        ascendant_form_set = formset_factory(form=StepOneAscendantForm, extra=6, max_num=6)
        child_spouse_form_set = formset_factory(form=StepOneSpouseForm, extra=1, max_num=15)
        collateral_form_set = formset_factory(form=StepOneCollateralForm, extra=1, max_num=15)
        
        if request.method == "POST":
            
            if decedent and not is_progress_equal_to_step(decedent.progress, step_progress):
                return redirect_to_progress_page(request)
                
            forms = [
                ("被相続人", StepOneDecedentForm(request.POST, prefix="decedent")),
                ("配偶者", StepOneSpouseForm(request.POST, prefix="spouse")),
                ("子供全員", StepOneDescendantCommonForm(request.POST, prefix="child_common")),
                ("兄弟姉妹全員", StepOneCollateralCommonForm(request.POST, prefix="collateral_common")),
            ]
            form_sets = [
                ("子", child_form_set(request.POST, prefix="child")),
                ("子の配偶者", child_spouse_form_set(request.POST or None, prefix="child_spouse")),
                ("孫", grand_child_form_set(request.POST or None, prefix="grand_child")), 
                ("父母または祖父母", ascendant_form_set(request.POST or None, prefix="ascendant")),
                ("兄弟姉妹", collateral_form_set(request.POST or None, prefix="collateral"))
            ]

            is_forms_valid = all(validate_and_log(form[1], form[0], function_name, user) for form in forms)
            is_form_sets_valid = all(validate_and_log(form_set[1], form_set[0], function_name, user) for form_set in form_sets)

            if is_forms_valid and is_form_sets_valid:
                try:
                    with transaction.atomic():
                        save_step_one_datas(user, [f[1] for f in forms], [fs[1] for fs in form_sets], False)
                        return redirect(next_url_name)
                except Exception as e:
                    basic_log(function_name, e, user, "POSTのデータ保存処理でエラー")
                    raise e
            else:
                messages.warning(request, "受付に失敗 入力内容に不備があるためデータを保存できませんでした。\n再度入力をお願いします。\n同じメッセージが表示される場合はお問い合わせをお願いします。")
            
            redirect(this_url_name)
        
        userDataScope = []
        spouse_data = {}
        childs_data = []
        child_heirs_data = []
        ascendant_data = []
        collateral_data = []
        progress = 1
        
        decedent_form = StepOneDecedentForm(prefix="decedent")
        spouse_form = StepOneSpouseForm(prefix="spouse")
        child_common_form = StepOneDescendantCommonForm(prefix="child_common")
        collateral_common_form = StepOneCollateralCommonForm(prefix="collateral_common") 
        
        if decedent:
            progress = decedent.progress
            decedent_form = StepOneDecedentForm(prefix="decedent", instance=decedent)
            userDataScope.append("decedent")
            
            spouse = Spouse.objects.filter(decedent=decedent, object_id=decedent.id).first() # 被相続人の被相続人
            if spouse:
                spouse_data = model_to_dict(spouse)
                userDataScope.append("spouse")

            child_common = DescendantCommon.objects.filter(decedent=decedent).first() # 子共通
            if child_common:
                child_common_form = StepOneDescendantCommonForm(prefix="child_common", instance=child_common)
                userDataScope.append("child_common")
                
                childs = Descendant.objects.filter(object_id1=decedent.id) # 子全員
                if childs.exists():
                    descendant_form_fields = StepOneDescendantForm().fields
                    childs_data = get_step_one_childs_data(decedent, childs, descendant_form_fields)
                    userDataScope.append("child")
                    
                    child_spouses = Spouse.objects.filter(decedent=decedent).exclude(object_id=decedent.id)
                    spouse_form_fields = StepOneSpouseForm().fields
                    child_spouses_data = get_step_one_child_heirs_data(child_spouses, spouse_form_fields)
                        
                    grand_childs = Descendant.objects.filter(decedent=decedent).exclude(object_id1=decedent.id)
                    grand_childs_data = get_step_one_child_heirs_data(grand_childs, descendant_form_fields)
                        
                    if child_spouses_data or grand_childs_data:
                        child_heirs_data = child_spouses_data + grand_childs_data
                        child_heirs_data.sort(key=lambda x: (x['child_id'], not (x in child_spouses_data)))
                        userDataScope.append("child_heirs")

                ascendants = Ascendant.objects.filter(decedent=decedent)
                if ascendants.exists():
                    ascendant_form_fields = StepOneAscendantForm().fields
                    ascendant_data = get_step_one_ascendant_or_collateral_data(ascendants, ascendant_form_fields)
                    ascendant_data = sorted(ascendant_data, key=lambda x: x['id']) #父、母、父方の祖父、父方の祖母、母方の祖父、母方の祖母の順
                    userDataScope.append("ascendant")

                collateral_common = CollateralCommon.objects.filter(decedent=decedent).first()
                if collateral_common:
                    collateral_common_form = StepOneCollateralCommonForm(prefix="collateral_common", instance=collateral_common)
                    userDataScope.append("collateral_common")
                    
                    collaterals = Collateral.objects.filter(decedent=decedent)
                    if collaterals.exists():
                        collateral_form_fields = StepOneCollateralForm().fields
                        collateral_data = get_step_one_ascendant_or_collateral_data(collaterals, collateral_form_fields)
                        userDataScope.append("collateral")
        
        decedent_form_internal_field_name = ["user", "progress"]
        spouse_or_ascendant_internal_field_name = ["decedent", "content_type", "object_id", "is_heir"]
        common_form_internal_field_name = ["decedent"]
        descendant_or_collateral_internal_field_name = ["decedent", "content_type1", "object_id1", "content_type2", "object_id2", "is_heir"]
        ascendants_relation = ["父", "母", "父方の祖父", "父方の祖母", "母方の祖父", "母方の祖母"]
        
        context = {
            "title" : "１．" + Sections.STEP1,
            "user" : user,
            "progress": progress,
            "decedent_form": decedent_form,
            "decedent_form_internal_field_name": decedent_form_internal_field_name,
            "spouse_form": spouse_form,
            "spouse_or_ascendant_internal_field_name": spouse_or_ascendant_internal_field_name,
            "child_common_form" : child_common_form,
            "collateral_common_form" : collateral_common_form,
            "common_form_internal_field_name" : common_form_internal_field_name,
            "sections" : Sections.SECTIONS[Sections.STEP1],
            "service_content" : Sections.SERVICE_CONTENT,
            "child_form_set" : child_form_set(prefix="child"),
            "child_spouse_form_set" : child_spouse_form_set(prefix="child_spouse"),
            "grand_child_form_set" : grand_child_form_set(prefix="grand_child"),
            "ascendant_form_set" : ascendant_form_set(prefix="ascendant"),
            "descendant_or_collateral_internal_field_name" : descendant_or_collateral_internal_field_name,
            "ascendants_relation" : ascendants_relation,
            "collateral_form_set" : collateral_form_set(prefix="collateral"),
            "userDataScope" : json.dumps(userDataScope),
            "spouse_data" : json.dumps(spouse_data),
            "childs_data" : json.dumps(childs_data),
            "child_heirs_data" : json.dumps(child_heirs_data),
            "ascendant_data" : json.dumps(ascendant_data),
            "collateral_data" : json.dumps(collateral_data),
        }

        return render(request, html, context)
    except Exception as e:
        return handle_error(
            e,
            request,
            request_user,
            function_name,
            this_url_name,
        )

def sort_out_trial(request):
    """ユーザーの属性に応じて遷移先を振り分ける"""
    if not request.user.is_authenticated:
        return redirect("accounts:signup")
        
    if not request.user.basic_date:
        return redirect("toukiApp:step_one_trial")
        
    return redirect("toukiApp:step_one")

def get_sorted_child_heirs(child_heirs):
    """ソートされた子の相続人を格納した配列を返す"""
    # object_idまたはobject_id1を取得する関数
    def get_id(obj):
        return obj.object_id if isinstance(obj, Spouse) else obj.object_id1

    # 同じIDがある場合に、child_spousesの要素が先に来るようにする関数
    def compare(obj):
        return (get_id(obj), isinstance(obj, Descendant))

    # 比較関数に基づいてソート
    child_heirs = sorted(child_heirs, key=compare)
    return [x for x in child_heirs]

def get_persons_by_condition(model, decedent, **filters):
    """引数で与えられた条件に一致する相続人を返す"""
    querysets = model.objects.filter(decedent=decedent, **filters)
    return [x for x in querysets] if querysets.exists() else []
    
    
def get_deceased_persons(decedent):
    """相続時に生存していて手続前に死亡した相続人を取得する"""
    deceased_heirs = []
    
    deceased_heirs += get_persons_by_condition(Spouse, decedent, is_live=False, is_refuse=False)
    
    childs = Descendant.objects.filter(object_id1=decedent.id, is_live=False, is_refuse=False)
    if childs.exists():
        deceased_heirs += [x for x in childs]
        child_spouses = [x for x in Spouse.objects.filter(decedent=decedent, is_live=False, is_refuse=False).exclude(object_id=decedent.id)]
        grand_childs = [x for x in Descendant.objects.filter(decedent=decedent, is_live=False, is_refuse=False).exclude(object_id1=decedent.id)]
        child_heirs = child_spouses + grand_childs

        if child_heirs:
            deceased_heirs += get_sorted_child_heirs(child_heirs)
    
    deceased_heirs += get_persons_by_condition(Ascendant, decedent, is_live=False, is_refuse=False)
    deceased_heirs += get_persons_by_condition(Collateral, decedent, is_live=False, is_refuse=False)
    
    return deceased_heirs

def get_legal_heirs(decedent):
    """生存している法定相続人全員（数次相続の相続人を含む）を格納した配列を返す"""
    heirs = []
    
    try:
        heirs += get_persons_by_condition(Spouse, decedent, is_heir=True)
        
        childs = Descendant.objects.filter(object_id1=decedent.id)
        if childs.exists():
            
            if any(x for x in childs if x.is_heir):
                heirs += [x for x in childs if x.is_heir]
            
            if any(x for x in childs if x.is_live == False):
                child_spouses = [x for x in Spouse.objects.filter(decedent=decedent, is_heir=True).exclude(object_id=decedent.id)]
                grand_childs = [x for x in Descendant.objects.filter(decedent=decedent, is_heir=True).exclude(object_id1=decedent.id)]
                child_heirs = child_spouses + grand_childs

                if child_heirs:
                    heirs += get_sorted_child_heirs(child_heirs)
    
        heirs += get_persons_by_condition(Ascendant, decedent, is_heir=True)
        heirs += get_persons_by_condition(Collateral, decedent, is_heir=True)
        
        return heirs
    except Exception as e:
        basic_log(get_current_function_name(), e, None, f"decedent={decedent}")
        raise e

"""

    ステップ２関連

"""

def extract_file_id_from_url(url):
    """GoogleドライブのダウンロードリンクからファイルIDを抽出"""
    query = urlparse(url).query
    params = parse_qs(query)
    return params['id'][0]

def get_refused_heirs(decedent):
    """相続放棄した相続人を取得する"""
    result = []
    
    heir_types = [Spouse, Descendant, Ascendant, Collateral]
    
    for x in heir_types:
        result.extend(get_persons_by_condition(x, decedent, is_refuse=True))
    
    return result

def step_two(request):
    """ステップ２．必要書類一覧"""
    function_name = get_current_function_name()
    this_url_name = "toukiApp:step_two"
    this_html = "toukiApp/step_two.html"
    next_url_name = "toukiApp:step_three"
    step_progress = 2
    
    try:
        # 会員判定
        response, user, decedent = check_user_and_decedent(request)
        if response:
            return response
        
        progress = decedent.progress
        # アクセス権限判定
        if not is_fulfill_required_progress(progress, step_progress):
            return redirect_to_progress_page(request)
        
        registry_files = Register.objects.filter(decedent=decedent)
        
        if request.method == "POST":
            try:
                if not is_progress_equal_to_step(progress, step_progress):
                    return redirect_to_progress_page(request)
                
                with transaction.atomic():
                    decedent.progress = step_progress + 1
                    decedent.save()

                    # if os.getenv('DJANGO_SETTINGS_MODULE') == 'toukiAi.settings.development':
                        
                    # サービスアカウントの認証情報ファイルのパス
                    SERVICE_ACCOUNT_FILE = json.loads(settings.GOOGLE_SERVICE_ACCOUNT)
                    
                    # サービスアカウント認証情報をロード
                    credentials = service_account.Credentials.from_service_account_info(
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
                    return JsonResponse({'status': 'success'})
            except Exception as e:
                return handle_error(
                    e,
                    request,
                    request.user,
                    function_name,
                    None,
                    True
                )
        
        # 不動産登記簿があるとき
        file_server_file_name_and_file_path = []
        if registry_files.exists():
            for x in registry_files:
                # ファイルの保存先のパスを追加
                file_server_file_name_and_file_path.append({"name": x.title, "path": x.path})
                
        app_server_file_name_and_file_path = []
        for x in file_server_file_name_and_file_path:
            # ダウンロード先のパス
            output = os.path.join(settings.MEDIA_ROOT, 'download_tmp', x["name"])

            # ファイルをダウンロード
            gdown.download(x["path"], output, quiet=True)

            # ダウンロードしたファイルの名前とパスを配列に追加
            app_server_file_name_and_file_path.append({"name": x["name"], "path": settings.MEDIA_URL + 'download_tmp/' + x["name"]})

        # 配列をJSON形式に変換
        app_server_file_name_and_file_path = json.dumps(app_server_file_name_and_file_path)
        
        heirs = get_legal_heirs(decedent)
        if not heirs:
            basic_log(function_name, None, user, "相続人が登録されていない状態でstep_twoにアクセスしました")
            messages.error(request, "アスセス不可 相続人データが登録されていません。\n先に基本データ入力を入力してください")
            return redirect(ToukiAppUrlName.step_one)
            
        deceased_persons = get_deceased_persons(decedent)
        minors = get_filtered_instances(heirs, "is_adult", False)
        overseas = get_filtered_instances(heirs, "is_japan", False)
        refused_heirs = get_refused_heirs(decedent)
        
        # search_word = "戸籍 郵送請求"
        # query = f"{get_prefecture_name(decedent.domicile_prefecture)}{decedent.domicile_city} {search_word}"
        # response = requests.get(f"https://www.googleapis.com/customsearch/v1?key=AIzaSyAmeV3HS-AshtCAHWit7eAEEudyEkwtnxE&cx=9242f933284cb4535&q={query}")
        # data = response.json()
        # top_link = data["items"][0]["link"]
        
        context = {
            "title" : Sections.STEP2,
            "user_email" : user.email,
            "progress": progress,
            "prefectures": PREFECTURES,
            "decedent": decedent,
            "app_server_file_name_and_file_path": app_server_file_name_and_file_path,
            "file_server_file_name_and_file_path": file_server_file_name_and_file_path,
            # "top_link": top_link,
            "deceased_persons": deceased_persons,
            "heirs": heirs,
            "refused_heirs": refused_heirs,
            "minors": minors,
            "overseas": overseas,
            "company_data": CompanyData,
            "sections" : Sections.SECTIONS[Sections.STEP2],
            "service_content" : Sections.SERVICE_CONTENT,
        }
        return render(request, this_html, context)
    
    except Exception as e:
        return handle_error(
            e,
            request,
            request.user,
            function_name,
            this_url_name,
        )


"""

    ステップ３関連

"""
def step_three_input_status(data):
    """
    
        登録されているステップ3のデータをチェックしてどこまで入力が完了しているか判別する
    
    """
    def is_decedent_done():
        """被相続人情報"""
        attr = [
            data.name,
            data.death_year, data.death_month, data.death_date, 
            data.birth_year, data.birth_month, data.birth_date, 
            data.prefecture, data.city, data.address, 
            data.domicile_prefecture, data.domicile_city, data.domicile_address
        ]

        return all(attr)
    
    def is_heirs_done():
        """相続人情報"""
        if not isinstance(data, (list, QuerySet)):
            data_list = [data]
        else:
            data_list = data
            
        is_done = True
        
        for d in data_list:
            attr = [
                d.name,
                d.birth_year, d.birth_month, d.birth_date
            ]
            #卑属又は兄弟姉妹のとき前配偶者又は異父母データを追加する
            if d.__class__ in [Descendant, Collateral]:
                attr.append(d.object_id2)
            #死亡して相続放棄してない又は空欄とき、死亡年月日を追加
            if d.is_live == False and d.is_refuse == False:
                attr.extend([d.death_year, d.death_month, d.death_date])
            #不動産を取得するとき、都道府県、市区町村、町域・番地を追加
            if d.is_acquire:
                attr.extend([d.prefecture, d.city, d.address])
                
            #全項目をチェック
            if not all(attr):
                is_done = False
                break
            
        return is_done    
    
    def is_type_of_division_done():
        """遺産分割方法情報"""
        # 遺産分割の方法が存在するかどうか
        is_division = bool(data.type_of_division)
        
        # 不動産の分配方法の値が存在するかどうか
        is_property_allocation = bool(data.property_allocation)
        
        # 単独の不動産取得者の値が存在するかどうか
        is_property_acquirer = bool(data.content_type1) and bool(data.object_id1)
        
        # 金銭の分配方法の値が存在するかどうか
        is_cash_allocation = bool(data.cash_allocation)
        
        # 単独の金銭取得者の値が存在するかどうか
        is_cash_acquirer = bool(data.content_type2) and bool(data.object_id2)
        
        is_property_division = is_property_allocation or is_property_acquirer
        is_cash_division = is_cash_allocation or is_cash_acquirer
        is_done = is_property_division and is_cash_division and is_division

        return is_done
    
    def is_number_of_properties_done():
        """不動産の数"""
        attr = [data.land, data.house, data.bldg]
        return any(x > 0 for x in attr)
    
    def is_properties():
        """不動産情報"""
        attr = [data.number, data.address, data.purparty, data.price, data.is_exchange, data.office]
        return all(attr)
    
    def is_site():
        """敷地権情報"""
        attr = [data.bldg, data.number, data.address_and_land_number, data.type, 
                data.purparty_bottom, data.purparty_top, data.price,]
        return all(attr)
    
    def is_acquirer():
        """取得者情報"""
        attr = [data.content_type1, data.object_id1, data.content_object1, 
                data.content_type2, data.object_id2, data.content_object2,
                data.percentage]
        return all(attr)
    
    def is_application():
        """申請情報"""
        if data.is_agent == None:
            return False
            
        attr = []
        if data.is_agent == True:
            attr = [data.content_type, data.object_id,
                    data.agent_name, data.agent_address, data.agent_phone_number,
                    data.is_return, data.is_mail]
        else:
            attr = [data.content_type, data.object_id, data.phone_number,
                    data.is_return, data.is_mail]
        return all(attr)
    
    def get_class_name():
        """データのクラス名を取得する"""
        if hasattr(data, 'model'):  # クエリセットかどうかを確認
            return data.model.__name__
        else:  # 単一インスタンスの場合
            return data.__class__.__name__
    
    """メイン処理"""
    function_name = get_current_function_name()
    class_name = get_class_name()
    
    try:
        
        if class_name == "Decedent":
            return is_decedent_done()
        elif class_name in ["Spouse", "Ascendant", "Descendant", "Collateral"]:
            return is_heirs_done()
        elif class_name == "TypeOfDivision":
            return is_type_of_division_done()
        elif class_name == "NumberOfProperties":
            return is_number_of_properties_done()
        elif class_name in ["Land", "House", "Bldg"]:
            return is_properties()
        elif class_name == "Site":
            return is_site()
        elif class_name in ["PropertyAcquirer", "CashAcquirer"]:
            return is_acquirer()
        elif class_name == "Application":
            return is_application()
                
        raise Exception("想定外のデータが引数に渡されました。")
    except Exception as e:
        raise Exception(f"{function_name}でエラー。\nclass_name={class_name}") from e

def get_spouse_or_ascendant_initial_data(data):
    """
    
        配偶者又は直系尊属のフォームに渡す初期データを返す
        
    """
    initial_data = []
    for d in data:
        data_dict = {
            "id": d.id,
            "decedent": d.decedent,
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
        }
        
        # select要素のvalueに設定するための値
        if hasattr(d, 'id') and hasattr(d, 'content_type'):
            data_dict["id_and_content_type"] = f"{d.id}_{ContentType.objects.get_for_model(d).id}"
        
        initial_data.append(data_dict)

    return initial_data

def get_descendant_or_collateral_initial_data(data, content_type_model):
    """
    
        直系卑属又は傍系のフォームに渡す初期データを返す

    """
    content_type = ContentType.objects.get_for_model(content_type_model)
    related_individual_content_type = ContentType.objects.get_for_model(RelatedIndividual)

    initial_data = []
    for d in data:
        if d.content_type1 == related_individual_content_type and d.content_type2 == related_individual_content_type:
            raise ValidationError(f"{d.name}さんの父母のデータが適切に登録されていません。\ncontent_type={content_type}\nid={d.id}")
        
        related_individual = None
        if d.content_type1 == related_individual_content_type:
            related_individual = RelatedIndividual.objects.filter(
                id=d.object_id1,
                object_id=d.id,
                content_type=content_type
            ).first()
        elif d.content_type2 == related_individual_content_type:
            related_individual = RelatedIndividual.objects.filter(
                id=d.object_id2,
                object_id=d.id,
                content_type=content_type
            ).first()
            
        other_parent_name = related_individual.name if related_individual else None

        # 辞書データを生成
        data_dict = {
            "id": d.id,
            "decedent": d.decedent,
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
    """
    
        不動産のフォームに渡す初期データを返す。

    """
    initial_data = []
    for d in data:
        data_dict = {
            "land_id": d.id,
            "house_id": d.id,
            "bldg_id": d.id,
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
            "is_exchange": getattr(d, "is_exchange", None),
        }
        
        initial_data.append(data_dict)

    return initial_data

def get_acquirer_initial_data(data):
    """
    
        取得者のフォームに渡す初期データを返す。

    """
    initial_data = []
    for d in data:
        data_dict = {
            "id": d.id,
            "decedent": d.decedent,
            "content_type1": d.content_type1,
            "object_id1": d.object_id1,
            "content_type2": d.content_type2,
            "object_id2": d.object_id2,
            "percentage": d.percentage,
        }
        
        initial_data.append(data_dict)

    return initial_data

def add_required_for_data(instance, user, decedent):
    """データに必須の項目を追加する
    
        ・updated_by(更新者)は常に必須、被相続人と作成者は新規登録のとき必須
        
    """
    instance.updated_by = user
    if not instance.id:
        instance.decedent = decedent
        instance.created_by = user
    
def update_form_set_validation(data, form_set, user):
    """
    
        フォームセットを更新する際のバリデーション

    """
    function_name = get_current_function_name()
    form_class_name = get_form_set_class_name(form_set)
    
    def is_form_set_count_equal_to_data_count():
        """データの数とフォームセットの数を検証する"""
        if form_set.management_form.cleaned_data["TOTAL_FORMS"] == len(data):
            return ""
            
        return f"{function_name}でエラー。\n{form_class_name}のフォームセットの数とデータの数が一致しません"

    def is_all_id_match(target_ids, data_ids, form_class_name):
        """フォームセットのidとデータのidを比較する"""
        #idを比較してフォームセットから送られたデータが全て更新対象のものか確認する
        target_ids_set = set(int(id_str) for id_str in target_ids if id_str.isdigit())
        
        # data_dict のキーからセットを作成
        data_ids_set = set(data_ids)
        
        # 両方のセットが完全に一致するか確認
        if target_ids_set == data_ids_set:
            return ""
        
        missing_in_target_ids = data_ids_set - target_ids_set
        missing_in_data_ids = target_ids_set - data_ids_set

        message = f"{function_name}でエラー。\n\
            form_class_name={form_class_name}\n\
            missing_in_target_ids={missing_in_target_ids}\n\
            missing_in_data_ids={missing_in_data_ids}"
        return message
    
    if is_data(data) == False:
        return False

    update_target_ids = [form.cleaned_data.get("id") for form in form_set if form.cleaned_data.get('id')]
    data_dict = {d.id: d for d in data}
    data_keys = data_dict.keys()
    
    result = is_form_set_count_equal_to_data_count()
    if result != "":
        raise ValueError(result)
    
    result = is_all_id_match(update_target_ids, data_keys, form_class_name)
    if result != "":
        raise ValueError(result)

def update_form_set(data, form_set, user, decedent, content_type = None, relationship = None):
    """
    
        フォームセットの更新処理
        
    """
    function_name = get_current_function_name()
    form_class_name = get_form_set_class_name(form_set)
    
    if update_form_set_validation(data, form_set, user) == False:
        return
    
    if form_class_name in ["StepThreeDescendantForm", "StepThreeCollateralForm"]:
        save_step_three_descendant_or_collateral(decedent, user, data, form_set, content_type, relationship)
    elif form_class_name in ["StepThreeSpouseForm", "StepThreeAscendantForm"]:
        save_step_three_child_spouse_or_ascendant(user, form_set, data)
    else:
        basic_log(get_current_function_name(), None, user, form_class_name)
        raise ValidationError(f"{function_name}\nform_class_name={form_class_name}")
    
def save_step_three_child_spouse_or_ascendant(user, form_set, data):
    """ステップ３の子の配偶者又は尊属の更新処理

    Args:
        user (_type_): _description_
        form_set (_type_): _description_
        data (_type_): _description_
    """
    
    function_name = get_current_function_name()
    
    try:
        form_class_name = get_form_set_class_name(form_set)  # formのクラス名を取得
        data_dict = {d.id: d for d in data}
        update_fields = get_update_fields_for_form_set(data)
        
        for form in form_set:
            form_data = form.cleaned_data
            update_target_data = data_dict.get(int(form_data.get("id")))
            form_data['updated_by'] = user
            
            for key, value in form_data.items():
                if key in update_fields:
                    setattr(update_target_data, key, value)
                update_target_data.save()
    except Exception as e:
        basic_log(function_name, e, user, form_class_name)
        raise e
    
def get_update_fields_for_form_set(data):
    """フォームセットの更新処理をする際の更新対象のフィールドを取得する
    
    モデルのクラス名に応じて更新から除外するフィールドを判別して更新対象のフィールドを確定する
    """
    
    function_name = get_current_function_name()
    
    d = data[0]
    model_name = d._meta.model_name
    model_fields = model_to_dict(d).keys()
    exclude_fields = []
    
    if model_name in ["descendant", "collateral"]:
        exclude_fields = ['is_heir', "is_exist", "is_live", 'created_at', 'created_by']
    elif model_name in ["spouse", "ascendant"]:
        exclude_fields = ['is_heir', "is_exist", "is_live", 'created_at', 'created_by']
    else:
        basic_log(function_name, None, None, f"想定しないmodel_nameです\nmodel_name={model_name}", None)
        raise ValidationError(f"{function_name}でエラー\n想定しないmodel_nameです\nmodel_name={model_name}")
    
    return [field for field in model_fields if field not in exclude_fields]

def save_step_three_descendant_or_collateral(decedent, user, data, form_set, content_type, relationship):
    """
    
        ステップ3の卑属又は傍系のデータ更新処理

    """
    
    def assign_relation(data_dict, relation_number, val1, val2):
        """関係者を代入する"""
        if relation_number not in (1, 2):
            raise ValueError(f"{get_current_function_name()}でエラー。\nrelation_numberには 1 または 2 を渡してください。\nrelation_number={relation_number}")
        
        data_dict[f"content_type{relation_number}"] = val1
        data_dict[f"object_id{relation_number}"] = val2
        
    function_name = get_current_function_name()
    form_class_name = get_form_set_class_name(form_set)
    
    related_indivisual_content_type, Ascendant_content_type = get_content_types_for_models(RelatedIndividual, Ascendant)
    
    data_dict = {d.id: d for d in data}
    update_fields = get_update_fields_for_form_set(data)
    
    for form in form_set:
        try:
            form_data = form.cleaned_data
            
            other_parent_name = form_data.get("other_parent_name")
            #関係者の登録（関係者は削除と新規のため、子のcontent_type2object_id2は常に更新する必要あり）
            if other_parent_name != "":
                related_indivisual = create_related_indivisual(
                    decedent, 
                    other_parent_name, 
                    content_type,
                    form_data.get("id"),
                    relationship, 
                    user
                )
                
                relation_number = 1 # 異父のとき、content_type1とobject_id1に関係者を代入する
                # 卑属または異母の兄弟姉妹のとき、content_type2とobject_id2に関係者を代入する
                if content_type.model == "descendant" or form_data["content_type1"] == Ascendant_content_type:
                    relation_number = 2
                assign_relation(form_data, relation_number, related_indivisual_content_type, related_indivisual.id)

            update_target_data = data_dict.get(int(form_data.get("id")))
            form_data['updated_by'] = user
            
            for key, value in form_data.items():
                if key in update_fields:
                    setattr(update_target_data, key, value)
                update_target_data.save()
                
        except Exception as e:
            basic_log(
                function_name, 
                e, 
                user, 
                f"decedent={decedent}\nuser={user}\ndata={data}\form_class_name={form_class_name}\ncontent_type={content_type}\nrelationship={relationship}", 
                None
            )
            raise e
                
def save_step_three_step_property(decedent, user, form_set):
    """土地、建物、区分建物のデータ新規登録処理

    Args:
        decedent (_type_): _description_
        user (_type_): _description_
        form_set (_type_): _description_

    Returns:
        _type_: 不動産のフォームのindexとinstance（取得者、敷地権の登録処理で使用するため）
    """
    try:
        form_class_name = get_form_set_class_name(form_set)
        function_name = get_current_function_name()
        index_and_instance = []
        for form in form_set:
            instance = form.save(commit=False)
            add_required_for_data(instance, user, decedent)
            instance.save()
            index_and_instance.append((form.cleaned_data.get("index"), instance))
        return index_and_instance
    except Exception as e:
        basic_log(function_name, e, user, form_class_name)
        raise e   

def save_step_three_acquirer(decedent, user, form_set, property_content_type, index_and_properties):
    """不動産取得者、金銭取得者の新規登録処理

    ・金銭取得者の場合は、targetがNoneのフォームをスキップする
    Args:
        decedent (_type_): _description_
        user (_type_): _description_
        form_set (_type_): _description_
        property_content_type (_type_): _description_
        index_and_properties (_type_): _description_

    Raises:
        ValidationError: _description_
    """
    function_name = get_current_function_name()
    form_class_name = get_form_set_class_name(form_set)
    try:
        for form in form_set:
            instance = form.save(commit=False)
            add_required_for_data(instance, user, decedent)
            instance.content_type1 = property_content_type
            matched = False
            target_val = form.cleaned_data.get("target")
            
            cash_acquirer_forms = ["StepThreeLandCashAcquirerForm", "StepThreeHouseCashAcquirerForm", "StepThreeBldgCashAcquirerForm"]
            content_type_val = form.cleaned_data.get("content_type2")
            if form_class_name in cash_acquirer_forms and not content_type_val:
                continue
            
            for idx, property in index_and_properties:
                if target_val == idx:
                    matched = True
                    instance.object_id1 = property.id
                    instance.save()
                    break
            if not matched:
                basic_log(
                    function_name,
                    None,
                    user,
                    f"content_type：{property_content_type}\n\
                        フォームクラス：{form_class_name}\n\
                        target：{target_val}に一致する不動産のindexがありません")
                raise ValidationError("取得者と不動産の関連付けに失敗しました")
    except Exception as e:
        basic_log(function_name, e, user, form_class_name)
        raise e     

def save_step_three_site(decedent, user, form_set, index_and_instance):
    """ステップ３の敷地権のデータ登録処理

    Args:
        decedent (_type_): _description_
        user (_type_): _description_
        form_set (_type_): _description_
        index_and_instance (_type_): _description_

    Raises:
        ValidationError: _description_
    """
    function_name = get_current_function_name()
    form_class_name = get_form_set_class_name(form_set)
    try:
        for i, form in enumerate(form_set):
            site = form.save(commit=False)
            add_required_for_data(site, user, decedent)
            matched = False
            target_val = form.cleaned_data.get("target")
            for idx, property in index_and_instance:
                if target_val == idx:
                    matched = True
                    site.bldg = property
                    site.save()
                    break
            if not matched:
                raise ValidationError(f"form_num:{i + 1}, target:{target_val}に一致する不動産のindexがありません")
    except Exception as e:
        basic_log(function_name, e, user, form_class_name, False)
        raise e

def save_step_three_form(decedent, user, form):
    """ステップ３のモデルフォームのデータ保存処理

    フォームセットは対象外
    Args:
        decedent (_type_): _description_
        user (_type_): _description_
        form (_type_): _description_
    """
    try:
        form_class_name = form.__class__.__name__
        instance = form.save(commit=False)
        add_required_for_data(instance, user, decedent)
        instance.save()
    except Exception as e:
        basic_log(get_current_function_name(), e, user, form_class_name)
        raise e

def get_form_set_class_name(form_set):
    if (len(form_set.forms) > 0):
        return form_set.forms[0].__class__.__name__
    else:
        raise ValidationError(f"{get_form_set_class_name}でエラー\nform_set={form_set}")

def is_form_set(form_set):
    return form_set.management_form.cleaned_data["TOTAL_FORMS"] > 0

def is_any_exchange_property(form_set):
    """換価対象の不動産があるか判定する"""
    return any(form.cleaned_data.get('is_exchange') for form in form_set)

def save_step_three_spouse_data(data, form, decedent, user):
    """ステップ３の配偶者データ保存"""
    if is_data(data):
        save_step_three_form(decedent, user, form)
    else:
        basic_log(get_current_function_name(), None, user, "配偶者データがありません")
        raise ValidationError("配偶者データがありません")


def save_step_three_decedent_data(form, user):
    """ステップ３の被相続人データ保存"""
    try:
        instance = form.save(commit=False)
        instance.progress = 4
        add_required_for_data(instance, user, instance)
        instance.save()
        return instance
    except Exception as e:
        basic_log(get_current_function_name(), e, user)
        raise e

def get_forms_idx_for_step_three():
    """ステップ３のフォームのインデックス"""
    return {
        "decedent": 0,
        "spouse": 1,
        "type_of_division": 2,
        "number_of_properties": 3,
        "application": 4,
    }

def del_data_for_step_three(decedent):
    """ステップ３で削除と新規登録するモデルのデータ削除処理

    Args:
        decedent (_type_): _description_
    """
    RelatedIndividual.objects.filter(decedent=decedent).delete()
    Land.objects.filter(decedent=decedent).delete()
    House.objects.filter(decedent=decedent).delete()
    Bldg.objects.filter(decedent=decedent).delete()
    PropertyAcquirer.objects.filter(decedent=decedent).delete()
    CashAcquirer.objects.filter(decedent=decedent).delete()

def save_step_three_datas(user, forms, form_sets, data, data_idx):
    """ステップ３のデータ登録・更新処理

    Args:
        user (User): ユーザーデータ
        forms (form[]): データ操作対象のフォームを格納した配列
        form_sets (form_set[]): データ操作対象のフォームセットを格納した配列

    Returns:
        _type_: _description_
    """

    function_name = get_current_function_name()
    
    forms_idx = get_forms_idx_for_step_three()
    form_sets_idx = get_formsets_idx_for_step_three()
    
    try:
        #被相続人
        decedent = save_step_three_decedent_data(forms[forms_idx["decedent"]], user)
        
        #更新ではなく常に新規登録するモデルについてのデータ削除処理
        del_data_for_step_three(decedent)
        
        # 配偶者
        save_step_three_spouse_data(
            data[data_idx["spouse"]], 
            forms[forms_idx["spouse"]], 
            decedent, 
            user
        )
        
        # 遺産分割方法
        save_step_three_form(
            decedent,
            user,
            forms[forms_idx["type_of_division"]]
        )
        
        #不動産の数
        save_step_three_form(
            decedent,
            user,
            forms[forms_idx["number_of_properties"]]
        )
        
        #申請情報
        save_step_three_form(
            decedent,
            user,
            forms[forms_idx["application"]]
        )
                
        # 子（前配偶者がいるとき、前配偶者の新規登録又は更新をしてから更新する）
        descendant_content_type = ContentType.objects.get_for_model(Descendant)
        update_form_set(
            data[data_idx["child"]], 
            form_sets[form_sets_idx["child"]],
            user,
            decedent,
            descendant_content_type,
            "前配偶者",
        )
        
        #子の配偶者
        update_form_set(
            data[data_idx["child_spouse"]],
            form_sets[form_sets_idx["child_spouse"]],
            user,
            decedent,
        )
        
        #孫
        update_form_set(
            data[data_idx["grand_child"]],
            form_sets[form_sets_idx["grand_child"]],
            user,
            decedent,
            descendant_content_type,
            "子の前配偶者"
        )
        
        #尊属
        update_form_set(
            data[data_idx["ascendant"]],
            form_sets[form_sets_idx["ascendant"]],
            user,
            decedent
        )
        
        #兄弟姉妹
        update_form_set(
            data[data_idx["collateral"]],
            form_sets[form_sets_idx["collateral"]],
            user,
            decedent,
            ContentType.objects.get_for_model(Collateral),
            "異父又は異母"
        )
        
        #土地
        if forms[forms_idx["number_of_properties"]].cleaned_data.get("land") > 0:
            land_index_and_properties = save_step_three_step_property(
                decedent,
                user,
                form_sets[form_sets_idx["land"]],
            )
            
            #土地取得者
            land_content_type = ContentType.objects.get_for_model(Land)
            save_step_three_acquirer(
                decedent,
                user,
                form_sets[form_sets_idx["land_acquirer"]],
                land_content_type,
                land_index_and_properties,
            )
            
            #土地金銭取得者
            if is_any_exchange_property(form_sets[form_sets_idx["land"]]):
                save_step_three_acquirer(
                    decedent,
                    user,
                    form_sets[form_sets_idx["land_cash_acquirer"]],
                    land_content_type,
                    land_index_and_properties,
                )
                
        #建物
        if forms[forms_idx["number_of_properties"]].cleaned_data.get("house") > 0:
            house_index_and_properties = save_step_three_step_property(
                decedent,
                user,
                form_sets[form_sets_idx["house"]],
                )
            
            #建物取得者
            house_content_type = ContentType.objects.get_for_model(House)
            save_step_three_acquirer(
                decedent,
                user,
                form_sets[form_sets_idx["house_acquirer"]],
                house_content_type,
                house_index_and_properties,
            )
            
            #建物金銭取得者
            if is_any_exchange_property(form_sets[form_sets_idx["house"]]):
                save_step_three_acquirer(
                    decedent,
                    user,
                    form_sets[form_sets_idx["house_cash_acquirer"]],
                    house_content_type,
                    house_index_and_properties,
                )
                
        #区分建物
        if forms[forms_idx["number_of_properties"]].cleaned_data.get("bldg") > 0:
            bldg_index_and_properties = save_step_three_step_property(
                decedent,
                user,
                form_sets[form_sets_idx["bldg"]],
                )
            
            #敷地権
            save_step_three_site(
                decedent,
                user,
                form_sets[form_sets_idx["site"]],
                bldg_index_and_properties,
            )
            
            #区分建物取得者
            bldg_content_type = ContentType.objects.get_for_model(Bldg)
            save_step_three_acquirer(
                decedent,
                user,
                form_sets[form_sets_idx["bldg_acquirer"]],
                bldg_content_type,
                bldg_index_and_properties,
            )
            
            #区分建物金銭取得者
            if is_any_exchange_property(form_sets[form_sets_idx["bldg"]]):
                save_step_three_acquirer(
                    decedent,
                    user,
                    form_sets[form_sets_idx["bldg_cash_acquirer"]],
                    bldg_content_type,
                    bldg_index_and_properties,
                )
    except Exception as e:
        basic_log(function_name, e, user)
        raise e
        
def get_data_idx_for_step_three():
    idxs = {
        "spouse": 0,
        "child": 1,
        "child_spouse": 2,
        "grand_child": 3,
        "ascendant": 4,
        "collateral": 5,
        "type_of_division": 6,
        "number_of_properties": 7,
        "land": 8,
        "land_acquirer": 9,
        "land_cash_acquirer": 10,
        "house": 11,
        "house_acquirer": 12,
        "house_cash_acquirer": 13,
        "bldg": 14,
        "site": 15,
        "bldg_acquirer": 16,
        "bldg_cash_acquirer": 17,
        "application": 18,
    }
    return idxs

def get_all_decedent_related_data(decedent):
    """_summary_
    被相続人に紐づくステップ３で使用するデータを取得する
    Args:
        decedent (Decedent): 被相続人のデータ
    """
    function_name = get_current_function_name()
    try:
        spouse_data = Spouse.objects.filter(object_id=decedent.id).first()
        child_data = Descendant.objects.filter(object_id1=decedent.id).order_by('id')
        child_ids = child_data.values_list('id', flat=True)  # child_dataの各要素が持つIDのリストを取得
        child_spouse_data = Spouse.objects.filter(object_id__in=child_ids).order_by('id')
        grand_child_data = Descendant.objects.filter(object_id1__in=child_ids).order_by('id')
        ascendant_data = Ascendant.objects.filter(decedent=decedent).order_by('id')
        collateral_data = Collateral.objects.filter(decedent=decedent).order_by('id')
        type_of_division_data = TypeOfDivision.objects.filter(decedent=decedent).first()
        number_of_properties_data = NumberOfProperties.objects.filter(decedent=decedent).first()
        land_data = Land.objects.filter(decedent=decedent).order_by('id')
        land_content_type = ContentType.objects.get_for_model(Land)
        land_acquirer_data = PropertyAcquirer.objects.filter(decedent=decedent, content_type1=land_content_type).order_by('id')
        land_cash_acquirer_data = CashAcquirer.objects.filter(decedent=decedent, content_type1=land_content_type).order_by('id')
        house_data = House.objects.filter(decedent=decedent).order_by('id')
        house_content_type = ContentType.objects.get_for_model(House)
        house_acquirer_data = PropertyAcquirer.objects.filter(decedent=decedent, content_type1=house_content_type).order_by('id')
        house_cash_acquirer_data = CashAcquirer.objects.filter(decedent=decedent, content_type1=house_content_type).order_by('id')
        bldg_data = Bldg.objects.filter(decedent=decedent).order_by('id')
        site_data = Site.objects.filter(decedent=decedent).order_by('id')
        bldg_content_type = ContentType.objects.get_for_model(Bldg)
        bldg_acquirer_data = PropertyAcquirer.objects.filter(decedent=decedent, content_type1=bldg_content_type).order_by('id')
        bldg_cash_acquirer_data = CashAcquirer.objects.filter(decedent=decedent, content_type1=bldg_content_type).order_by('id')
        application_data = Application.objects.filter(decedent=decedent).first()
        return [
            spouse_data, child_data, child_spouse_data, grand_child_data, ascendant_data, collateral_data,
            type_of_division_data,
            number_of_properties_data,
            land_data, land_acquirer_data, land_cash_acquirer_data,
            house_data, house_acquirer_data, house_cash_acquirer_data,
            bldg_data, site_data, bldg_acquirer_data, bldg_cash_acquirer_data,
            application_data,
        ]
    except (MultipleObjectsReturned, DatabaseError) as e:
        basic_log(function_name, e, None, f"被相続人id：{decedent.id}")
        raise e
    except Exception as e:
        basic_log(function_name, e, None, f"被相続人id：{decedent.id}")
        raise e

def get_forms_for_step_three_post(request, decedent, data, data_idx):
    """ステップ3で使用するフォームにPOSTデータを代入してリストに格納して返す"""

    function_name = get_current_function_name()
    
    def add_prefix_to_dict(data, prefix):
        """辞書のキーにプレフィックスを追加する"""
        return {f"{prefix}{key}": value for key, value in data.items()}
    
    try:
        # StepThreeSpouseForm用のデータがPOSTに含まれているかチェック（配偶者はいなくても常にデータ登録されているため）
        if any(key.startswith('spouse-') for key in request.POST):
            spouse_form_data = request.POST
        else:
            spouse_form_data = add_prefix_to_dict(model_to_dict(data[data_idx["spouse"]]), "spouse-")
        
        return [
            StepThreeDecedentForm(
                request.POST or None,
                prefix="decedent",
                instance=decedent,
            ),
            StepThreeSpouseForm(
                spouse_form_data,
                prefix="spouse",
                instance=data[data_idx["spouse"]] if data[data_idx["spouse"]] else None,
            ),
            StepThreeTypeOfDivisionForm(
                request.POST or None,
                prefix="type_of_division",
                instance=data[data_idx["type_of_division"]] if data[data_idx["type_of_division"]] else None,
                legal_heirs=get_legal_heirs(decedent)
            ),
            StepThreeNumberOfPropertiesForm(
                request.POST or None,
                prefix="number_of_properties",
                instance=data[data_idx["number_of_properties"]] if data[data_idx["number_of_properties"]] else None,
            ),
            StepThreeApplicationForm(
                request.POST or None,
                prefix="application",
                instance=data[data_idx["application"]] if data[data_idx["application"]] else None,
            ),
        ]
    except Exception as e:
        basic_log(function_name, e, decedent.user, "POSTでのフォームのインスタンス生成に失敗しました")
        raise e

def get_formsets_idx_for_step_three():
    idxs = {
        "child": 0,
        "child_spouse": 1,
        "grand_child": 2,
        "ascendant": 3,
        "collateral": 4,
        "land": 5,
        "land_acquirer": 6,
        "land_cash_acquirer": 7,
        "house": 8,
        "house_acquirer": 9,
        "house_cash_acquirer": 10,
        "bldg": 11,
        "site": 12,
        "bldg_acquirer": 13,
        "bldg_cash_acquirer": 14,
    }
    return idxs

def get_form_sets_for_step_three_post(request, form_sets, form_sets_idxs, data, data_idxs):
    form_sets =[
        form_sets[form_sets_idxs["child"]](
            request.POST or None,
            initial=get_descendant_or_collateral_initial_data(data[data_idxs["child"]], Descendant),
            prefix="child",
        ),
        form_sets[form_sets_idxs["child_spouse"]](
            request.POST or None,
            initial=get_spouse_or_ascendant_initial_data(data[data_idxs["child_spouse"]]),
            prefix="child_spouse",
        ),
        form_sets[form_sets_idxs["grand_child"]](
            request.POST or None,
            initial=get_descendant_or_collateral_initial_data(data[data_idxs["grand_child"]], Descendant),
            prefix="grand_child",
        ),
        form_sets[form_sets_idxs["ascendant"]](
            request.POST or None,
            initial=get_spouse_or_ascendant_initial_data(data[data_idxs["ascendant"]]),
            prefix="ascendant",
        ),
        form_sets[form_sets_idxs["collateral"]](
            request.POST or None,
            initial=get_descendant_or_collateral_initial_data(data[data_idxs["collateral"]], Collateral),
            prefix="collateral",
        ),
        form_sets[form_sets_idxs["land"]](
            request.POST or None,
            initial=get_property_initial_data(data[data_idxs["land"]]),
            prefix="land",
        ),
        form_sets[form_sets_idxs["land_acquirer"]](
            request.POST or None,
            initial=get_acquirer_initial_data(data[data_idxs["land_acquirer"]]), 
            prefix="land_acquirer",
        ),
        form_sets[form_sets_idxs["land_cash_acquirer"]](
            request.POST or None,
            initial=get_acquirer_initial_data(data[data_idxs["land_cash_acquirer"]]), 
            prefix="land_cash_acquirer",
        ),
        form_sets[form_sets_idxs["house"]](
            request.POST or None,
            initial=get_property_initial_data(data[data_idxs["house"]]),
            prefix="house",
        ),
        form_sets[form_sets_idxs["house_acquirer"]](
            request.POST or None,
            initial=get_acquirer_initial_data(data[data_idxs["house_acquirer"]]),
            prefix="house_acquirer",
        ),
        form_sets[form_sets_idxs["house_cash_acquirer"]](
            request.POST or None,
            initial=get_acquirer_initial_data(data[data_idxs["house_cash_acquirer"]]),
            prefix="house_cash_acquirer",
        ),
        form_sets[form_sets_idxs["bldg"]](
            request.POST or None,
            initial=get_property_initial_data(data[data_idxs["bldg"]]), 
            prefix="bldg",
        ),
        form_sets[form_sets_idxs["site"]](
            request.POST or None,
            initial=get_property_initial_data(data[data_idxs["site"]]),
            prefix="site",
        ),
        form_sets[form_sets_idxs["bldg_acquirer"]](
            request.POST or None, 
            initial=get_acquirer_initial_data(data[data_idxs["bldg_acquirer"]]),
            prefix="bldg_acquirer",
        ),
        form_sets[form_sets_idxs["bldg_cash_acquirer"]](
            request.POST or None, 
            initial=get_acquirer_initial_data(data[data_idxs["bldg_cash_acquirer"]]),
            prefix="bldg_cash_acquirer",
        ),
    ]    
    return form_sets

def step_three(request):
    """
    
        詳細データ入力ページの処理
        
    """
    FORM_SET_CONFIGURATION = [
        (StepThreeDescendantForm, 0, 15),
        (StepThreeSpouseForm, 0, 15),
        (StepThreeDescendantForm, 0, 15),
        (StepThreeAscendantForm, 0, 15),
        (StepThreeCollateralForm, 0, 15),
        (StepThreeLandForm, 1, 20),
        (StepThreeLandAcquirerForm, 1, 20),
        (StepThreeLandCashAcquirerForm, 1, 20),
        (StepThreeHouseForm, 1, 20),
        (StepThreeHouseAcquirerForm, 1, 20),
        (StepThreeHouseCashAcquirerForm, 1, 20),
        (StepThreeBldgForm, 1, 20),
        (StepThreeSiteForm, 1, 20),
        (StepThreeBldgAcquirerForm, 1, 20),
        (StepThreeBldgCashAcquirerForm, 1, 20),    
    ]
    
    function_name = get_current_function_name()
    this_html = "toukiApp/step_three.html"
    this_url_name = "toukiApp:step_three"
    next_url_name = "toukiApp:step_four"
    step_progress = 3
    
    try:
        response, user, decedent = check_user_and_decedent(request)
        if response:
            return response
        
        progress = decedent.progress
        if not is_fulfill_required_progress(progress, step_progress):
            return redirect_to_progress_page(request)
        
        #被相続人に紐づくデータを取得する
        data = get_all_decedent_related_data(decedent)
        data_idx = get_data_idx_for_step_three()
        
        #フォームセットを生成
        form_sets = create_formsets_by_configuration(FORM_SET_CONFIGURATION)
        form_sets_idx = get_formsets_idx_for_step_three()

        #フォームからデータがPOSTされたとき
        if request.method == "POST":

            if not is_progress_equal_to_step(progress, step_progress):
                return redirect_to_progress_page(request)

            #フォームセットの属性を更新
            forms = get_forms_for_step_three_post(request, decedent, data, data_idx)
            form_sets = get_form_sets_for_step_three_post(request, form_sets, form_sets_idx, data, data_idx)

            if all(form.is_valid() for form in forms) and all(form_set.is_valid() for form_set in form_sets):
                try:
                    with transaction.atomic():

                        save_step_three_datas(user, forms, form_sets, data, data_idx)
                        
                        return redirect(next_url_name)
                except Exception as e:
                    basic_log(function_name, e, user, "POSTのフォーム検証後にエラー")
                    raise e
            else:
                for form in forms:
                    if not form.is_valid():
                        basic_log(function_name, None, user, f"{form}で入力エラー: {form.errors}")
                        
                for form_set in form_sets:
                    if not form_set.is_valid():
                        basic_log(function_name, None, user, f"{form_set}で入力エラー: {form_set.errors}")
                        
                return redirect(this_url_name)
        
        #入力が完了している項目を取得するための配列
        user_data_scope = [] 
        progress = decedent.progress
        #被相続人のデータを初期値にセットしたフォーム
        decedent_form = StepThreeDecedentForm(prefix="decedent", instance=decedent)
                    
        #配偶者
        spouse_data = data[data_idx["spouse"]]
        if spouse_data.is_exist:
            spouse_form = StepThreeSpouseForm(prefix="spouse", instance=spouse_data)
            if step_three_input_status(spouse_data):
                user_data_scope.append("spouse")
        else:
            spouse_form = None
        
        #子
        child_data = data[data_idx["child"]]
        if child_data.exists():
            child_forms = form_sets[form_sets_idx["child"]](
                initial=get_descendant_or_collateral_initial_data(child_data, Descendant),
                prefix="child"
            )
            if step_three_input_status(child_data):
                user_data_scope.append("child")
        else:
            child_forms = form_sets[form_sets_idx["child"]](prefix="child")
            
        #子の配偶者
        child_spouse_data = data[data_idx["child_spouse"]]
        if child_spouse_data.exists():
            child_spouse_forms = form_sets[form_sets_idx["child_spouse"]](
                initial=get_spouse_or_ascendant_initial_data(child_spouse_data), 
                prefix="child_spouse")
            if step_three_input_status(child_spouse_data):
                user_data_scope.append("child_spouse")
        else:
            child_spouse_forms = form_sets[form_sets_idx["child_spouse"]](prefix="child_spouse")
            
        #孫
        grand_child_data = data[data_idx["grand_child"]]
        if grand_child_data.exists():
            grand_child_forms = form_sets[form_sets_idx["grand_child"]](
                initial=get_descendant_or_collateral_initial_data(grand_child_data, Descendant),
                prefix="grand_child"
            )
            if step_three_input_status(grand_child_data):
                user_data_scope.append("grand_child")
        else:
            grand_child_forms = form_sets[form_sets_idx["grand_child"]](prefix="grand_child")
            
        #尊属
        ascendant_data = data[data_idx["ascendant"]]
        if ascendant_data.exists():
            ascendant_forms = form_sets[form_sets_idx["ascendant"]](
                initial=get_spouse_or_ascendant_initial_data(ascendant_data),
                prefix="ascendant")
            if step_three_input_status(ascendant_data):
                user_data_scope.append("ascendant")
        else:
            ascendant_forms = form_sets[form_sets_idx["ascendant"]](prefix="ascendant")
            
        #兄弟姉妹
        collateral_data = data[data_idx["collateral"]]
        if collateral_data.exists():
            collateral_forms = form_sets[form_sets_idx["collateral"]](
                initial=get_descendant_or_collateral_initial_data(collateral_data, Collateral),
                prefix="collateral"
            )
            if step_three_input_status(collateral_data):
                user_data_scope.append("collateral")
        else:
            collateral_forms = form_sets[form_sets_idx["collateral"]](prefix="collateral")
            
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
            form_set = formset_factory(
                form=StepThreeLandForm,
                extra=0,
                max_num=20
            )
            land_forms = form_set(
                initial=get_property_initial_data(land_data),
                prefix="land"
            )
            if step_three_input_status(land_data):
                user_data_scope.append("land")
        else:
            land_forms = form_sets[form_sets_idx["land"]](prefix="land")
            
        #土地取得者
        land_acquirer_data = data[data_idx["land_acquirer"]]
        if land_acquirer_data.exists():
            form_set = formset_factory(
                form=StepThreeLandAcquirerForm,
                extra=0,
                max_num=20
            )
            land_acquirer_forms = form_set(
                initial=get_acquirer_initial_data(land_acquirer_data), 
                prefix="land_acquirer"
            )
            if step_three_input_status(land_acquirer_data):
                user_data_scope.append("land_acquirer")
        else:
            land_acquirer_forms = form_sets[form_sets_idx["land_acquirer"]](prefix="land_acquirer")
            
        #土地金銭取得者
        land_cash_acquirer_data = data[data_idx["land_cash_acquirer"]]
        if land_cash_acquirer_data.exists():
            form_set = formset_factory(
                form=StepThreeLandCashAcquirerForm,
                extra=0,
                max_num=20
            )
            land_cash_acquirer_forms = form_set(
                initial=get_acquirer_initial_data(land_cash_acquirer_data),
                prefix="land_cash_acquirer"
            )
            if step_three_input_status(land_cash_acquirer_data):
                user_data_scope.append("land_cash_acquirer")
        else:
            land_cash_acquirer_forms = form_sets[form_sets_idx["land_cash_acquirer"]](prefix="land_cash_acquirer")
        
        #建物
        house_data = data[data_idx["house"]]
        if house_data.exists():
            form_set = formset_factory(
                form=StepThreeHouseForm,
                extra=0,
                max_num=20
            )
            house_forms = form_set(
                initial=get_property_initial_data(house_data),
                prefix="house"
            )
            if step_three_input_status(house_data):
                user_data_scope.append("house")
        else:
            house_forms = form_sets[form_sets_idx["house"]](prefix="house")
        
        #建物取得者
        house_acquirer_data = data[data_idx["house_acquirer"]]
        if house_acquirer_data.exists():
            form_set = formset_factory(
                form=StepThreeHouseAcquirerForm,
                extra=0,
                max_num=20
            )
            house_acquirer_forms = form_set(
                initial=get_acquirer_initial_data(house_acquirer_data),
                prefix="house_acquirer"
            )
            if step_three_input_status(house_acquirer_data):
                user_data_scope.append("house_acquirer")
        else:
            house_acquirer_forms = form_sets[form_sets_idx["house_acquirer"]](prefix="house_acquirer")
        
        #建物金銭取得者
        house_cash_acquirer_data = data[data_idx["house_cash_acquirer"]]
        if house_cash_acquirer_data.exists():
            form_set = formset_factory(
                form=StepThreeHouseCashAcquirerForm, 
                extra=0,
                max_num=20
            )
            house_cash_acquirer_forms = form_set(
                initial=get_acquirer_initial_data(house_cash_acquirer_data),
                prefix="house_cash_acquirer"
            )
            if step_three_input_status(house_cash_acquirer_data):
                user_data_scope.append("house_cash_acquirer")
        else:
            house_cash_acquirer_forms = form_sets[form_sets_idx["house_cash_acquirer"]](prefix="house_cash_acquirer")    
        
        #区分建物
        bldg_data = data[data_idx["bldg"]]
        if bldg_data.exists():
            form_set = formset_factory(
                form=StepThreeBldgForm,
                extra=0,
                max_num=20
            )
            bldg_forms = form_set(
                initial=get_property_initial_data(bldg_data), 
                prefix="bldg"
            )
            if step_three_input_status(bldg_data):
                user_data_scope.append("bldg")
        else:
            bldg_forms = form_sets[form_sets_idx["bldg"]](prefix="bldg")
        
        #敷地権
        site_data = data[data_idx["site"]]
        if site_data.exists():
            form_set = formset_factory(
                form=StepThreeSiteForm,
                extra=0,
                max_num=20
            )
            site_forms = form_set(
                initial=get_property_initial_data(site_data),
                prefix="site"
            )
            if step_three_input_status(site_data):
                user_data_scope.append("site")
        else:
            site_forms = form_sets[form_sets_idx["site"]](prefix="site")
        
        #区分建物取得者
        bldg_acquirer_data = data[data_idx["bldg_acquirer"]]
        if bldg_acquirer_data.exists():
            form_set = formset_factory(
                form=StepThreeBldgAcquirerForm,
                extra=0,
                max_num=20
            )
            bldg_acquirer_forms = form_set(
                initial=get_acquirer_initial_data(bldg_acquirer_data),
                prefix="bldg_acquirer"
            )
            if step_three_input_status(bldg_acquirer_data):
                user_data_scope.append("bldg_acquirer")
        else:
            bldg_acquirer_forms = form_sets[form_sets_idx["bldg_acquirer"]](prefix="bldg_acquirer")
        
        #区分建物金銭取得者
        bldg_cash_acquirer_data = data[data_idx["bldg_cash_acquirer"]]
        if bldg_cash_acquirer_data.exists():
            form_set = formset_factory(
                form=StepThreeBldgCashAcquirerForm, 
                extra=0,
                max_num=20
            )
            bldg_cash_acquirer_forms = form_set(
                initial=get_acquirer_initial_data(bldg_cash_acquirer_data),
                prefix="bldg_cash_acquirer"
            )
            if step_three_input_status(bldg_cash_acquirer_data):
                user_data_scope.append("bldg_cash_acquirer")
        else:
            bldg_cash_acquirer_forms = form_sets[form_sets_idx["bldg_cash_acquirer"]](prefix="bldg_cash_acquirer")
            
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
            "user_email" : user.email,
            "user_data_scope": json.dumps(user_data_scope),
            "decedent": decedent,
            "decedent_form": decedent_form,
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
            "company_data": CompanyData,
            "sections" : Sections.SECTIONS[Sections.STEP3],
            "service_content" : Sections.SERVICE_CONTENT,
        }
        return render(request, this_html, context)
    except Exception as e:
        return handle_error(
            e,
            request,
            request.user,
            function_name,
            this_url_name
        )

def check_user_and_decedent(request):
    """ページへのアクセス権限判定"""
    function_name = get_current_function_name()
    login_url_name = "account_login"
    first_step_url_name = "toukiApp:step_one"
    
    try:
        if not request.user.is_authenticated:
            messages.error(request, "アクセス不可 会員専用のページです。先に会員登録をお願いします。")
            basic_log(function_name, None, None, "非会員が会員専用のページにアクセスを試みました")
            return redirect(login_url_name), None, None
        
        user = User.objects.get(email=request.user.email)
        decedent = user.decedent.first()
        
        if not decedent:
            messages.error(request, "アクセス不可 被相続人のデータがまだ登録されていません。\n先に１．基本データ入力の入力をお願いします。")
            basic_log(function_name, None, user, "step_oneが未了の会員がその先のページにアクセスを試みました")
            return redirect(first_step_url_name), None, None
        
    except Exception as e:
        raise e

    return None, user, decedent

#
# ステップ4
# 

def step_four(request):
    """ステップ４のメイン処理

        遺産分割協議証明書、相続関係説明図、登記申請書、委任状へのリンクを表示する
    """
    function_name = get_current_function_name()
    this_html = "toukiApp/step_four.html"
    this_url_name = "toukiApp:step_four"
    step_progress = 4
    
    try:   
        response, user, decedent = check_user_and_decedent(request)
        if response:
            return response

        progress = decedent.progress
        if not is_fulfill_required_progress(progress, step_progress):
            return redirect_to_progress_page(request)
        
        if request.method == "POST":
            try:
                if not is_progress_equal_to_step(progress, step_progress):
                    return redirect_to_progress_page(request)
                
                with transaction.atomic():
                    decedent.progress = step_progress + 1
                    decedent.save()
                    
                    return redirect('toukiApp:step_five')
            except Exception as e:
                basic_log(function_name, e, user, "POSTでエラー")
                raise e
                
        #相続人情報を取得
        heirs = get_legal_heirs(decedent)
        minors = get_filtered_instances(heirs, "is_adult", False)
        overseas = get_filtered_instances(heirs, "is_japan", False)

        #委任者と通数、受任者氏名を取得する
        principal_names_and_POA_count, agent_name = get_principal_names_and_POA_count_and_agent_name(decedent)

        context = {
            "title" : Service.STEP_TITLES["four"],
            "user" : user,
            "decedent": decedent,
            "progress": progress,
            "heirs": heirs,
            "minors": minors,
            "overseas": overseas,
            "principal_names_and_POA_count": principal_names_and_POA_count,
            "agent_name": agent_name,
            "sections" : Sections.SECTIONS[Sections.STEP4],
            "service_content" : Sections.SERVICE_CONTENT,
        }
        return render(request, this_html, context)
    
    except Exception as e:
        return handle_error(
            e, 
            request, 
            request.user,
            function_name, 
            this_url_name
        )

def get_principal_names_and_POA_count_and_agent_name(decedent):
    """委任者の氏名、委任状通数と代理人の氏名を取得する

    Args:
        decedent (_type_): _description_

    Raises:
        ValidationError: _description_

    Returns:
        _type_: _description_
    """
    application = get_querysets_by_condition(Application, decedent, is_first=True, check_exsistance=True)
    #申請人データを除く（別途の加工が必要なため） 
    data = get_data_for_application_form(decedent, False)
    
    is_only_acquirer = all(len(d[1]) == 1 for d in data)
            
    #代理人を使用しない、かつ取得者が１人のとき委任状不要
    is_agent = application.is_agent
    if is_agent == False and is_only_acquirer:
        return None, None

    result = []
    for d in data:
        temp = []
        seen_temp = set()  # temp内で見たacquirerの識別子を追跡
        for a in d[1]:
            acquirer_identifier = (a["acquirer_type"].lower(), a["acquirer_id"], a["name"])
            if acquirer_identifier not in seen_temp:
                seen_temp.add(acquirer_identifier)
                acquirer = {
                    "model_name": acquirer_identifier[0],
                    "id": acquirer_identifier[1],
                    "name": acquirer_identifier[2],
                }
                temp.append(acquirer)
        result.extend(temp)

    # acquirer_listsを辞書のリストから、キーをユニーク識別子とする辞書へと変更
    acquirer_dict = {}
    for acquirer in result:
        # ユニークなキーを生成（model_name, id, nameの組み合わせ）
        unique_key = (acquirer['model_name'], acquirer['id'])

        if unique_key in acquirer_dict:
            # 既に辞書に存在する場合はcountを増やす
            acquirer_dict[unique_key]['count'] += 1
        else:
            # 存在しない場合は、新しいエントリを作成
            acquirer_dict[unique_key] = acquirer.copy()
            acquirer_dict[unique_key]['count'] = 1

    # 最終的なリスト形式が必要な場合、辞書からリストへ変換
    acquirer_lists = list(acquirer_dict.values())

    #代理人の氏名を取得する
    agent_name = None
    if is_agent:
        agent_name = application.agent_name
    else:
        applicant = {
            "model_name": application.content_type.model,
            "id": application.object_id,
        }
        # acquirer_listsの辞書からagent_nameを探し、見つかったら削除
        unique_key_applicant = (applicant['model_name'], applicant['id'])
        if unique_key_applicant in acquirer_dict:
            # agent_nameに一致する要素のnameを代入
            agent_name = acquirer_dict[unique_key_applicant]['name']
            # 辞書から該当する要素を削除
            del acquirer_dict[unique_key_applicant]

        # 必要に応じて、辞書からリストへ再変換
        acquirer_lists = list(acquirer_dict.values())

    return acquirer_lists, agent_name
    

def step_division_agreement(request):
    """
    
        遺産分割協議証明書を表示するページ

    """
    try:
        function_name = get_current_function_name()
        this_html = "toukiApp/step_division_agreement.html"
        redirect_to = "toukiApp:step_four"
        
        responese, user, decedent = check_user_and_decedent(request)
        if responese:
            return responese
        
        progress = decedent.progress
        
        #被相続人の氏名、生年月日、死亡年月日、死亡時の本籍、死亡時の住所
        decedent_info = get_decedent_info_for_document(decedent)
        
        property_acquirer_data = PropertyAcquirer.objects.filter(decedent=decedent).select_related('content_type1', 'content_type2')
        cash_acquirer_data = CashAcquirer.objects.filter(decedent=decedent).select_related('content_type1', 'content_type2')
        sites = Site.objects.filter(decedent=decedent)
        
        #区分建物データがあるとき、敷地権データも存在するかチェック
        check_bldg_and_site_related(property_acquirer_data, sites)
        
        #換価しない不動産と相続人を紐づける
        normal_division_properties = get_normal_division_properties(property_acquirer_data, cash_acquirer_data)
        
        #換価する不動産と相続人を紐づける
        exchange_division_properties = None
        if cash_acquirer_data.exists():
            exchange_division_properties = get_exchange_division_properties(property_acquirer_data, cash_acquirer_data)
        
        context = {
            "title" : "遺産分割協議証明書",
            "company_data": CompanyData,
            "progress": progress,
            "user_email": user.email,
            "decedent_info": decedent_info,
            "normal_division_properties": normal_division_properties,
            "exchange_division_properties": exchange_division_properties,
            "sites": sites,
        }
        return render(request, this_html, context)
    except Exception as e:
        return handle_error(
            e, 
            request,
            request.user,
            function_name, 
            redirect_to
        )

def check_bldg_and_site_related(acquirer_data, site_data):
    """区分建物と敷地権のデータが正確に紐づいているか判別する

    Args:
        acquirer_data (_type_): _description_
        site_data (_type_): _description_
    """
    function_name = get_current_function_name()
    bldg_content_type = ContentType.objects.get_for_model(Bldg)
    bldg_related_acquirers = acquirer_data.filter(content_type1=bldg_content_type)
    #区分建物も敷地権もないとき処理をしない
    if not bldg_related_acquirers.exists() and not site_data.exists():
        return True
    
    #区分建物もしくは敷地権のどちらかしかないときエラー
    if bldg_related_acquirers.exists() != site_data.exists():
        raise ValidationError(function_name + "区分建物と敷地権のデータの数が不正です")
    
    #敷地権が全て区分建物と関連付けされているか判別する
    bldg_ids = set(bldg.object_id1 for bldg in bldg_related_acquirers)
    for site in site_data:
        if site.bldg.id not in bldg_ids:
            raise ValidationError(f"{function_name}: 区分建物と関連付けされてない敷地権があります。")
        
    # フィルタリングされたクエリセットにレコードが存在するか判別
    return True

def get_unique_property_acquirer_data(property_acquirer_data, cash_acquirer_data):
    """通常分割の不動産データを取得する

    Args:
        property_acquirer_data (_type_): _description_
        cash_acquirer_data (_type_): _description_

    Returns:
        _type_: _description_
    """
    # Step 1: CashAcquirerのcontent_type1とobject_id1の組み合わせのセットを作成
    cash_content_object1_set = {
        (obj.content_type1_id, obj.object_id1) for obj in cash_acquirer_data
    }

    # Step 2: PropertyAcquirerのレコードをループして、cash_acquirer_dataに含まれないcontent_object1を持つレコードのみを抽出
    return [
        obj for obj in property_acquirer_data
        if (obj.content_type1_id, obj.object_id1) not in cash_content_object1_set
    ]

def get_base_normal_division_data(data):
    """_summary_

    Args:
        data (_type_): _description_

    Returns:
        _type_: _description_
    """
    # PropertyAcquirer インスタンスをループ
    formatted_data = defaultdict(list)
    for d in data:
        content_object1 = d.content_object1
        name = d.content_object2.name
        percentage = d.percentage
        # content_object1をキーとして、content_object2の名前と取得割合のマッピングを追加
        formatted_data[content_object1].append({name: percentage})
        
    return formatted_data

def get_content_object1_duplicate_checked_data(data):
    """_summary_

    Args:
        data (_type_): _description_

    Returns:
        _type_: _description_
    """
    formatted_data = []
    for content_object1, mappings in data.items():
        formatted_data.append((content_object1, mappings))
        
    return formatted_data

def get_group_properties_by_mappings(data):
    """_summary_

    Args:
        data (_type_): _description_

    Returns:
        _type_: _description_
    """
    formatted_data = defaultdict(list)

    # content_object1_duplicate_checked_dataはステップ1で作成したデータ
    for content_object1, mappings in data:
        # mappingsは[{content_object2.name: percentage}, ...]のリスト
        # mappingsを一意のキーとして使用
        key = frozenset((name, percentage) for mapping in mappings for name, percentage in mapping.items())
        formatted_data[key].append(content_object1)
        
    return formatted_data

def get_normal_division_properties(property_acquirer_data, cash_acquirer_data):
    """換価しない不動産情報を取得する
    
    取得者が重複する不動産はまとめて表示する
    返すデータ形式(
        [不動産データ],
        [{"不動産取得者名": "取得割合"}]
    )
    
    Args:
        decedent (_type_): _description_
    """
    
    function_name = get_current_function_name()
    
    try:
        #通常分割の不動産データを取得する
        first_data = get_unique_property_acquirer_data(property_acquirer_data, cash_acquirer_data)
        
        # PropertyAcquirer インスタンスをループ
        second_data = get_base_normal_division_data(first_data)

        # 最終的なデータ構造を準備
        third_data = get_content_object1_duplicate_checked_data(second_data)

        # ステップ1: グループ化のための辞書を準備
        fourth_data = get_group_properties_by_mappings(third_data)

        # ステップ2: 最終的なデータ構造を生成
        return [(content_objects, [dict([item]) for item in key]) for key, content_objects in fourth_data.items()]

    except Exception as e:
        basic_log(function_name, e, None, "換価しない不動産情報の取得に失敗しました")
        raise e

def get_integrated_acquirers(property_acquirers, cash_acquirers):
    """不動産、不動産取得者、金銭取得者を関連付けして不動産の重複をなくしたデータを返す

    Args:
        property_acquirers (_type_): _description_
        cash_acquirers (_type_): _description_
    """
    formatted_data = defaultdict(lambda: {'property_acquirers': {}, 'cash_acquirers': {}})
    
    # content_object1をキーとする辞書を作成
    property_dict = defaultdict(dict)
    for acquirer in property_acquirers:
        key = (acquirer.content_type1.model, acquirer.object_id1)
        property_dict[key][acquirer.content_object2.name] = acquirer.percentage

    cash_dict = defaultdict(dict)
    for acquirer in cash_acquirers:
        key = (acquirer.content_type1.model, acquirer.object_id1)
        cash_dict[key][acquirer.content_object2.name] = acquirer.percentage

    # property_acquirers と cash_acquirers の共通キーでデータをマージ
    for key in property_dict.keys() & cash_dict.keys():
        formatted_data[key]['property_acquirers'] = property_dict[key]
        formatted_data[key]['cash_acquirers'] = cash_dict[key]
                
    return formatted_data

def get_base_exchange_data(data):
    """換価データの形式に変換したデータを返す

    Args:
        data (_type_): _description_

    Returns:
        _type_: _description_
    """
    return [
        ([{ct1_model: obj_id1}],
         [{key: value} for key, value in acquirers['property_acquirers'].items()],
         [{key: value} for key, value in acquirers['cash_acquirers'].items()])
        for (ct1_model, obj_id1), acquirers in data.items()
    ]

def get_unique_exchange_data(data):
    """取得者の重複を解消したデータを返す

    Args:
        data (_type_): _description_

    Returns:
        _type_: _description_
    """
    formatted_data = defaultdict(lambda: {'models': [], 'property_acquirers': [], 'cash_acquirers': []})

    for record in data:
        ct1_model_obj_id_list, property_acquirers, cash_acquirers = record
        # 辞書型からリストへ変換して比較可能な形式にする
        property_acquirers_dict = {list(item.keys())[0]: list(item.values())[0] for item in property_acquirers}
        cash_acquirers_dict = {list(item.keys())[0]: list(item.values())[0] for item in cash_acquirers}
        
        # property_acquirersとcash_acquirersの組み合わせをキーとする
        key = (frozenset(property_acquirers_dict.items()), frozenset(cash_acquirers_dict.items()))
        
        # すでに存在する組み合わせの場合は、modelsのリストにct1_modelとobj_id1を追加
        formatted_data[key]['models'].extend(ct1_model_obj_id_list)
        if not formatted_data[key]['property_acquirers']:
            formatted_data[key]['property_acquirers'].extend(property_acquirers)
        if not formatted_data[key]['cash_acquirers']:
            formatted_data[key]['cash_acquirers'].extend(cash_acquirers)
    
    return formatted_data

def get_completed_exchange_data(data):
    """テンプレートに渡す形に整形した換価不動産データを返す

    Args:
        data (_type_): _description_

    Returns:
        _type_: _description_
    """
    # モデルインスタンスを格納するための辞書を用意
    model_instances_cache = {}

    # ContentTypeのキャッシュを用意
    content_type_cache = {}

    formatted_data = []

    for key, value in data.items():
        real_models = []

        for model_dict in value['models']:
            for model_name, model_id in model_dict.items():
                # ContentTypeとモデルインスタンスのキャッシュを使用
                model_key = (model_name, model_id)
                if model_key not in model_instances_cache:
                    if model_name not in content_type_cache:
                        content_type_cache[model_name] = ContentType.objects.get(model=model_name)
                    ct = content_type_cache[model_name]
                    model_class = ct.model_class()
                    model_instance = model_class.objects.get(id=model_id)
                    model_instances_cache[model_key] = model_instance
                else:
                    model_instance = model_instances_cache[model_key]
                
                real_models.append(model_instance)

        value['models'] = real_models
        formatted_data.append((value['models'], value['property_acquirers'], value['cash_acquirers']))

    return formatted_data
            
def get_exchange_division_properties(property_acquirer_data, cash_acquirer_data):
    """換価する不動産情報を取得する
    
    取得者が重複する不動産はまとめて表示する
    返すデータ形式(
        [不動産データ],
        [{"不動産取得者名": "取得割合"}],
        [{"金銭取得者名": "取得割合"}]
    )
    Args:
        decedent (_type_): _description_
    """
    try:
        # 不動産、不動産取得者、金銭取得者を連結して不動産の重複をなくす
        first_data = get_integrated_acquirers(property_acquirer_data, cash_acquirer_data)
        
        # テンプレートに渡すデータ形式に変換
        second_data = get_base_exchange_data(first_data)

        # 取得者の重複をなくす
        third_data = get_unique_exchange_data(second_data)

        # 不動産のデータに入れ替えて完成させる
        return get_completed_exchange_data(third_data)
    
    except (HTTPError, ConnectionError, Timeout, DatabaseError) as e:
        raise e
    except Exception as e:
        raise e

def get_decedent_info_for_document(decedent):
    """書類作成に必要な被相続人情報を取得する

    氏名、生年月日、死亡年月日、住所、本籍
    """
    
    function_name = get_current_function_name()
    
    info = defaultdict(dict)
    
    try:
        info["name"] = decedent.name
        
        end_idx = len(decedent.birth_year) - 1
        info["birth_date"] = decedent.birth_year[5:end_idx] + decedent.birth_month + "月" + decedent.birth_date + "日"
        
        end_idx = len(decedent.death_year) - 1
        info["death_date"] = decedent.death_year[5:end_idx] + decedent.death_month + "月" + decedent.death_date + "日"
        
        permanent_full_address = get_full_address(decedent, is_domicile=True)
        info["permanent_address"] = format_address(permanent_full_address)
        
        full_address = get_full_address(decedent)
        info["address"] = format_address(full_address)
        
        return info
    
    except Exception as e:
        basic_log(function_name, e, None, "書類作成に必要な被相続人情報の取得に失敗しました")
        raise e

def step_diagram(request):
    """相続関係説明図の表示"""
    try:
        function_name = get_current_function_name()
        this_html = "toukiApp/step_diagram.html"
        redirect_to = "toukiApp/step_four"
        
        response, user, decedent = check_user_and_decedent(request)
        if response:
            return response
        
        progress = decedent.progress
        
        #被相続人データを取得する
        decedent_info = get_decedent_info_for_document(decedent)

        #申請データを取得する
        application_data = get_data_for_application_form(decedent, False)
        
        #相続人、関係者全員のデータを取得する
        related_persons_data = get_decedent_related_persons_data(decedent)
        
        #相続関係説明図用のデータに加工する
        diagram_data = get_diagram_data(application_data, related_persons_data)
        
        context = {
            "title": "相続関係説明図",
            "progress": progress,
            "company_data": CompanyData,
            "user_email": user.email,
            "decedent_info": decedent_info,
            "diagram_data": diagram_data,
            "related_persons_data": related_persons_data,
        }
        
        return render(request, this_html, context)
    
    except Exception as e:
        return handle_error(
            e, 
            request, 
            request.user,
            function_name, 
            redirect_to, 
        )

def get_spouse_data_for_diagram(data, acquirers_list):
    """相続関係図用の被相続人の配偶者データを取得します。

    :param data: データオブジェクト
    :param acquirers_list: 取得者のリスト
    :return: 図表用の配偶者データを含む辞書
    """
    
    function_name = get_current_function_name()
    
    try:
        form = get_diagram_person_form()
        form.update({
            "type": "spouse",
            "id": data.id,
            "name": data.name,
            "birth_date": get_wareki(data, True),
            "relation_type1": "decedent",
            "relation_id1": data.object_id,
        })
        
        #生存確認
        if data.is_live == False:
            form["death_date"] = get_wareki(data, False)
            return { "spouse": form }
        
        #相続放棄
        if data.is_refuse:
            form["position"] = "相続放棄"
            return { "spouse": form }
        
        #取得者確認
        matched_acquirer = next((x for x in acquirers_list if (x["acquirer_type"], x["acquirer_id"]) == (data.__class__.__name__, data.id)), None)
        if matched_acquirer:
            form["address"] = format_address(matched_acquirer["address"])
            form["position"] = "相続"
        else:
            form["position"] = "分割"
            
        return { "spouse": form }
    
    except Exception as e:
        basic_log(function_name, e, None, "相続関係図用の被相続人の配偶者データの取得に失敗しました。")
        raise e

def get_grand_child_data_for_diagram(data, acquirers_list):
    """相続関係説明図用の孫データを取得します。"""
    
    function_name = get_current_function_name()
    
    grand_childs = []
    
    try:
        for d in data:
            form = get_diagram_person_form()
        
            is_step_grand_child = d.content_type2.model_class() == RelatedIndividual
            form.update({
                "type": "step_grand_child" if is_step_grand_child else "grand_child",
                "id": d.id,
                "name": d.name,
                "birth_date": get_wareki(d, True),
                "relation_type1": "child",
                "relation_id": d.object_id1,
                "relation_type2": "child_ex_spouse" if is_step_grand_child else "child_spouse",
                "relation_id2": d.object_id2,
            })
            #生存確認
            if d.is_live == False:
                form["death_date"] = get_wareki(d, False)
                grand_childs.append(form)
                continue
            #相続放棄
            if d.is_refuse:
                form["position"] = "相続放棄"
                grand_childs.append(form)
                continue
            #取得者確認
            matched_acquirer = next((x for x in acquirers_list if (x["acquirer_type"], x["acquirer_id"]) == (d.__class__.__name__, d.id)), None)
            if matched_acquirer:
                form["address"] = format_address(matched_acquirer["address"])
                form["position"] = "相続"
            else:
                form["position"] = "分割"
            
            grand_childs.append(form)
            
        # ソート処理
        type_priority = {'grand_child': 0, 'step_grand_child': 1}
        grand_childs_sorted = sorted(grand_childs, key=lambda x: (x['relation_id'], type_priority[x['type']]))
        return { "grand_childs": grand_childs_sorted }
    
    except Exception as e:
        raise Exception(f"{function_name}でエラー発生：{e}\ndata={data}\nacquirers_list={acquirers_list}")

def get_ascendant_data_for_diagram(data, acquirers_list):
    """相続関係図用の尊属データを取得します。"""
    
    function_name = get_current_function_name()
    
    parents = []
    grand_parents = []
    
    try:
        for d in data:
            form = get_diagram_person_form()

            is_content_type_decedent = d.content_type.model_class() == Decedent
            form.update({
                "type": "parents" if is_content_type_decedent else "grand_parents",
                "id": d.id,
                "name": d.name,
                "birth_date": get_wareki(d, True),
                "relation_type1": "decedent" if is_content_type_decedent else "parents",
                "relation_id1": d.object_id,
            })
            
            #生存確認
            if d.is_live == False:
                form["death_date"] = get_wareki(d, False)
                parents.append(form) if is_content_type_decedent else grand_parents.append(form)
                continue
            
            #相続放棄
            if d.is_refuse:
                form["position"] = "相続放棄"
                parents.append(form) if is_content_type_decedent else grand_parents.append(form)
                continue
            
            #取得者確認
            matched_acquirer = next((x for x in acquirers_list if (x["acquirer_type"], x["acquirer_id"]) == (d.__class__.__name__, d.id)), None)
            if matched_acquirer:
                form["address"] = format_address(matched_acquirer["address"])
                form["position"] = "相続"
            else:
                form["position"] = "分割"
                
            parents.append(form) if is_content_type_decedent else grand_parents.append(form)
            
        return { 
            "parents" : parents,
            "grand_parents": grand_parents
        }
        
    except Exception as e:
        basic_log(function_name, e, None, "相続関係図用の尊属データの取得に失敗しました")
        raise e

def get_related_indivisual_data_for_diagram(data, key):
    """相続関係図用の関係者データを取得します。"""
    
    
    def get_relation_type(key: str) -> tuple[str, str]:
        """続柄に基づいて関連タイプを返します。"""
        
        relationship_map = {
            "ex_spouses": ("ex_spouse", "step_child"),
            "child_ex_spouses": ("child_ex_spouse", "grand_child"),
            "other_fathers": ("other_father", "collateral"),
            "other_mothers": ("other_mother", "collateral")
        }
        
        if key not in relationship_map:
            raise ValueError(f"想定しない続柄が設定されています。")
        
        return relationship_map[key]
    
    function_name = get_current_function_name()
    
    try:
       # 初期化
        grouped_data = {}
        type, relation_type1 = get_relation_type(key)
        
        # データ処理
        for d in data:
            identifier = (type, d.name, relation_type1)
            if identifier not in grouped_data:
                grouped_data[identifier] = {
                    "type": type,
                    "id": [],
                    "name": d.name,
                    "relation_type1": relation_type1,
                    "relation_id1": []
                }
                
                # 子の前配偶者のとき、子のデータを取得する
                if type == "child_ex_spouse":
                    grouped_data[identifier].update({
                        "relation_type2": "child",
                        "relation_id2": d.content_object.object_id1
                    })
                
            grouped_data[identifier]["id"].append(d.id)
            grouped_data[identifier]["relation_id1"].append(d.object_id)
        
        # フォーマットされたデータをリストに変換
        formatted_data = list(grouped_data.values())
        
        return { key: formatted_data }
        
    except Exception as e:
        raise Exception(f"{function_name}でエラー発生：{str(e)}\ndata={data}\key={key}")

def get_child_spouse_data_for_diagram(data, acquirers_list):
    """相続関係説明図用の子の配偶者データを取得します。"""
    
    function_name = get_current_function_name()
    new_data = []
    
    try:
        for d in data:
            form = get_diagram_person_form()
        
            form.update({
                "type": "child_spouse",
                "id": d.id,
                "name": d.name,
                "birth_date": get_wareki(d, True),
                "relation_type1": "child",
                "relation_id1": d.object_id,
            })
            
            #生存確認
            if d.is_live == False:
                form["death_date"] = get_wareki(d, False)
                new_data.append(form)
                continue
            
            #相続放棄
            if d.is_refuse:
                form["position"] = "相続放棄"
                new_data.append(form)
                continue
            
            #取得者確認
            matched_acquirer = next((x for x in acquirers_list if (x["acquirer_type"], x["acquirer_id"]) == (d.__class__.__name__, d.id)), None)
            if matched_acquirer:
                form["address"] = format_address(matched_acquirer["address"])
                form["position"] = "相続"
            else:
                form["position"] = "分割"
            
            new_data.append(form)
            
        return new_data
    
    except Exception as e:
        raise Exception(f"{function_name}でエラー発生\n{e}\ndata={data}, acquirers_list={acquirers_list}")
 
def get_child_data_for_diagram(data, acquirers_list):
    """相続関係説明図用の子データを取得します。"""
    
    function_name = get_current_function_name()
    
    child_data = []
    step_child_data = []
    
    for d in data:
        
        form = get_diagram_person_form()
        
        try:
            is_step_child = d.content_type2.model_class() == RelatedIndividual
            form.update({
                "type": "step_child" if is_step_child else "child",
                "id": d.id,
                "name": d.name,
                "birth_date": get_wareki(d, True),
                "relation_type1": "decedent",
                "relation_id1": d.object_id1,
                "relation_type2": "ex_spouse" if is_step_child else "spouse",
                "relation_id2": d.object_id2,
            })
            #生存確認
            if d.is_live == False:
                form["death_date"] = get_wareki(d, False)
                step_child_data.append(form) if is_step_child else child_data.append(form)
                continue
            #相続放棄
            if d.is_refuse:
                form["position"] = "相続放棄"
                step_child_data.append(form) if is_step_child else child_data.append(form)
                continue
            #取得者確認
            matched_acquirer = next((x for x in acquirers_list if (x["acquirer_type"], x["acquirer_id"]) == (d.__class__.__name__, d.id)), None)
            if matched_acquirer:
                form["address"] = format_address(matched_acquirer["address"])
                form["position"] = "相続"
            else:
                form["position"] = "分割"
            
            step_child_data.append(form) if is_step_child else child_data.append(form)

        except Exception as e:
            raise Exception(f"{function_name}でエラー発生：{e}\ndata={data}\n\
                len(data)={len(data)}\n\
                acquirers_list={acquirers_list}\n\
                len(acquirers_list)={len(acquirers_list)}")
        
    return [child_data, step_child_data]

def get_collateral_data_for_diagram(data, acquirers_list, key):
    """相続関係図用の傍系データを取得します。"""
    
    function_name = get_current_function_name()
    
    formatted_data = []
    collateral_types = {
        "full_collaterals": "full_collateral",
        "other_father_collaterals": "other_father_collateral",
        "other_mother_collaterals": "other_mother_collateral"
    }

    type = collateral_types.get(key, None)
    if not type:
        raise ValueError(f"引数keyが不適切です\nkey={key}")
    
    try:
            
        for d in data:
            form = get_diagram_person_form()
        
            form.update({
                "type": type,
                "id": d.id,
                "name": d.name,
                "birth_date": get_wareki(d, True),
                "relation_type1": d.content_type1.model_class().__name__.lower(),
                "relation_id1": d.object_id1,
                "relation_type2": d.content_type2.model_class().__name__.lower(),
                "relation_id2": d.object_id2,
            })
            
            #生存確認
            if d.is_live == False:
                form["death_date"] = get_wareki(d, False)
                formatted_data.append(form)
                continue
            
            #相続放棄
            if d.is_refuse:
                form["position"] = "相続放棄"
                formatted_data.append(form)
                continue
            
            #取得者確認
            matched_acquirer = next((x for x in acquirers_list if (x["acquirer_type"], x["acquirer_id"]) == (d.__class__.__name__, d.id)), None)
            if matched_acquirer:
                form["address"] = format_address(matched_acquirer["address"])
                form["position"] = "相続"
            else:
                form["position"] = "分割"
                
            formatted_data.append(form)
            
        return {
            key : formatted_data
        }

    except Exception as e:
        raise_exception(function_name, e, data=data, acquirers_list=acquirers_list, key=key)

def get_diagram_data(app_data, persons_data):
    """相続関係説明図用のデータを取得する

    Args:
        app_data (_type_): （不動産データ、不動産取得者データ、申請人データ、敷地権データ）
        persons_data (dict): {relation: querysetまたはquerysets}

    Returns:
        list[dict[]]: 相続関係説明図用のデータ
    """
    
    function_name = get_current_function_name()
    
    new_data_list = []
    
        # 各申請データに対する処理
    for app in app_data:
        try:
            acquirers_list = app[1] #取得者の辞書リストデータ
            
            new_data = get_diagram_data_form()
            child_spouses = []
            childs = []
            
            # 相関図に記載する全員に対する処理
            for key, data in persons_data.items():
                
                # 配偶者がいるとき
                if key == "spouse" and data.is_exist:
                    new_data.update(get_spouse_data_for_diagram(data, acquirers_list))
                    continue
                
                if not is_data(data):
                    continue
                
                if key == "ex_spouses" or key == "other_fathers" or key == "other_mothers":
                    new_data.update(get_related_indivisual_data_for_diagram(data, key))
                elif key == "child_ex_spouses":
                    result = get_related_indivisual_data_for_diagram(data, key)
                    child_spouses.extend(result["child_ex_spouses"])
                elif key == "ascendants":
                    new_data.update(get_ascendant_data_for_diagram(data, acquirers_list))
                elif key == "full_collaterals" or key == "other_father_collaterals" or key == "other_mother_collaterals":
                    new_data.update(get_collateral_data_for_diagram(data, acquirers_list, key))
                elif key == "child_spouses":
                    child_spouses.extend(get_child_spouse_data_for_diagram(data, acquirers_list)) #子の配偶者データ
                elif key == "childs":
                    childs.extend(get_child_data_for_diagram(data, acquirers_list)) # 子（連れ子を含む）
                elif key == "grand_childs":
                    new_data.update(get_grand_child_data_for_diagram(data, acquirers_list))
                    
            #子の配偶者と子、孫のデータは順番を整理する
            new_data.update(get_rearranged_child_gen_data(childs, child_spouses))

            new_data_list.append(new_data)
            
        except Exception as e:
            basic_log(function_name, e, None, f"app_data={app_data}\napp={app}\nnew_data_list={new_data_list}")
            raise e
        
    return new_data_list
    
    
def get_rearranged_child_gen_data(childs, child_spouses):
    """子の世代を並び替える
    
    （子＞子の配偶者＞子の前配偶者）＞（連れ子＞子の配偶者＞子の前配偶者）の順、かつid昇順

    Args:
        childs (_type_): _description_
        child_spouses (_type_): _description_

    Returns:
        _type_: _description_
    """
    child_data= []
    for c in childs:
        child_data.extend(c)
        
    # 子＞連れ子の順かつidの昇順で並び替え
    type_order = {'child': 1, 'step_child': 2}
    # カスタムソート関数
    sorted_child_data = sorted(child_data, key=lambda x: (type_order[x['type']], x['id']))
    
    # 配偶者＞前配偶者かつidの昇順で並び替え
    type_order = {'child_spouse': 1, 'child_ex_spouse': 2}
    # カスタムソート関数
    sorted_child_spouse_data = sorted(child_spouses, key=lambda x: (type_order[x['type']], min(x['id']) if isinstance(x['id'], list) else x['id']))
    
    rearranged_data = []
    for c in sorted_child_data:
        rearranged_data.append(c)
        for cs in sorted_child_spouse_data:
            if cs["type"] == "child_spouse" and cs["relation_id1"] == c["id"] or\
                cs["type"] == "child_ex_spouse" and cs["relation_id2"] == c["id"]:
                rearranged_data.append(cs)
                
    return { "child_gen": rearranged_data }

def get_diagram_data_form():
    return {
        "spouse": None,
        "ex_spouses": None,
        "other_fathers": None,
        "other_mothers": None,
        "parents": None,
        "grand_parents": None,
        "full_collaterals": None,
        "other_father_collaterals": None,
        "other_mother_collaterals": None,
        "child_gen": None,
        "grand_childs": None
    }
    
def get_diagram_person_form():
    return {
        "type": "",
        "id": "",
        "name": "",
        "address" : "",
        "birth_date": "",
        "death_date": "",
        "position": "", #相続、分割、相続放棄のいずれか
        "relation_type1": "", #外部モデルのクラス名
        "relation_id1": "", #外部モデルのid
        "relation_type2": "", 
        "relation_id2": "", 
    }
    
def get_decedent_related_persons_data(decedent):
    """被相続人に関連する全員のデータを取得する"""
    decedent_content_type = ContentType.objects.get_for_model(Decedent)
    spouse_data = Spouse.objects.filter(content_type=decedent_content_type, object_id=decedent.id).first()
    child_data = Descendant.objects.filter(content_type1=decedent_content_type, object_id1=decedent.id).order_by('id')

    child_ids = child_data.values_list('id', flat=True)  # child_dataの各要素が持つIDのリストを取得
    descendant_content_type = ContentType.objects.get_for_model(Descendant)
    child_spouse_data = Spouse.objects.filter(content_type=descendant_content_type, object_id__in=child_ids).order_by('id')
    grand_child_data = Descendant.objects.filter(content_type1=descendant_content_type, object_id1__in=child_ids).order_by('id')
    
    ascendant_data = Ascendant.objects.filter(decedent=decedent).order_by('id')
    
    collateral_data = Collateral.objects.filter(decedent=decedent).order_by('id')

    full_collateral_data = []
    other_father_collateral_data = []
    other_mother_collateral_data = []
    related_indivisual_content_type = ContentType.objects.get_for_model(RelatedIndividual)
    for d in collateral_data:
        if d.content_type1 == related_indivisual_content_type:
            other_father_collateral_data.append(d)
        elif d.content_type2 == related_indivisual_content_type:
            other_mother_collateral_data.append(d)
        else:
            full_collateral_data.append(d)
    
    
    # 関係者のデータは前配偶者、子の前配偶者、異父母に分けて返す
    related_individual_data = RelatedIndividual.objects.filter(decedent=decedent).order_by("id")
    ex_spouse_data = related_individual_data.filter(relationship="前配偶者")
    
    child_ex_spouse_data = related_individual_data.filter(relationship="子の前配偶者")
    
    half_parent_data = related_individual_data.filter(relationship="異父又は異母")
    other_father_data = []
    other_mother_data = []
    
    for d in half_parent_data:
        content_object = d.content_object
        if content_object.content_type1 == related_indivisual_content_type:
            other_father_data.append(d)
        else:
            other_mother_data.append(d)
    
    return {
        "spouse": spouse_data,
        "childs": child_data,
        "child_spouses": child_spouse_data,
        "ascendants": ascendant_data,
        "grand_childs": grand_child_data,
        "full_collaterals": full_collateral_data,
        "other_father_collaterals": other_father_collateral_data,
        "other_mother_collaterals": other_mother_collateral_data,
        "ex_spouses": ex_spouse_data,
        "child_ex_spouses": child_ex_spouse_data,
        "other_fathers": other_father_data,
        "other_mothers": other_mother_data,
    }

def step_application_form(request):
    """登記申請書の表示"""
    
    function_name = get_current_function_name()
    redirect_to = "toukiApp:step_four"
    this_html = "toukiApp/step_application_form.html"
    tab_title = "登記申請書"
    
    try:
        
        response, user, decedent = check_user_and_decedent(request)
        if response:
            return response

        progress = decedent.progress
        
        # 申請に必要なデータを取得する
        data = get_data_for_application_form(decedent, True)

        # データを申請書の形式に修正する
        application_data = get_application_form_data(data, decedent)
        
        context = {
            "title" : tab_title,
            "user_email": user.email,
            "progress": progress,
            "company_data": CompanyData,
            "application_data": application_data,
            "decedent_name": decedent.name,
        }
        return render(request, this_html, context)
    except Exception as e:
        return handle_error(
            e, 
            request, 
            request.user,
            function_name, 
            redirect_to, 
        )

def get_application_form():
    """申請書に必要なデータ形式

    Returns:
        _type_: _description_
    """
    return {
        "purpose_of_registration": "",
        "cause": "",
        "acquirers": [],
        "document": "登記原因証明情報　住所証明情報　",
        "office": "",
        "is_agent": "false",
        "agent": {
            "position": "",
            "address": "",
            "name": "",
            "phone_number": "",
        },
        "total_price": 0,
        "owner_price": 0,
        "other_price": 0,
        "is_all_tax_free": "false",
        "all_tax_free_phrase": "租税特別措置法第８４条の２の３第２項により非課税",
        "is_partially_tax_free": "false",
        "partially_tax_free_phrase": "以下の土地について租税特別措置法第８４条の２の３第２項により非課税",
        "tax_free_land_numbers": [],
        "tax": "",
        "properties": [],
    }

def get_application_form_data(data, decedent):
    """登記申請書に反映する情報を取得する

    Args:
        data (_type_): _description_
        decedent (_type_): _description_

    Returns:
        _type_: _description_
    """
    formatted_data = []
    cause = get_wareki(decedent, False)
    for properties, acquirers, applications, sites in data:
        application_form = get_application_form()
        application = applications[0]
        #登記の目的
        application_form["purpose_of_registration"] = get_purpose_of_registration(properties, decedent.name)
        #登記の原因
        application_form["cause"] = cause
        #相続人
        application_form["acquirers"] = get_acquirers_info(application_form["purpose_of_registration"], acquirers, application)
        #添付情報
        if len(formatted_data) > 0 and formatted_data[-1]["office"] == properties[0]["office"]:
            if application["is_agent"]:
                application_form["document"] = "登記原因証明情報（一部前件添付） 住所証明情報（前件添付）\n代理権限証明情報"
            else:
                application_form["document"] = "登記原因証明情報（一部前件添付） 住所証明情報（前件添付）"
        else:
            application_form["document"] += "代理権限証明情報" if application["is_agent"] else ""
        #法務局
        application_form["office"] = properties[0]["office"]
        #代理人情報
        assign_agent_data(application_form, application)
        #課税価格、土地の租税特別措置法対象の不動産番号、不動産情報
        assign_price_and_property(application_form, properties, sites, acquirers)
        #登録免許税、敷地権の種類（所有権は１０００分の４、免税対象、地上権は１０００分の２、免税不可）
        #金額の表示を申請書形式に合わせる
        assign_tax(application_form)

        formatted_data.append(application_form)
        
    return formatted_data

def assign_tax(form):
    """登録免許税額の算出して課税価格と登録免許税額を全角にして申請フォームに登録する

    Args:
        form (_type_): 申請書形式のデータ
    """
    #地上権、賃借権の課税価格から登録免許税を算出
    other_tax = 0
    if form["other_price"] > 0:
        other_tax = form["other_price"] * 2 / 1000
    #所有権の課税価格から登録免許税を算出
    owner_tax = 0
    if form["owner_price"] > 0:
        owner_tax = form["owner_price"] * 4 / 1000
        
    total_tax = ((owner_tax + other_tax) // 100) * 100
    
    #課税価格を全角にする
    form["total_price"] = format_currency_for_application_form(form["total_price"])
    #登録免許税額を全角に変換する
    form["tax"] = format_currency_for_application_form(total_tax)

def assign_price_and_property(form, properties, sites, acquirers):
    """課税価格と不動産情報を登録する

    Args:
        form (_type_): application_form
        properties (_type_): 対象の申請書の不動産情報
        sites (_type_): 対象の申請書の敷地権情報
        acquirers (_type_): 対象の申請書の取得者情報
    """
    #各不動産の評価額を合計する（被相続人の持分も考慮する）
    owner_price = 0
    other_price = 0
    tax_free_limit = 1000000
    tax_free_land_numbers = []

    for p in properties:
        property_form = get_property_form()
        property_form["number"] = p["number"] #不動産番号
        
        #各不動産の課税価格を算出する
        actual_price = get_actual_price(p["price"], p["purparty"])
        
        #取得者の氏名と持分を取得する
        assign_acquirer_name_and_actual_percentage(property_form, acquirers, p)

        #土地かつ評価額（被相続人の持分も考慮）が１００万円以下のとき免税対象
        if p["property_type"] == "Land" and actual_price <= tax_free_limit:
            tax_free_land_numbers.append(p["number"])
            property_form["is_tax_free"] = "true"
            form["properties"].append(property_form)
            continue
        
        #区分建物のとき、敷地権の評価額も算出する
        if p["property_type"] == "Bldg":
            #敷地権の種類と敷地権の割合も考慮する
            for s in sites:
                if p["property_id"] == s["bldg"]:
                    site_data = {
                        "site_number": s["number"],
                        "site_type": s["type"],
                        "site_purparty": s["purparty"],
                        "is_tax_free": "false",
                    }
                    site_actual_price = get_actual_price(s["price"], p["purparty"], s["purparty"])
                    if s["type"] == "所有権" and site_actual_price <= tax_free_limit:
                        tax_free_land_numbers.append(p["number"] + "の土地の符号" + s["number"] + "の土地")
                        site_data["is_tax_free"] = "true"
                        property_form["sites"].append(site_data)
                        continue
                    
                    if s["type"] == "所有権":
                        owner_price += site_actual_price
                    else:
                        other_price += site_actual_price
                        
                    property_form["sites"].append(site_data)
                    
            
        owner_price += actual_price
        form["properties"].append(property_form)
    
    form["tax_free_land_numbers"].extend(tax_free_land_numbers)
        
    total_price = owner_price + other_price
    form["total_price"] = total_price
    form["owner_price"] = owner_price
    form["other_price"] = other_price
    #全て非課税対象（１００万以下の土地のみ）か一部非課税対象か判別する
    check_tax_free_status(form, properties, tax_free_land_numbers)

def check_tax_free_status(form, properties, tax_free_land_numbers):
    """非課税の土地があるかチェックし、フォームに非課税ステータスを記録する

    Args:
        form (dict): フォームデータを格納する辞書
        properties (list): 不動産リスト（辞書のリスト）
        tax_free_land_numbers (list): 非課税の土地番号リスト
    """
    if not is_data(tax_free_land_numbers):
        return
    
    #土地のみかチェック
    is_not_land_only = any(property["property_type"] != "Land" for property in properties)
    
    #土地以外があるとき
    if is_not_land_only:
        form["is_partially_tax_free"] = "true"
    elif len(properties) == len(tax_free_land_numbers):
        form["is_all_tax_free"] = "true"
    else:
        form["is_partially_tax_free"] = "true"
    
def assign_acquirer_name_and_actual_percentage(form, acquirers, property):
    """不動産の表示に表示する取得者の氏名と持分をフォームに代入する

    Args:
        form (dict): フォームデータを格納する辞書
        acquirers (list): 取得者のリスト（辞書のリスト）
        property (dict): 不動産に関する情報を格納する辞書
    """
    # 複数の取得者が存在する場合、特定の不動産に関連する取得者のみをフォームに追加する
    for acquirer in acquirers:
        # 不動産の種類とIDが一致する取得者、または取得者が1人しかいない場合に処理を実行
        if len(acquirers) == 1 or\
            (property["property_type"] == acquirer["property_type"] and\
            property["property_id"] == acquirer["property_id"]):
                
            name = acquirer["name"]
            percentage = multiple_fullwidth_fractions(acquirer["percentage"], property["purparty"])
            form["acquirers"].append({
                "percentage": percentage,
                "name": name,
            })

def multiple_fullwidth_fractions(a, b):
    """（全角数字）分の（全角数字）の形式同士の掛け算の結果を返す

    Args:
        a (str): （全角数字）分の（全角数字）の形式
        b (str): （全角数字）分の（全角数字）の形式

    Returns:
        str: 結果を（全角数字）分の（全角数字）に変換した文字列
    """
    result = fullwidth_fraction_to_fraction(a) * fullwidth_fraction_to_fraction(b)
    return fraction_to_fullwidth_fraction(result)
    
def fraction_to_fullwidth_fraction(frac):
    """分数を（全角数字）分の（全角数字）形式の文字列に変換する

    Args:
        frac (_type_): 分数

    Returns:
        str: "所有権"または（全角数字）分の（全角数字）に変換した文字列
    """
    if frac.numerator == frac.denominator:
        return "所有権"
    numerator = unicodedata.normalize('NFKC', str(frac.numerator))
    denominator = unicodedata.normalize('NFKC', str(frac.denominator))
    return f"{mojimoji.han_to_zen(denominator)}分の{mojimoji.han_to_zen(numerator)}"

def get_property_form():
    """登記申請書の不動産の表示のデータ形式

    Returns:
        _type_: _description_
    """
    return {
        "property_type": "",
        "number": "",
        "address": "",
        "address_number": "",
        "acquirers": [],
        "sites": [],
        "is_tax_free": "false",
        "tax_free_phrase": "※租税特別措置法第８４条の２の３第２項により非課税",
    }

def get_actual_price(price, purparty, site_purparty = None):
    """各不動産の課税価格を算出する（小数点切り捨て）

    Args:
        price (str): 全角数字とコンマで表された価格
        purparty (str): 全角数字の分数で表された持分（例: "１分の２"）
        site_purparty (str, optional): 全角数字の分数で表された敷地の持分（例: "１分の２"）。指定されない場合はNone。

    Returns:
        int: 課税価格（整数、小数点切り捨て）
    """
    actual_price = fullwidth_num_and_comma_to_int(price)
    fraction_purparty = fullwidth_fraction_to_fraction(purparty)
    
    if site_purparty:
        fraction_site_purparty = fullwidth_fraction_to_fraction(site_purparty)
        return int(actual_price * fraction_purparty * fraction_site_purparty)
    else:
        return int(actual_price * fraction_purparty)

def fullwidth_fraction_to_fraction(s):
    """（全角数字）分の（全角数字）形式の文字列を分数に変換する

    Args:
        s (_type_): _description_

    Returns:
        _type_: _description_
    """
    # 全角の数字とスペースを半角に変換
    s_half_width = unicodedata.normalize('NFKC', s)
    
    # 「分の」で分割して分子と分母を取得
    denominator, numerator = s_half_width.split('分の')
    
    # 分子と分母を整数に変換
    numerator = int(numerator)
    denominator = int(denominator)
    
    # Fractionオブジェクトを作成して返す
    return Fraction(numerator, denominator)

def fullwidth_num_and_comma_to_int(s):
    """全角のコンマ付きの数字を整数型に変えて返す

    Args:
        price_data (_type_): _description_

    Returns:
        _type_: _description_
    """
    # 全角数字とコンマを半角に変換
    half_width = unicodedata.normalize('NFKC', s)
    # コンマを削除
    no_commas = half_width.replace(',', '')
    # 整数に変換
    return int(no_commas)

def assign_agent_data(form, application):
    """代理人情報を登録する

    Args:
        form (_type_): _description_
        application (_type_): _description_
    """
    if application["is_agent"]:
        form["is_agent"] = "true"
        form["agent"]["position"] = application["position"]
        form["agent"]["address"] = application["agent_address"]
        form["agent"]["name"] = application["agent_name"]
        form["agent"]["phone_number"] = application["agent_phone_number"]
    else:
        form["is_agent"] = "false"

def get_acquirers_info(purpose_of_registration, acquirers, application):
    """相続人欄の情報を取得する

    Args:
        purpose_of_registration (_type_): 登記の目的
        acquirers (_type_): 取得者リスト（重複あり）
        application (_type_): 申請人情報

    Returns:
        _type_: 相続人欄の情報
    """
    
    def is_applicant(acquirer, content_type, object_type):
        # 取得者が申請人か判定
        return acquirer["acquirer_type"] == content_type and acquirer["acquirer_id"] == object_type
    
    function_name = get_current_function_name()
    
    acquirer_infos = []
    
    applicant_content_type = type(application["content_object"]).__name__
    applicant_object_id = application["content_object"].pk
    
    for acquirer in acquirers:
        try:
            acquirer_info = get_acquirer_info_form()
            
            acquirer_info["address"] = format_address(acquirer["address"])
            acquirer_info["name"] = acquirer["name"]
            
            unique_acquirers = list({(a["acquirer_type"], a["acquirer_id"]) for a in acquirers})
            
            if is_applicant(acquirer, applicant_content_type, applicant_object_id):
                
                if not application["is_agent"] and len(unique_acquirers) == 1:
                    acquirer_info["phone_number"] = application["phone_number"]
            
            if len(unique_acquirers) > 1 or purpose_of_registration != "所有権移転":
                acquirer_info["is_share"] = "true"
            
            if acquirer_info not in acquirer_infos:
                acquirer_infos.append(acquirer_info)
        except Exception as e:
            basic_log(function_name, e, None, f"acquirer={acquirer}")
            raise e
    
    return acquirer_infos

def get_acquirer_info_form():
    """相続人欄に必要なデータのフォーム

    Returns:
        _type_: _description_
    """
    return {
        "address": "",
        "is_share": "false",
        "percentage_phrase": "持分後記のとおり",
        "name": "",
        "phone_number": "",
    }

def get_purpose_of_registration(properties, decedent_name):
    """登記の目的を取得する

    Args:
        properties (_type_): _description_
        decedent_name (_type_): _description_

    Raises:
        ValidationError: _description_

    Returns:
        _type_: _description_
    """
    is_owner = False
    is_sharer = False
    for x in properties:
        if x["purparty"] == "１分の１":
            is_owner = True
        elif x["purparty"]:
            is_sharer = True
        else:
            raise ValidationError(f"{x['property_type']}の{x['id']}所有権割合の入力がありません")
    
    if is_owner and is_sharer:
        return f"所有権移転及び{decedent_name}持分全部移転"
    if is_owner:
        return "所有権移転"
    if is_sharer:
        return f"{decedent_name}持分全部移転"

def step_POA(request):
    """委任状を表示する"""
    
    function_name = get_current_function_name()
    this_html = "toukiApp/step_POA.html"
    redirect_to = "toukiApp:step_four"
    tab_title = "委任状"
    
    try:
        
        response, user, decedent = check_user_and_decedent(request)
        if response:
            return response

        progress = decedent.progress
        
        # 登記申請書データを取得する
        data = get_data_for_application_form(decedent, True)

        # まとまった不動産別に委任状データを作成する
        POA_data = get_POA_data(data, decedent)
        
        context = {
            "title" : tab_title,
            "user_email": user.email,
            "progress": progress,
            "company_data": CompanyData,
            "POA_data": POA_data,
            "decedent_name": decedent.name,
        }
        return render(request, this_html, context)
    except Exception as e:
        return handle_error(
            e, 
            request, 
            request.user,
            function_name, 
            redirect_to, 
        )
        
def get_POA_data(data, decedent):
    """委任状に反映する情報を取得する

    Args:
        data (_type_): _description_
        decedent (_type_): _description_

    Returns:
        _type_: _description_
    """
    
    function_name = get_current_function_name()
    
    try:
        
        formatted_data = []
        cause = get_wareki(decedent, False)
        
        for properties, acquirers, applications, sites in data:
            
            form = get_application_form()
            application = applications[0]
            
            #登記の目的
            form["purpose_of_registration"] = get_purpose_of_registration(properties, decedent.name)
            
            #登記の原因
            form["cause"] = cause
            
            #相続人
            form["acquirers"] = get_acquirers_info(form["purpose_of_registration"], acquirers, application)
            
            #代理人情報
            assign_agent_data(form, application)
            
            #不動産情報
            assign_properties_info(form, properties, sites, acquirers)
            
            if form["agent"]["name"] != "":
                formatted_data.append(form)
                
        return formatted_data    
    
    except Exception as e:
        basic_log(function_name, e, None, "委任状データの取得に失敗しました")
        raise e

def finalize_for_POA(form):
    """取得者が１人かつ申請人の要素を申請データから削除する"""
    new_form = [f for f in form if f["agent"]["name"]]
    return new_form
            

def assign_properties_info(form, properties, sites, acquirers):
    """不動産情報を取得する

    Args:
        form (_type_): POA_form
        properties (_type_): 対象の申請書の不動産情報
        sites (_type_): 対象の申請書の敷地権情報
        acquirers (_type_): 対象の申請書の取得者情報
    """
    for p in properties:
        property_form = get_property_form()
        property_form["property_type"] = p["property_type"] #不動産番号
        property_form["number"] = p["number"] #不動産番号
        property_form["address"] = p["address"]
        property_form["address_number"] = p["address_number"]
        #取得者の氏名と持分を取得する
        assign_acquirer_name_and_actual_percentage(property_form, acquirers, p)
      
        #区分建物のとき
        if p["property_type"] == "Bldg":
            #敷地権の種類と敷地権の割合も考慮する
            for s in sites:
                if p["property_id"] == s["bldg"]:
                    site_data = {
                        "site_number": s["number"],
                        "site_type": s["type"],
                        "address_and_land_number": s["address_and_land_number"],
                        "site_purparty": s["purparty"],
                        "is_tax_free": "false",
                    }
                    property_form["sites"].append(site_data)

        form["properties"].append(property_form)
    
    return form

"""

    ステップ５関連
    
"""

def step_five(request):
    """ステップ５のメイン処理"""
    
    function_name = get_current_function_name()
    this_html = "toukiApp/step_five.html"
    this_url_name = "toukiApp:step_five"
    next_url_name = "toukiApp:step_six"
    step_progress = 5
    title = Service.STEP_TITLES["five"]
    
    try:
                
        response, user, decedent = check_user_and_decedent(request)
        if response:
            return response
        
        progress = decedent.progress
        if not is_fulfill_required_progress(progress, step_progress):
            return redirect_to_progress_page(request)
        
        if request.method == "POST":
            try:
                if not is_progress_equal_to_step(progress, step_progress):
                    return redirect_to_progress_page(request)
                
                with transaction.atomic():
                    decedent.progress = step_progress + 1
                    decedent.save()
                    
                    return redirect(next_url_name)
            except Exception as e:
                basic_log(function_name, e, user, "POSTでエラー")
                raise e
        
        heirs = get_legal_heirs(decedent)
        minors = get_filtered_instances(heirs, "is_adult", False)
        overseas_acquirers = get_filtered_instances(heirs, ["is_japan", "is_acquire"], [False, True])
        refused_heirs = get_querysets_by_condition([Spouse, Descendant, Ascendant, Collateral], decedent, {"is_refuse": True})
        #ユーザーが申請する法務局の名称を取得する
        offices = get_where_to_apply(decedent)
        # office_name_and_link = {}
        # for office in offices:
        #     search_word = f"{office} 住所"
        #     response = requests.get(f"https://www.googleapis.com/customsearch/v1?key=AIzaSyAmeV3HS-AshtCAHWit7eAEEudyEkwtnxE&cx=9242f933284cb4535&q={search_word}")
        #     data = response.json()
        #     office_name_and_link[office] = data["items"][0]["link"]
            
        context = {
            "title" : title,
            "company_data": CompanyData,
            "user_email" : user.email,
            "decedent": decedent,
            "progress": progress,
            "minors": minors,
            "offices": offices,
            "overseas_acquirers": overseas_acquirers,
            "refused_heirs": refused_heirs,
            # "office_name_and_link": office_name_and_link,
            "sections" : Sections.SECTIONS[Sections.STEP5],
            "service_content" : Sections.SERVICE_CONTENT,
        }
        return render(request, this_html, context)
    
    except Exception as e:
        return handle_error(
            e, 
            request, 
            request.user,
            function_name, 
            this_url_name, 
        )

def get_where_to_apply(decedent):
    """ユーザーが申請する法務局の名称を取得する"""
    try:
        #不動産情報を取得する
        models = [Land, House, Bldg]
        querysets = get_querysets_by_condition(models, decedent=decedent)
        #法務局の名称を重複なしでまとめる
        return {x.office for x in querysets}
    except Exception as e:
        raise e

#
# ステップ6
#
def step_six(request):
    """申請後のメイン処理"""
    
    function_name = get_current_function_name()
    this_html = "toukiApp/step_six.html"
    this_url_name = "toukiApp:step_six"
    step_progress = 6
    title = Service.STEP_TITLES["six"]
    
    try:
        
        response, user, decedent = check_user_and_decedent(request)
        if response:
            return response
        
        progress = decedent.progress
        if not is_fulfill_required_progress(progress, step_progress):
            return redirect_to_progress_page(request)

        context = {
            "title" : title,
            "company_data": CompanyData,
            "user_email" : user.email,
            "decedent": decedent,
            "progress": progress,
            "sections" : Sections.SECTIONS[Sections.STEP6],
            "service_content" : Sections.SERVICE_CONTENT,
            "moj_online_request_page_link": ExternalLinks.links["moj_online_request"],
            "touki_info_charge": ExternalLinks.charge["touki_info"],
            "touki_info_link": ExternalLinks.links["touki_info"]
        }
        return render(request, this_html, context)
    
    except Exception as e:
        return handle_error(
            e, 
            request, 
            request.user,
            function_name, 
            this_url_name, 
        )

def is_fulfill_required_progress(decedent_progress, required_progress):
    """ユーザーの進捗がシステムの段階を満たしているか判定"""
    return decedent_progress >= required_progress
    
def is_progress_equal_to_step(decedent_progress, step):
    """ユーザーの進捗がシステムの段階と一致しているか判定"""
    return int(decedent_progress) == step

def step_inquiry(request):
    """会員からのお問い合わせ

        処理内容
        ・問い合わせ内容をページ下部に表示する
        ・問い合わせを受け付けたことをメールで通知する
        ・問い合わせがあったらメールで通知を受ける
    """
    try:
        function_name = get_current_function_name()
        this_html = "toukiApp/step_inquiry.html"
        this_url_name = "toukiApp:step_inquiry"
        
        if not request.user.is_authenticated:
            messages.error(request, "アクセス不可 会員専用のページです。先にアカウント登録をしてください。")
            basic_log(function_name, None, None, "非会員が会員登録ページにアクセスを試みました")
            return redirect("account_login")
        
        user = User.objects.get(email=request.user.email)
        decedent = user.decedent.first()
        progress = decedent.progress if decedent else 0
        
        inquiry_form = StepUserInquiryForm(prefix="user_inquiry")                
        #フォームからデータがPOSTされたとき
        if request.method == "POST":
            try:
                inquiry_form = StepUserInquiryForm(
                    request.POST or None,
                    prefix="user_inquiry",
                )
                if inquiry_form.is_valid():
                    with transaction.atomic():
                        register_user_inquiry_and_return_instance(user, inquiry_form)
                        send_auto_email_to_inquiry(inquiry_form.cleaned_data, user.email)
                        messages.success(request, "受付完了 お問い合わせありがとうございます。\nご回答まで少々お待ちください。")
                        return redirect(this_url_name)
                else:
                    basic_log(function_name, None, user, f"POSTでエラー\n{inquiry_form.errors}")
                    messages.warning(request, "受付に失敗 入力に不備があるため、受け付けできませんでした。")
            except Exception as e:
                basic_log(function_name, e, user, "POSTでエラー")
                raise e

        q_and_a_data = get_q_and_a_data(user)
            
        context = {
            "title" : Service.STEP_TITLES["inquiry"],
            "progress": progress,
            "inquiry_form": inquiry_form,
            "q_and_a_data": q_and_a_data,
            "company_data": CompanyData,
            "sections" : Sections.SECTIONS,
            "service_content" : Sections.SERVICE_CONTENT,
        }
        return render(request, this_html, context)
    except Exception as e:
        return handle_error(
            e, 
            request, 
            request.user,
            function_name, 
            this_url_name, 
        )

def register_user_inquiry_and_return_instance(user, form):
    """会員からのQデータをデータベースに登録する"""
    instance = form.save(commit=False)
    instance.user = user
    instance.created_by = user
    instance.updated_by = user
    instance.save()

def get_q_and_a_data(user):
    """会員からのQ&Aデータを取得する"""
    q_querysets = UserInquiry.objects.filter(user=user).order_by('-updated_at')[:5]
    q_ids = q_querysets.values_list("id", flat=True)
    a_querysets = AnswerToUserInquiry.objects.filter(user_inquiry_id__in=q_ids)
    q_and_a_data = []
    for q in q_querysets:
        category = Sections.get_category(q.category)
        subject = Sections.get_subject(q.subject)
        related_a = a_querysets.filter(user_inquiry=q).first()
        q_and_a_data.append(
            (
                {"category": category, "subject": subject, "content": q.content, "updated_at": q.updated_at},
                related_a
            )
        )
    return q_and_a_data

def administrator(request):
    """会社概要"""
    
    function_name = get_current_function_name()
    this_url_name = "toukiApp:administrator"
    this_html = "toukiApp/administrator.html"
    redirect_to = "toukiApp:index"
    tab_title = "会社概要"
    
    try:
        canonical_url = get_canonical_url(request, this_url_name)
        
        context = {
            "title": tab_title,
            "company_data": CompanyData,
            "canonical_url": canonical_url
        }
        return render(request, this_html, context)
    except Exception as e:
        return handle_error(
            e,
            request,
            request.user,
            function_name,
            redirect_to
        )

def commerceLaw(request):
    """特商法"""
        
    function_name = get_current_function_name()
    this_url_name = "toukiApp:commerce_law"
    this_html = "toukiApp/commerce_law.html"
    redirect_to = "toukiApp:index"
    tab_title = "特定商取引法に基づく表記"
    
    try:
        canonical_url = get_canonical_url(request, this_url_name)
        
        context = {
            "title": tab_title,
            "company_data": CompanyData,
            "canonical_url": canonical_url
        }
        return render(request, this_html, context)
    except Exception as e:
        return handle_error(
            e,
            request,
            request.user,
            function_name,
            redirect_to
        )

def privacy(request):
    """プライバシーポリシー"""
    
    function_name = get_current_function_name()
    this_url_name = "toukiApp:privacy"
    this_html = "toukiApp/privacy.html"
    redirect_to = "toukiApp:index"
    tab_title = "プライバシーポリシー"
    
    try:
        canonical_url = get_canonical_url(request, this_url_name)
        
        context = {
            "title" : tab_title,
            "company_data" : CompanyData,
            "canonical_url": canonical_url
        }
        
        return render(request, this_html, context)
    except Exception as e:
        return handle_error(
            e,
            request,
            request.user,
            function_name,
            redirect_to
        )

def terms(request):
    """利用規約"""
    
    function_name = get_current_function_name()
    this_url_name = "toukiApp:terms"
    this_html = "toukiApp/terms.html"
    redirect_to = "toukiApp:index"
    tab_title = "利用規約"
    
    try:
        canonical_url = get_canonical_url(request, this_url_name)
        
        context = {
            "title": tab_title,
            "company_data": CompanyData,
            "canonical_url": canonical_url
        }
        return render(request, this_html, context)
    except Exception as e:
        return handle_error(
            e,
            request,
            request.user,
            function_name,
            redirect_to
        )

# def condition(request):           事前の利用条件確認は一旦停止中
#     """利用条件の確認ページ

#         POSTのとき条件全てにチェックが入っているか確認してアカウント登録ページに遷移させる
#         入ってないときはエラーメッセージを表示する
#     """
    
#     function_name = get_current_function_name()
#     this_html = "toukiApp/condition.html"
#     this_url_name = "toukiApp:condition"
#     error_redirect_to = "toukiApp:index"
#     next_redirect_to = "accounts:signup"
#     tab_title = "利用条件確認"
    
#     try:
#         canonical_url = get_canonical_url(request, this_url_name)
        
#         if request.method == "POST":
#             checkboxes = request.POST.getlist("conditionCb")
#             # 条件全てにチェックが入っているとき（formクラスを使用していないため数のみで検証している）
#             if len(checkboxes) == 10:
#                 request.session["condition_passed"] = True
#                 return redirect(next_redirect_to)
#             else:
#                 basic_log(function_name, None, None, "利用条件全てにチェックを入れずにアカウント登録ボタンが押されました")
#                 messages.warning("アクセス不可 利用条件を満たしていない場合は、本システムで対応できないためアカウント登録できません。")

#         context = {
#             "title" : tab_title,
#             "canonical_url": canonical_url
#         }
        
#         return render(request, this_html, context)
    
#     except Exception as e:
#         return handle_error(
#             e, 
#             request, 
#             request.user, 
#             function_name, 
#             error_redirect_to, 
#         )

#不正な投稿があったとき
def csrf_failure(request, reason=""):

    # 何かしらの処理
    return HttpResponseForbidden('<h1>403 アクセスが制限されています。</h1>', content_type='text/html')

# ユーザーに紐づく被相続人の市区町村データを取得する
def get_decedent_city_data(request):
    """被相続人の登録されている市区町村データを取得する
    
        都道府県データを取得したときに市区町村データを取り込んで初期化されてしまうため、
        改めて取得する必要がある
    """
    try:
        function_name = get_current_function_name()
        
        user = User.objects.get(email = request.user)
        decedent = Decedent.objects.filter(user=user).first()
        
        if decedent:
            repsonse_data = {
                "error_level": "success",
                "message": "",
                'city': decedent.city,
                'domicileCity': decedent.domicile_city
            }
        else:
            repsonse_data = {
                "error_level": "warning",
                "message": "被相続人データはありません",
                'city': "",
                'domicileCity': ""
            }
            
        return JsonResponse(repsonse_data)
    except Exception as e:
        return handle_error(
            e,
            request,
            request.user,
            function_name,
            None,
            True
        )

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
        return JsonResponse({'エラー原因': 'ネットワークエラー', '詳細': str(e)}, status=500)
    except ObjectDoesNotExist:
        return JsonResponse({'エラー原因': 'データがありません'}, status=404)
    except Exception as e:
        return JsonResponse({'エラー原因': '想定しないエラー', '詳細': str(e)}, status=500)
    
def fetch_data_with_retry(url, max_retries=3, delay=5, headers=None):
    """API通信とリトライ処理

    Args:
        url (str): APIのURL。
        max_retries (int, optional): 最大リトライ回数。デフォルトは3。
        delay (int, optional): リトライ間の遅延時間(秒)。デフォルトは5。
        headers (dict, optional): リクエストヘッダー。デフォルトはNone。

    Returns:
        requests.Response or None: 成功時はResponseオブジェクト、失敗時はNoneを返す。
    """
    for _ in range(max_retries):
        response = requests.get(url, headers=headers) if headers else requests.get(url)
        if response.status_code == 200:
            return response
        else:
            sleep(delay)  # 指定秒数待つ
    # リトライしても成功しない場合
    return None
    
def get_city_from_resas(prefecture):
    """RESASapiから都道府県コードに紐づく市区町村データを取得する

    国土地理院のものが使用できないときのためのサブ
    
    Args:
        prefecture (str): 都道府県コード

    Returns:
        _type_: _description_
    """
    url = f"https://opendata.resas-portal.go.jp/api/v1/cities?prefCode={prefecture}"
    api_key = os.getenv("RESAS_API_KEY")
    headers = {"X-API-KEY": api_key}
    response = fetch_data_with_retry(url, headers=headers)

    if response:
        #[{"prefCode": val}, {"cityName": val}]の形式にして返す
        data = response.json()["result"]
        return [{'prefCode': r.get('prefCode'), 'cityName': r.get('cityName')} for r in data if 'cityName' in r]
    else:
        return None


def get_city_from_reinfolib(prefecture):
    """入力された都道府県コードを使って国交省の不動産情報ライブラリから市区町村データを取得する

    Args:
        prefecture (str): 都道府県コード

    Returns:
        _type_: _description_
    """
    url = f"https://www.reinfolib.mlit.go.jp/ex-api/external/XIT002?area={prefecture}"
    api_key = os.getenv("CITY_API_KEY")
    headers = {"Ocp-Apim-Subscription-Key": api_key}
    response = fetch_data_with_retry(url, headers=headers)

    if response:
        #[{"prefCode": val}, {"cityName": val}]の形式にして返す
        data = response.json()["data"]
        return [{'prefCode': int(prefecture), 'cityName': r['name']} for r in data]
    else:
        basic_log(get_current_function_name(), {response.status_code}, None, "不動産情報ライブラリのapi通信エラー")
        return None

def get_city(request):
    """入力された都道府県コードを使って市区町村データを取得"""
    try:
        data = json.loads(request.body)
        prefecture = data["prefecture"]
        
        # 先に国土交通省の不動産情報ライブラリを試みる
        city_data = get_city_from_reinfolib(prefecture)
        if city_data is None:
            # 国土交通省のAPIが利用不可能な場合、RESASのAPIを利用
            city_data = get_city_from_resas(int(prefecture))
        if city_data:
            return JsonResponse({"data": city_data})
        else:
            basic_log(get_current_function_name(), None, request.user, "市区町村データ取得のapi通信エラー")
            return JsonResponse({"詳細": "市区町村データの取得に失敗しました。"}, status=500)
    except Exception as e:
        return JsonResponse({"e": str(e)}, status=500)


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
    """前のステップに戻る処理"""
    function_name = get_current_function_name()
    
    try:
        user = request.user
        decedent = Decedent.objects.filter(user=user).first()
        
        data = json.loads(request.body)
        progress = data.get('progress')
        
        if not progress:
            return JsonResponse({
                'status': 'error',
                "message": "progressに値が設定されていません。"
            })
        
        with transaction.atomic():
            decedent.progress = Decimal(progress)
            decedent.save()
        
        return JsonResponse({
            'status': 'success',
            "message": ""
        })
    except Exception as e:
        return handle_error(
            e,
            request,
            request.user,
            function_name,
            None,
            True        
        )

def nav_to_last_user_page(request):
    """ログインしたとき会員が最後に滞在していた会員ページに遷移させる、ないときは進捗状況に合わせたページ"""
    try:
        function_name = get_current_function_name()
        this_html = "account/login.html"
        redirect_to = "account:login"
        
        # セッションから前の会員ページのURLを取得
        last_page = request.session.get('last_user_page', None)
        if last_page:
            return redirect(last_page)
        
        return redirect_to_progress_page(request)     
    
    except Exception as e:
        return handle_error(
            e, 
            request, 
            request.user, 
            function_name, 
            redirect_to, 
        )

def redirect_to_progress_page(request):
    """ユーザーの進捗状況に基づいてリダイレクトする"""
    decedent = request.user.decedent.first()
    
    if decedent:
        return redirect_to_step(decedent.progress)
    
    if request.user.basic_date:
        return redirect(reverse("toukiApp:step_one"))
        
    return redirect(reverse("toukiApp:step_one_trial"))

def redirect_to_step(progress):
    """進捗に基づいて適切なステップページにリダイレクトする"""
    steps = [
        "toukiApp:step_one_trial", 
        "toukiApp:step_one",
        "toukiApp:step_two",
        "toukiApp:step_three",
        "toukiApp:step_four",
        "toukiApp:step_five",
        "toukiApp:step_six",
    ]
    return redirect(reverse(steps[int(progress)]))

# def import_offices(html_file_path):
#     """法務局データスクレイピング処理"""
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

