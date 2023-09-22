class Sections:
    STEP1 = "基本データ入力"
    STEP1_1 = "お亡くなりになった方について"
    STEP1_2 = "相続人の判定"
    STEP1_CONTENT = [
        STEP1_1, 
        STEP1_2,
        ]

    STEP2 = "必要書類一覧"
    STEP2_1 = "登記対象の不動産の登記情報又は全部事項証明書"
    STEP2_2 = "被相続人の住民票の除票又は戸籍の附票"
    STEP2_3 = "被相続人の出生から死亡までの戸籍謄本"
    STEP2_4 = "登記対象の不動産の本年度の課税明細書又は固定資産評価証明書"
    STEP2_5 = "全相続人の全部事項証明書"
    STEP2_6 = "全相続人の印鑑証明書"
    STEP2_7 = "不動産を取得する方の住民票又は戸籍の附票"
    STEP2_CONTENT = [
        STEP2_1,
        STEP2_2,
        STEP2_3,
        STEP2_4,
        STEP2_5,
        STEP2_6,
        STEP2_7,
        ]

    STEP3 = "詳細データ入力"
    STEP3_1 = "被相続人情報"
    STEP3_2 = "相続人情報"
    STEP3_3 = "遺産分割方法"
    STEP3_4 = "不動産情報"
    STEP3_5 = "土地情報"
    STEP3_6 = "建物情報"
    STEP3_7 = "区分建物情報"
    STEP3_8 = "申請情報"
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
    STEP4_2 = "相続関係図"
    STEP4_3 = "登記申請書"
    STEP4_CONTENT = [
        STEP4_1,
        STEP4_2,
        STEP4_3,
        ]

    STEP5 = "法務局に申請"
    STEP5_1 = "下記書類を各通コピーしてください"
    STEP5_2 = "書類を下記順番に重ねて左側2か所をホッチキスで留めてください。"
    STEP5_3 = "2でまとめた書類を下記のとおりに処理してください。"
    STEP5_4 = "書類の原本は申請書類と同じ順番で重ねてクリアファイル等にはさんでください。"
    STEP5_5 = "最後に下記を確認してください。"
    STEP5_6 = " 郵便局で収入印紙とレターパックプラスを2枚購入して法務局に書類を送付してください。"
    STEP5_CONTENT = [
        STEP5_1,
        STEP5_2,
        STEP5_3,
        STEP5_4,
        STEP5_5,
        STEP5_6,
        ]

    STEP6 = "申請後について"
    STEP6_1 = "提出した書類に不備があった場合"
    STEP6_2 = "手続が完了したら"
    STEP6_3 = "なんか宣伝とか"
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