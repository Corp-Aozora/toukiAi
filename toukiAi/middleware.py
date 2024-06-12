from django.contrib.sessions.models import Session
from django.http import JsonResponse, HttpResponsePermanentRedirect
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.deprecation import MiddlewareMixin
from django.utils.timezone import now

from toukiApp.toukiAi_commons import *

class SaveLastUserPageMiddleware(MiddlewareMixin):
    """
    
        会員ページから公開ページに移動したときに最後に滞在していた会員ページを保存する
        
    """
    def process_view(self, request, view_func, view_args, view_kwargs):
        # リクエストが会員ページかどうかを判定
        is_user_page = any(
            x in request.path
            for x in ["step", "bank_transfer", "delete_account", "change_email", "password/change/", "guidance"]
            if "step_one_trial" not in request.path
        )

        # 現在のページが会員ページで、セッションにlast_public_viewedがない場合、訪問を記録
        if is_user_page:
            request.session['last_user_viewed'] = request.get_full_path()

        # 現在のページが公開ページで、直前のページが会員ページだった場合にセッションに記録
        if not is_user_page and 'last_user_viewed' in request.session:
            request.session['last_user_page'] = request.session.pop('last_user_viewed', None)
            
class RateLimitMiddleware:
    """
    
        回数制限によるstatus403のエラーをstatus429に変更して返す
    
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        # レートリミットによる403エラーをチェック
        if response.status_code == 403 and getattr(request, 'limited', False):
            basic_log(get_current_function_name(), "メール再発行の回数制限エラー", request.user)
            return JsonResponse({
                "error_level": "warning",
                "message": "回数制限に達しました\n時間をおいて再度お試しください"
            }, status=429)
        return response

class OneSessionPerUserMiddleware:
    """
    
        ログインを１つの端末に制限する
        
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # ログインしているかどうかをチェック
        if request.user.is_authenticated:
            current_session_key = request.session.session_key
            last_login_session_key = request.user.last_login_session_key

            # 保存されたセッションキーが現在のセッションキーと異なる場合、古いセッションを削除
            if last_login_session_key and last_login_session_key != current_session_key:
                Session.objects.filter(session_key=last_login_session_key).delete()

            # 現在のセッションキーをユーザープロファイルに保存
            if not last_login_session_key or last_login_session_key != current_session_key:
                request.user.last_login_session_key = current_session_key
                request.user.save(update_fields=['last_login_session_key'])

        response = self.get_response(request)
        return response
    
class RemoveWWWRedirectMiddleware:
    """
    
        www.がついたurlが入力されたとき削除したurlにリダイレクトする
        
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host()
        if host.startswith('www.'):
            return HttpResponsePermanentRedirect(f"https://{host[4:]}{request.get_full_path()}")
        return self.get_response(request)
    
class RemoveSlashMiddleware:
    """
    
        toukiAppのパスのとき最後にスラッシュがあるときは削除する
        
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path = request.path
        # `toukiApp` のパスでスラッシュで終わる場合のみリダイレクト
        if path.startswith("/toukiApp/") and path != "/toukiApp/" and path.endswith("/"):
            return redirect(path.rstrip("/"), permanent=True)

        response = self.get_response(request)
        return response