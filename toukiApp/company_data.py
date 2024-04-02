class CompanyData:
    APP_NAME = "そうぞくとうきくん"
    NAME = "株式会社あおぞら"
    POST_NUMBER = "810-0001"
    ADDRESS = "福岡県福岡市中央区天神二丁目２番１２号"
    BLDG = "Ｔ＆Ｊビルディング７Ｆ"
    CEO = "砂川宏太"
    RECEIVING_PHONE_NUMBER = "０５０－５４８２－５８３２"
    CALLING_PHONE_NUMBER = "０８００－８０５－１５２８"
    MAIL_ADDRESS = "toukiaidev@gmail.com"
    OPENING_HOURS = "10時~20時（土日祝日休み）"
    ESTABLISH_DATE = "令和６年４月1日"
    CAPITAL = "２００万円"
    SUPERVISER = "司法書士　吉永 傑"
    SUPERVISER_BELONG_1 = "福岡県司法書士会所属 第1757号"
    SUPERVISER_BELONG_2 = "簡裁代理認定番号 第1301120号"
    URL = "https://django-render-6agw.onrender.com"
    CHARGE = "サイト上部の料金からご確認いただけます。"
    PAYMENT = "クレジットカード決済又は銀行振り込み"
    PAYMENT_TERMS = "サービス利用開始時"
    START_TIME = "お支払い後直ちに。"
    ABOUT_CANCEL = "原則システム対応外の場合のみ可"
    
class Service:
    BASIC_PRICE = "４９，０００円"
    BASIC_PRICE_INT = 49000
    OPTION1_NAME = "必要証明書の代行"
    OPTION1_PRICE = "２２，０００円"
    OPTION1_PRICE_INT = 22000
    OPTION2_NAME = "弊社提携の司法書士に依頼"
    OPTION2_PRICE = "８８，０００円"
    OPTION2_PRICE_INT = 88000
    
    OPTIONS = [
        {"name" : OPTION1_NAME, "price" : OPTION1_PRICE},
        {"name" : OPTION2_NAME, "price" : OPTION2_PRICE},
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