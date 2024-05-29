import textwrap

# メールの署名部分
EMAIL_SIGNATURE = textwrap.dedent('''
    -----------------------------------------
    {company_name}
    {company_post_number}
    {company_address}
    {company_bldg}
    電話番号 {company_receiving_phone_number}
    ※弊社からお客様にお電話するときに表示される電話番号
      {company_calling_phone_number}
    営業時間 {company_opening_hours}
    ホームページ {company_url}
''').rstrip()

EMAIL_TEMPLATE = textwrap.dedent('''
    {username} 様   
    
    弊社のサービスをご利用いただきありがとうございます。
    
    {content}
    
    ご不明な点がありましたら、お気軽にお問い合わせください。
''') + EMAIL_SIGNATURE