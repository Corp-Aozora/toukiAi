class Sections:
    STEP1 = "基本データ入力"
    STEP1_1 = "お亡くなりになった方（被相続人）"
    STEP1_2 = "配偶者"
    STEP1_3 = "子供共通"
    STEP1_4 = "各子"
    STEP1_5 = "子の配偶者"
    STEP1_6 = "孫"
    STEP1_7 = "父"
    STEP1_8 = "母"
    STEP1_9 = "父方の祖父"
    STEP1_10 = "父方の祖母" 
    STEP1_11 = "母方の祖父"
    STEP1_12 = "母方の祖母"
    STEP1_13 = "兄弟姉妹共通"
    STEP1_14 = "各兄弟姉妹"
    STEP1_15 = "その他"
    STEP1_CONTENT = [
        STEP1_1, 
        STEP1_2,
        STEP1_3,
        STEP1_4,
        STEP1_5,
        STEP1_6,
        STEP1_7,
        STEP1_8,
        STEP1_9,
        STEP1_10,
        STEP1_11,
        STEP1_12,
        STEP1_13,
        STEP1_14,
        STEP1_15,
    ]

    STEP2 = "必要書類一覧"
    STEP2_1 = "亡くなった方の出生から死亡までの戸籍謄本"
    STEP2_2 = "被相続人の住民票の除票又は戸籍の附票"
    STEP2_3 = "固定資産評価証明書"
    STEP2_4 = "登記簿謄本"
    STEP2_5 = "不動産を取得する方の住民票又は戸籍の附票"
    STEP2_6 = "全相続人の印鑑証明書"
    STEP2_7 = "全相続人の全部事項証明書"
    STEP2_8 = "その他"
    STEP2_CONTENT = [
        STEP2_1,
        STEP2_2,
        STEP2_3,
        STEP2_4,
        STEP2_5,
        STEP2_6,
        STEP2_7,
        STEP2_8,
    ]

    STEP3 = "詳細データ入力"
    STEP3_1 = "被相続人情報"
    STEP3_2 = "相続人情報"
    STEP3_3 = "遺産分割方法"
    STEP3_4 = "不動産の数"
    STEP3_4 = "土地情報"
    STEP3_5 = "建物情報"
    STEP3_6 = "区分建物情報"
    STEP3_7 = "申請情報"
    STEP3_8 = "その他"
    STEP3_CONTENT = [
        STEP3_1,
        STEP3_2,
        STEP3_3,
        STEP3_4,
        STEP3_5,
        STEP3_6,
        STEP3_7,
        STEP3_8,
    ]

    STEP4 = "書類の印刷"
    STEP4_1 = "遺産分割協議証明書"
    STEP4_2 = "委任状"
    STEP4_3 = "登記申請書"
    STEP4_4 = "相続関係説明図"
    STEP4_5 = "その他"
    STEP4_CONTENT = [
        STEP4_1,
        STEP4_2,
        STEP4_3,
        STEP4_4,
        STEP4_5,
    ]

    STEP5 = "法務局に申請"
    STEP5_1 = "取得した書類を確認する"
    STEP5_2 = "下記書類を登記申請書（申請書）と同じ通数コピーする"
    STEP5_3 = "下記の順番で書類を全て重ねて左側2か所をホッチキスで留めする"
    STEP5_4 = "３でホッチキス留めした書類に記入押印等する"
    STEP5_5 = "４まで処理した書類の後ろに書類の原本を以下の順番で重ねてクリアファイルにはさむ"
    STEP5_6 = "法務局に書類を提出する"
    STEP5_7 = "その他"
    STEP5_CONTENT = [
        STEP5_1,
        STEP5_2,
        STEP5_3,
        STEP5_4,
        STEP5_5,
        STEP5_6,
        STEP5_7,
    ]

    STEP6 = "申請後について"
    STEP6_1 = "提出した申請書類に不備があった場合"
    STEP6_2 = "手続が完了したら"
    STEP6_3 = "その他"
    STEP6_CONTENT = [
        STEP6_1,
        STEP6_2,
        STEP6_3,
    ]

    SERVICE_CONTENT = [
        STEP1,
        STEP2,
        STEP3,
        STEP4,
        STEP5,
        STEP6,
    ]

    SECTIONS = {
        STEP1 : STEP1_CONTENT,
        STEP2 : STEP2_CONTENT,
        STEP3 : STEP3_CONTENT,
        STEP4 : STEP4_CONTENT,
        STEP5 : STEP5_CONTENT,
        STEP6 : STEP6_CONTENT,
    }
    
    # UserInquiryモデルで使用するリスト
    CATEGORY_LIST = [(str(i), x) for i, x in enumerate(SERVICE_CONTENT)]
    SUBJECT_LIST = [(str(i) + "_" + str(j), x) for i, value in enumerate(SECTIONS.values()) for j, x in enumerate(value)]
    
    # UserInquiryモデルから取得したデータを表示するデータに復元するための定数
    CATEGORY_MAPPING = {str(i): x for i, x in enumerate(SERVICE_CONTENT)}
    SUBJECT_MAPPING = {str(i) + "_" + str(j): x for i, value in enumerate(SECTIONS.values()) for j, x in enumerate(value)}
    
    @classmethod
    def get_category(cls, category_key):
        category = cls.CATEGORY_MAPPING.get(category_key)
        if category is None:
            raise ValueError(f"進捗状況の値が想定していない値です")
        return category
    
    @classmethod
    def get_subject(cls, subject_key):
        subject = cls.SUBJECT_MAPPING.get(subject_key)
        if subject is None:
            raise ValueError(f"項目の値が想定していない値です")
        return subject
