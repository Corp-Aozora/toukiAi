from .models import *
from .toukiAi_commons import *
from collections import defaultdict
import copy

def get_data_for_application_form(decedent, is_application_data):
    """申請書作成に必要なデータを取得する

    Args:
        decedent (_type_): _description_
        is_application_data (bool): 申請人情報の要否

    Returns:
        _type_: _description_
    """
    #不動産、不動産取得者を紐づける
    a = link_properties_and_acquirer(decedent)
            
    #敷地権を追加する
    b = None
    if any(property_item["property_type"] == "Bldg" for property_item, _ in a):
        b = add_site_data(a, decedent)
    
    #管轄別に不動産をまとめる
    c = sort_by_office(a if b == None else b)
    
    #取得者別に不動産をまとめる
    d = sort_by_acquirers(c)
    
    #申請情報を追加またはせずに返す
    return add_applicant_data(d, decedent) if is_application_data else d

def link_properties_and_acquirer(decedent):
    """不動産情報と不動産取得者を連結した書類作成に必要な範囲のデータを返す

    対象：遺産分割協議証明書、登記申請書、委任状、相続関係図
    それぞれ必要なデータは異なるが汎用できるよう全てを網羅するデータを取得している
    
    Args:
        decedent (_type_): _description_
    """
    try:
        property_types = [Land, House, Bldg]
        properties = [{
            "property_type": x.__name__, #先頭大文字
            "property_id": y.id,
            "number": y.number,
            "purparty": y.purparty,
            "price": y.price,
            "office": y.office,
            "address": y.address,
            "address_number": y.land_number if x.__name__ == "Land" else y.house_number if x.__name__ == "House" else y.bldg_number if x.__name__ == "Bldg" else None,
        } for x in property_types for y in get_querysets_by_condition(x, decedent)]
        if(not properties):
            raise ValueError(f"{get_current_function_name()}\n{decedent.id}に紐づく不動産データがありません")
            
        acquirers = [{
            "id": x.id,
            "property_type": type(x.content_object1).__name__,
            "property_id": x.object_id1,
            "acquirer_type": type(x.content_object2).__name__,
            "acquirer_id": x.object_id2,
            "name": x.content_object2.name,
            "address": "".join(filter(None, [get_prefecture_name(x.content_object2.prefecture), x.content_object2.city, x.content_object2.address, x.content_object2.bldg])),
            "percentage": x.percentage,
        } for x in get_querysets_by_condition(PropertyAcquirer, decedent, check_exsistance=True)]
        
        formatted_data = []
        for property in properties:
            matching_acquirers = [
                acquirer for acquirer in acquirers 
                if compare_dict_by_two_key(acquirer, property, "property_type", "property_id")
            ]
            if matching_acquirers:
                formatted_data.append((property, matching_acquirers))
        
        is_all_properties_and_property_acquirers_related(formatted_data, properties, acquirers)

        return formatted_data
    except Exception as e:
        raise e
    
def add_site_data(data, decedent):
    """申請データに敷地権を追加する

    Args:
        data (_type_): _description_
        decedent (_type_): _description_

    Returns:
        _type_: _description_
    """
    sites = get_querysets_by_condition(Site, decedent)

    formatted_data = []    
    for d in data:
        
        if d[0]["property_type"] != "Bldg":
            formatted_data.append((d[0], d[1]))
            continue

        related_sites = []
        for site in sites:
            
            if d[0]["property_id"] == site.bldg_id:
                relate_site_data = {
                    "id": site.id,
                    "bldg": site.bldg_id,
                    "number": site.number,
                    "address_and_land_number": site.address_and_land_number,
                    "type": site.type,
                    "purparty": site.purparty_bottom + "分の" + site.purparty_top,
                    "price": site.price,
                }
                related_sites.append(relate_site_data)
                
        if related_sites:
            formatted_data.append((d[0], d[1], related_sites))
    
    is_all_site_related(formatted_data, sites)
    
    return formatted_data

