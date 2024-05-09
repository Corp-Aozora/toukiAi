from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

from common.create_reciept import *
 
app_name = 'accounts'

urlpatterns = [
    path("signup/", views.CustomSignupView.as_view(), name="signup"), #新規登録ページ
    path("login/", views.CustomLoginView.as_view(), name="account_login"), #ログインページ
    path('confirm-email/', views.CustomEmailVerificationSentView.as_view(), name='email_verification_sent'), # 本登録リンク送信完了ページ
    path('confirm-email/resend_confirmation/', views.resend_confirmation, name='resend_confirmation'), # 本登録リンク再発行処理
    path('confirm-email/<key>/', views.CustomConfirmEmailView.as_view(), name='account_confirm_email'), # 本登録確認ページ
    path('password/change/', views.CustomPasswordChangeView.as_view(), name='account_change_password'),
    path('password/change/is_oldpassword/', views.is_oldpassword, name='is_oldpassword'),
    path('password/reset/', views.CustomPasswordResetView.as_view(), name='account_reset_password'),
    path("change_email/", views.change_email, name="change_email"),
    path('confirm/<str:token>/', views.confirm_email, name='confirm_email'),
    path("delete_account/", views.delete_account, name="delete_account"), # 汎用の重複メールアドレスチェック
    path("option_select/", views.option_select, name="option_select"), # オプション選択
    path("bank_transfer/", views.bank_transfer, name="bank_transfer"), # 銀行振込のとき
    
    path("password/reset/is_user_email/", views.is_user_email, name="is_user_email"), 
    path("password/reset/is_valid_email_pattern/", views.is_valid_email_pattern, name="is_valid_email_pattern"),
    path("password/reset/done/is_user_email/", views.is_user_email, name="is_user_email"),
    path("password/reset/done/is_valid_email_pattern/", views.is_valid_email_pattern, name="is_valid_email_pattern"),
    path("is_new_email/", views.is_new_email, name="is_new_email"), # 汎用の重複メールアドレスチェック
    path('create_reciept_view/', CreateRecieptView.as_view(), name='create_reciept_view'),
    
    # 使用しないallauthのurlを404にする
    path('email/', views.error_404, name='account_email'),
    path('google/login/', views.error_404, name='google_login'),
    path('line/login/', views.error_404, name='line_login'),
    path('yahoo/login/', views.error_404, name='yahoo_login'),
    path('social/connections/', views.error_404, name='social_connections'),
    path('social/signup/', views.error_404, name='social_signup'),
    path('password/set/', views.error_404, name='password_set'),
]
