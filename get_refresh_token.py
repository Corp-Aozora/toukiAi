from google_auth_oauthlib.flow import InstalledAppFlow

# OAuth2フローの設定（スコープはメールの送信に関連するもの）
flow = InstalledAppFlow.from_client_secrets_file(
    'google_api_client_secret.json', ['https://www.googleapis.com/auth/gmail.send'])

# ユーザーにブラウザで認証を求める
creds = flow.run_local_server(port=0)

# 取得されたトークン（access_token, refresh_token）を確認
print("Access Token:", creds.token)
print("Refresh Token:", creds.refresh_token)

# トークンを保存して、後で再利用できるようにする
with open('token.json', 'w') as token_file:
    token_file.write(creds.to_json())
