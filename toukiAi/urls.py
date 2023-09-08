from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

def has_permission(request):
    return request.user.is_staff

admin.site.site_header = "自分でできる登記管理者サイト"
admin.site.site_title = "自分でできる登記管理者サイト"
admin.site.index_title = "モデル一覧"
admin.site.site_url = None
admin.site.has_permission = has_permission
 
urlpatterns = [
    path('admin/', admin.site.urls),
    path('toukiApp/', include('toukiApp.urls')),
    path("", RedirectView.as_view(url="/toukiApp/")),
    path("account/", include("allauth.urls")),
    path('account/', include('accounts.urls')),
]