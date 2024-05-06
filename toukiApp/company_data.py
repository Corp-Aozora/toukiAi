class CompanyData:
    APP_NAME = "そうぞくとうきくん"
    NAME = "株式会社あおぞら"
    POST_NUMBER = "〒８１０－０００１"
    ADDRESS = "福岡県福岡市中央区天神二丁目２番１２号"
    BLDG = "Ｔ＆Ｊビルディング７Ｆ"
    CEO = "砂川宏太"
    MANAGER = "佐賀達也"
    RECEIVING_PHONE_NUMBER = "０８００－８０５－１５２８（着信専用）"
    CALLING_PHONE_NUMBER = "０５０－５４８２－５８３２（発信専用）"
    MAIL_ADDRESS = "souzokutoukikun@aozoratouki.com"
    DEBUG_MAIL_ADDRESS = "toukiaidev@gmail.com"
    OPEN_LINE_ID = "@souzokutoukikun-o"
    OPEN_LINE_QR = "https://qr-official.line.me/gs/M_747qqpex_GW.png?oat_content=qr"
    LIMITED_LINE_ID = "@souzokutoukikun-u"
    LIMITED_LINE_QR = "https://qr-official.line.me/gs/M_020gkjfm_GW.png?oat_content=qr"
    OPENING_HOURS = "１０時～２０時（土日祝日休み）"
    ESTABLISH_DATE = "令和６年４月1日"
    CAPITAL = "２００万円"
    SUPERVISER = "司法書士　吉永 傑"
    SUPERVISER_BELONG_1 = "福岡県司法書士会所属 第1757号"
    SUPERVISER_BELONG_2 = "簡裁代理認定番号 第1301120号"
    URL = "https://aozoratouki.com"
    TRIAL_URL = "https://aozoratouki.com/toukiApp/step_one_trial"
    CHARGE = "サイト上部の「料金」からご確認いただけます。"
    # PAYMENT = "クレジットカード決済又は銀行振込"
    PAYMENT = "銀行振込（２０２４年５月末までにクレジット決済導入予定です）"
    PAYMENT_TERMS = "サービス利用開始時"
    START_TIME = "お支払いを確認後直ちに"
    ABOUT_CANCEL = "サービス提供後システム対応外であることが判明した場合のみ可"
    BANK_NAME = "GMOあおぞらネット銀行"
    BANK_BRANCH_NAME = "法人第二営業部"
    BANK_ACCOUNT_TYPE = "普通"
    BANK_ACCOUNT_NUMBER = "１８２２５２２"
    BANK_ACCOUNT_NAME = "カ）アオゾラ"
    
class Service:
    BASIC_NAME = "システムの利用"
    BASIC_PRICE = "４９，０００円"
    BASIC_PRICE_INT = 49000
    CAMPAIGN_BASIC_PRICE_STR = "３９，０００円"
    CAMPAIGN_BASIC_PRICE_INT = 39000
    
    OPTION1_NAME = "書類取得代行"
    OPTION1_PRICE_STR = "３５，０００円"
    OPTION1_PRICE_INT = 35000
    CAMPAIGN_OPTION1_PRICE_STR = "３０，０００円"
    CAMPAIGN_OPTION1_PRICE_INT = 30000
    
    OPTION2_NAME = "弊社提携の司法書士に依頼"
    OPTION2_PRICE_STR = "１０９，０００円"
    OPTION2_PRICE_INT = 109000
    CAMPAIGN_OPTION2_PRICE_STR = "９９，０００円"
    CAMPAIGN_OPTION2_PRICE_INT = 99000
    
    OPTIONS = [
        {"name" : OPTION1_NAME, "price" : OPTION1_PRICE_STR},
        {"name" : OPTION2_NAME, "price" : OPTION2_PRICE_STR},
    ]

    STEP_TITLES = {
        "one": "１．基本データ入力",
        "two": "２．必要書類一覧",
        "three": "３．詳細データ入力",
        "four": "４．書類作成",
        "five": "５．法務局に提出",
        "six": "申請後について",
        "inquiry": "お問い合わせ",
    }