class CompanyData:
    NAME = "株式会社SAGA"
    POST_NUMBER = "100-1000"
    ADDRESS = "福岡県福岡市天神1丁目1番1号"
    CEO = "佐賀達也"
    PHONE_NUMBER = "000-1111-2222"
    MAIL_ADDRESS = "abcdef@xxxx.com"
    OPENING_HOURS = "9時~20時（土日祝日休み）"
    ESTABLISH_DATE = "令和1年1月1日"
    CAPITAL = "100万円"
    SUPERVISER = "司法書士 田中太郎"
    SUPERVISER_BELONG = "福岡県司法書士会所属 第1号"
    URL = "https://toukiapp"
    CHARGE = "サイト上部の料金からご確認いただけます。"
    PAYMENT = "銀行振込／クレジットカード決済"
    PAYMENT_TERMS = "アカウント登録時。オプションは都度。"
    START_TIME = "お支払い後直ちに。"
    ABOUT_CANCEL = "サービスに不備があった場合のみキャンセル可。"
    
class Service:
    BASIC_PRICE = "0円"
    BASIC_PRICE_INT = 0
    OPTION1_NAME = "必要証明書の代行"
    OPTION1_PRICE = "22,000円"
    OPTION1_PRICE_INT = 22000
    OPTION2_NAME = "必要証明書のチェック"
    OPTION2_PRICE = "11,000円"
    OPTION2_PRICE_INT = 11000
    OPTION3_NAME = "法定相続証明情報取得"
    OPTION3_PRICE = "16,500円"
    OPTION3_PRICE_INT = 16500
    OPTION4_NAME = "代理申請"
    OPTION4_PRICE = "44,000円"
    OPTION4_PRICE_INT = 44000
    OPTION5_NAME = "全ておまかせ"
    OPTION5_PRICE = "88,000円"
    OPTION5_PRICE_INT = 88000
    OPTION6_NAME = "オプション6"
    OPTION6_PRICE = "60,000円"
    OPTION6_PRICE_INT = 60000
    
    OPTIONS = {
        "option1" : {"name" : OPTION1_NAME, "price" : OPTION1_PRICE},
        "option2" : {"name" : OPTION2_NAME, "price" : OPTION2_PRICE},
        "option3" : {"name" : OPTION3_NAME, "price" : OPTION3_PRICE},
        "option4" : {"name" : OPTION4_NAME, "price" : OPTION4_PRICE},
        "option5" : {"name" : OPTION5_NAME, "price" : OPTION5_PRICE},
        "option6" : {"name" : OPTION6_NAME, "price" : OPTION6_PRICE},
    }