def sort_by_office(data):
    """管轄別に不動産を分ける

    Args:
        lands (_type_): _description_
        houses (_type_): _description_
        bldgs (_type_): _description_
    """
    # data の各データを office の値でグループ化
    office_groups = defaultdict(list)
    for d in data:
        office = d[0]['office']
        office_groups[office].append(d)

    # office別にソートしたデータ形式に変換する
    formatted_data = []
    for office, x in office_groups.items():
        properties = [y[0] for y in x]  # 同じ office を持つ property データ
        acquirers_list = [y[1] for y in x]  # 同じ office を持つ acquirers データ
        # data[2] （siteデータ）が存在する場合はそれも含める
        additional_data = [y[2] for y in x if len(y) > 2]
        formatted_data.append((properties, acquirers_list, additional_data))

    return formatted_data

def sort_by_acquirers(data):
    """取得者別に不動産を分ける

    Args:
        data (_type_): _description_
    """
    formatted_data = [] 
    for d in data:
        properties, acquirers_list = d[:2]
        sites_list = d[2] if len(d) > 2 else []
        
        compare_list = copy.deepcopy(acquirers_list) #dと比較する用のコピー
        integrated_data = copy.deepcopy(acquirers_list) #データを取得するためのコピー
        #同じ取得者をintegrated_dataに追加する処理
        for i, acquirers in enumerate(acquirers_list):
            for j, compares in enumerate(compare_list):
                #同じインデックス、又はデータ数が異なるとき、検証不要
                if i == j or len(acquirers) != len(compares):
                    continue

                # 条件を満たす場合、integrated_data[j]にacquirersの要素を追加
                acquirers_set = {(x["acquirer_type"], x["acquirer_id"]) for x in acquirers}
                compares_set = {(x["acquirer_type"], x["acquirer_id"]) for x in compares}
                if acquirers_set.issubset(compares_set):
                    integrated_data[j].extend(acquirers)
        
        #取得者の重複解消                    
        seen = set()
        unique_list = []
        for lst in integrated_data:
            ident = frozenset(tuple(sorted(d.items())) for d in lst)
            if ident not in seen:
                seen.add(ident)
                unique_list.append(lst)

        #他のデータを追加する
        for uniques in unique_list:
            property_data = []
            site_data = []
            for u in uniques:
                for p in properties:
                    if compare_dict_by_two_key(u, p, "property_type", "property_id"):
                        if p not in property_data:
                            property_data.append(p)
                        break
                    
                if u["property_type"] == "Bldg":
                    for sites in sites_list:
                        if sites[0]["bldg"] == u["property_id"]:
                            for site in sites:
                                if site not in site_data:                                
                                    site_data.append(site)
            formatted_data.append((property_data, uniques, site_data))
    
    return formatted_data

def add_applicant_data(data, decedent):
    """申請人情報を追加する

    pattern 0:代理人
    pattern 1:申請人
    pattern 2:申請人兼代理人
    pattern 3:相続人を代理人扱い
    
    Args:
        data (_type_): 申請人情報がない申請データ
        decedent (_type_): 被相続人情報

    Returns:
        (不動産データ, 不動産取得者データ, 申請人データ, 敷地権データ)
    """
    
    def is_applicant(acquirers, content_type, object_id):
        """取得者の中に申請人がいるか判定"""
        return  any(acquirer["acquirer_type"] == content_type and
                acquirer["acquirer_id"] == object_id
                for acquirer in acquirers)
    
    function_name = get_current_function_name()
    
    application = Application.objects.filter(decedent=decedent).first()
    if not application:
        raise ValueError(f"{function_name}でエラー\napplicationがNoneです")
    
    applicant_content_type = type(application.content_object).__name__
    applicant_object_id = application.object_id
    
    formatted_data = []
    for d in data:
        properties, acquirers = d[:2]
        sites_list = d[2] if len(d) > 2 else []

        pattern = None
        # 申請人が代理人
        if application.is_agent:
            pattern = 0
        elif is_applicant(acquirers, applicant_content_type, applicant_object_id):
            # 申請人が申請人兼代理人または１人が取得する相続人
            # 取得者の重複をなくす
            unique_acquirers = list({(x["acquirer_type"], x["acquirer_id"]) for x in acquirers})
            pattern = 1 if len(unique_acquirers) == 1 else 2
        else:
            # 相続人を代理人扱い（この申請では取得者ではないとき）
            pattern = 3
            
        #取得者になっていないとき代理人に変更する
        applicant_form = assign_applicant_data(pattern, application)
        formatted_data.append((properties, acquirers, [applicant_form], sites_list))
    
    return formatted_data

