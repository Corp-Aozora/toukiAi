import textwrap

# メールの署名部分
EMAIL_SIGNATURE = textwrap.dedent('''
    -----------------------------------------
    {company_name}
    {company_post_number}
    {company_address}
    {company_bldg}
    {company_receiving_phone_number}
    {company_calling_phone_number}
    営業時間 {company_opening_hours}
    {company_url}
''').rstrip()

EMAIL_TEMPLATE = textwrap.dedent('''
    {username} 様   
    
    弊社のサービスをご利用いただきありがとうございます。
    
    {content}
    
    ご不明な点がありましたら、お気軽にお問い合わせください。
''') + EMAIL_SIGNATURE