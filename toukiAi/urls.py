from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from accounts import views as accounts_view
from django.conf.urls.static import static

def has_permission(request):
    return request.user.is_staff

admin.site.site_header = "とうきくん管理者サイト"
admin.site.site_title = "とうきくん管理者サイト"
admin.site.index_title = "モデル一覧"
admin.site.site_url = None
admin.site.has_permission = has_permission
 
urlpatterns = [
    path('admin/', admin.site.urls),
    path('toukiApp/', include('toukiApp.urls')),
    path("", RedirectView.as_view(url="/toukiApp/")),
    path("account/", include("allauth.urls")),
    path('account/', include('accounts.urls')),
    path('403/', accounts_view.error_403, name="error_403")
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# if settings.DEBUG:
    
#     import debug_toolbar
#     urlpatterns = [
#         path('__debug__/', include(debug_toolbar.urls)),
#     ] + urlpatterns
    