def is_all_properties_and_property_acquirers_related(data, properties, acquirers):
    """不動産と不動産取得者が全て関連付けられたかチェックする

    Args:
        data (_type_): _description_
        properties (_type_): _description_
        acquirers (_type_): _description_
    """
    # properties と acquirers が全て関連付けられたかを確認する
    properties_identifiers_set = {(x["property_type"], x["property_id"]) for x in properties}
    acquirers_identifiers_set = {(x["id"]) for x in acquirers}

    # 関連データから properties と acquirers の識別子を集める
    related_properties_identifiers = {(x[0]["property_type"], x[0]["property_id"]) for x in data}
    related_acquirers_identifiers = {(y["id"]) for _, x in data for y in x}

    # 未関連の properties と acquirers を見つける
    unrelated_properties = properties_identifiers_set - related_properties_identifiers
    unrelated_acquirers = acquirers_identifiers_set - related_acquirers_identifiers

    if unrelated_properties:
        raise ValueError(f"関連付けられなかった properties: {unrelated_properties}. ")
    if unrelated_acquirers:
        raise ValueError(f"関連付けられなかった acquirers: {unrelated_acquirers}.")

def is_all_site_related(data, sites):
    """敷地権が全て関連付けされたか確認する

    Args:
        data (_type_): _description_
        sites (_type_): _description_

    Raises:
        ValidationError: _description_
    """
    result_site_ids = set()
    for d in data:
        if d[0]["property_type"] == "Bldg":
            result_site_ids.update(x["id"] for x in d[2])

    all_site_ids = set(site.id for site in sites)
    missing_site_ids = all_site_ids - result_site_ids

    if missing_site_ids:
        missing_ids_str = ", ".join(str(id) for id in missing_site_ids)
        raise ValueError(f"関連付けられていない敷地権があります: {missing_ids_str}")

def assign_applicant_data(pattern, data):
    """申請人データを登録する
    
    pattern 0:代理人
    pattern 1:申請人
    pattern 2:申請人兼代理人
    pattern 3:代理人扱い

    Args:
        pattern (num): 上記patternのとおり
        data (Application): Applicationから取得したクエリセット
    """
    
    form = get_applicant_form()
    form.update({
        "content_object": data.content_object,
        "is_return": data.is_return,
        "is_mail": data.is_mail,
    })
    
    if pattern == 0:
        form.update({
            "position": "代理人",
            "phone_number": "",
            "is_agent": data.is_agent,
            "agent_name": data.agent_name,
            "agent_address": format_address(data.agent_address),
            "agent_phone_number": data.agent_phone_number,
        })
    elif pattern == 1:
        form.update({
            "position": "",
            "phone_number": data.phone_number,
            "is_agent": data.is_agent,
            "agent_name": "",
            "agent_address": "",
            "agent_phone_number": "",
        })
    else:
        address = "".join([
            get_prefecture_name(data.content_object.prefecture),
            data.content_object.city,
            data.content_object.address,
            data.content_object.bldg or ""
        ])
        form.update({
            "position": "申請人兼代理人" if pattern == 1 else "代理人",
            "is_agent": "true",
            "agent_name": data.content_object.name,
            "agent_address": format_address(address),
            "agent_phone_number": data.phone_number,
        })
        
    return form

def get_applicant_form():
    """申請人データ用のフォーム"""
    return {
        "content_object": "",
        "phone_number": "",
        "is_agent": "false",
        "position": "", #空欄、申請人兼代理人または代理人
        "agent_name": "",
        "agent_address": "",
        "agent_phone_number": "",
        "is_return": "",
        "is_mail": "",
    }