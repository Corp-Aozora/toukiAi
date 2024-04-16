from django.http import JsonResponse
from django.urls import reverse
from django.utils.deprecation import MiddlewareMixin

from toukiApp.toukiAi_commons import *

class SaveLastUserPageMiddleware(MiddlewareMixin):
    """会員ページから公開ページに移動したときに最後に滞在していた会員ページを保存する"""
    def process_view(self, request, view_func, view_args, view_kwargs):
        # リクエストが会員ページかどうかを判定（会員ページのURLに特定のパターンがあると仮定）
        is_user_page = "step" in request.path

        # 現在のページが会員ページで、セッションにlast_public_viewedがない場合、訪問を記録
        if is_user_page:
            request.session['last_user_viewed'] = request.get_full_path()

        # 現在のページが公開ページで、直前のページが会員ページだった場合にセッションに記録
        if not is_user_page and 'last_user_viewed' in request.session:
            request.session['last_user_page'] = request.session.pop('last_user_viewed', None)
            
class RateLimitMiddleware:
    """回数制限による403のエラーを429に変更して返す"""
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
