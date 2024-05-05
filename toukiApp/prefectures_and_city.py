PREFECTURES = (
    ("", '選択してください'),
    ("01", '北海道'),
    ("02", '青森県'),
    ("03", '岩手県'),
    ("04", '宮城県'),
    ("05", '秋田県'),
    ("06", '山形県'),
    ("07", '福島県'),
    ("08", '茨城県'),
    ("09", '栃木県'),
    ("10", '群馬県'),
    ("11", '埼玉県'),
    ("12", '千葉県'),
    ("13", '東京都'),
    ("14", '神奈川県'),
    ("15", '新潟県'),
    ("16", '富山県'),
    ("17", '石川県'),
    ("18", '福井県'),
    ("19", '山梨県'),
    ("20", '長野県'),
    ("21", '岐阜県'),
    ("22", '静岡県'),
    ("23", '愛知県'),
    ("24", '三重県'),
    ("25", '滋賀県'),
    ("26", '京都府'),
    ("27", '大阪府'),
    ("28", '兵庫県'),
    ("29", '奈良県'),
    ("30", '和歌山県'),
    ("31", '鳥取県'),
    ("32", '島根県'),
    ("33", '岡山県'),
    ("34", '広島県'),
    ("35", '山口県'),
    ("36", '徳島県'),
    ("37", '香川県'),
    ("38", '愛媛県'),
    ("39", '高知県'),
    ("40", '福岡県'),
    ("41", '佐賀県'),
    ("42", '長崎県'),
    ("43", '熊本県'),
    ("44", '大分県'),
    ("45", '宮崎県'),
    ("46", '鹿児島県'),
    ("47", '沖縄県'),
)

# PREFECTURES = (
#     ("", '選択してください'),
#     (1, '北海道'),
#     (2, '青森県'),
#     (3, '岩手県'),
#     (4, '宮城県'),
#     (5, '秋田県'),
#     (6, '山形県'),
#     (7, '福島県'),
#     (8, '茨城県'),
#     (9, '栃木県'),
#     (10, '群馬県'),
#     (11, '埼玉県'),
#     (12, '千葉県'),
#     (13, '東京都'),
#     (14, '神奈川県'),
#     (15, '新潟県'),
#     (16, '富山県'),
#     (17, '石川県'),
#     (18, '福井県'),
#     (19, '山梨県'),
#     (20, '長野県'),
#     (21, '岐阜県'),
#     (22, '静岡県'),
#     (23, '愛知県'),
#     (24, '三重県'),
#     (25, '滋賀県'),
#     (26, '京都府'),
#     (27, '大阪府'),
#     (28, '兵庫県'),
#     (29, '奈良県'),
#     (30, '和歌山県'),
#     (31, '鳥取県'),
#     (32, '島根県'),
#     (33, '岡山県'),
#     (34, '広島県'),
#     (35, '山口県'),
#     (36, '徳島県'),
#     (37, '香川県'),
#     (38, '愛媛県'),
#     (39, '高知県'),
#     (40, '福岡県'),
#     (41, '佐賀県'),
#     (42, '長崎県'),
#     (43, '熊本県'),
#     (44, '大分県'),
#     (45, '宮崎県'),
#     (46, '鹿児島県'),
#     (47, '沖縄県'),
# )

DESIGNATED_CITIES = [
    "札幌市", "仙台市", "さいたま市", "千葉市", "横浜市",
    "川崎市", "相模原市", "新潟市", "静岡市", "浜松市",
    "名古屋市", "京都市", "大阪市", "堺市", "神戸市",
    "岡山市", "広島市", "北九州市", "福岡市", "熊本市"
]

def get_prefecture_list():
    """都道府県リストを取得する

    Returns:
        _type_: _description_
    """
    return [x[1] for x in PREFECTURES if x[0]]

def format_address(address):
    """入力された住所を修正する

    住所の市が政令指定都市または都道府県と同名のとき、都道府県を削除する
    
    Args:
        address (str): 入力された住所

    Returns:
        str: 修正された住所
    """
    # 都道府県名のリスト
    prefectures = get_prefecture_list()

    for prefecture in prefectures:
        city_name = prefecture.rstrip("都道府県")  # "都"、"道"、"府"、"県"を削除
        city_with_suffix = city_name + "市"  # 「市」を追加

        # 住所が政令指定都市のとき、または市が都道府県と同じ名前のとき都道府県を削除
        if city_with_suffix in address or any(city in address for city in DESIGNATED_CITIES):
            address = address.replace(prefecture, "", 1)
            break  # 一致する都道府県が見つかったらループを抜ける

    return address

def get_full_address(instance, is_instance_dict=False, is_domicile=False, is_format=False):
    """インスタンスが持つ住所情報をつなげて返す"""
    full_address = ""
    if is_instance_dict:
        if is_domicile:
            full_address = get_prefecture_name(instance["domicile_prefecture"]) + instance["domicile_city"] + instance["domicile_address"]
        else:
            full_address = get_prefecture_name(instance["prefecture"]) + instance["city"] + instance["address"]
            if instance["bldg"]:
                full_address += "\n" + instance["bldg"]
    else:
        if is_domicile:
            full_address = get_prefecture_name(instance.domicile_prefecture) + instance.domicile_city + instance.domicile_address
        else:
            full_address = get_prefecture_name(instance.prefecture) + instance.city + instance.address
            if instance.bldg:
                full_address += "\n" + instance.bldg
            
    return format_address(full_address) if is_format else full_address
        
def get_prefecture_name(prefecture_code):
    """都道府県コードから都道府県名を取得する

    Args:
        prefecture_code (_type_): _description_

    Returns:
        str: prefecture 都道府県
    """
    
    return next((name for code, name in PREFECTURES if code == prefecture_code), "")    