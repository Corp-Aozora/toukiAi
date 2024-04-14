from django.utils.deprecation import MiddlewareMixin

class SaveLastUserPageMiddleware(MiddlewareMixin):
    def process_view(self, request, view_func, view_args, view_kwargs):
        # リクエストが会員ページかどうかを判定（会員ページのURLに特定のパターンがあると仮定）
        is_user_page = "step" in request.path

        # 現在のページが会員ページで、セッションにlast_public_viewedがない場合、訪問を記録
        if is_user_page:
            request.session['last_user_viewed'] = request.get_full_path()

        # 現在のページが公開ページで、直前のページが会員ページだった場合にセッションに記録
        if not is_user_page and 'last_user_viewed' in request.session:
            request.session['last_user_page'] = request.session.pop('last_user_viewed', None)