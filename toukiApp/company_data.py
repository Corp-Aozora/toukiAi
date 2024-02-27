class CompanyData:
    APP_NAME = "そうぞくとうきくん"
    NAME = "株式会社あおぞら"
    POST_NUMBER = "100-1000"
    ADDRESS = "福岡県福岡市天神1丁目1番1号"
    CEO = "砂川宏太"
    PHONE_NUMBER = "000-1111-2222"
    MAIL_ADDRESS = "toukiaidev@gmail.com"
    OPENING_HOURS = "10時~20時（土日祝日休み）"
    ESTABLISH_DATE = "令和６年３月1日"
    CAPITAL = "２００万円"
    SUPERVISER = "司法書士　吉永 傑"
    SUPERVISER_BELONG_1 = "福岡県司法書士会所属 第1757号"
    SUPERVISER_BELONG_2 = "簡裁代理認定番号 第1301120号"
    URL = "https://django-render-6agw.onrender.com"
    CHARGE = "サイト上部の料金からご確認いただけます。"
    PAYMENT = "クレジットカード決済"
    PAYMENT_TERMS = "アカウント登録時"
    START_TIME = "お支払い後直ちに。"
    ABOUT_CANCEL = "原則システムに落ち度がある場合のみ可"
    
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
