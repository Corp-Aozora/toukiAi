from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.contrib.staticfiles.views import serve
from django.urls import path, include
from django.views.generic import RedirectView
from .sitemaps import StaticViewSitemap

import os

from accounts import views as accounts_view

def has_permission(request):
    return request.user.is_staff

admin.site.site_header = "とうきくん管理者サイト"
admin.site.site_title = "とうきくん管理者サイト"
admin.site.index_title = "モデル一覧"
admin.site.site_url = None
admin.site.has_permission = has_permission
 
sitemaps = {
    'static': StaticViewSitemap(),
}
 
urlpatterns = [
    path('saga2497admin/', admin.site.urls),
    path('toukiApp/', include('toukiApp.urls')),
    path("", RedirectView.as_view(url="/toukiApp/")),
    path('account/', include('accounts.urls')),
    path("account/", include("allauth.urls")),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),
    path('robots.txt', serve, {'path': 'robots.txt', 'document_root': os.path.dirname(os.path.abspath(__file__))}),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# if settings.DEBUG:
    
#     import debug_toolbar
#     urlpatterns = [
#         path('__debug__/', include(debug_toolbar.urls)),
#     ] + urlpatterns

# カスタム403エラービューを設定
handler403 = accounts_view.error_403
handler404 = accounts_view.error_404
handler500 = accounts_view.error_500