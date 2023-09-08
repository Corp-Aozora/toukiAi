from django.urls import path
from . import views
 
app_name = 'toukiApp'
 
urlpatterns = [
    path("", views.index, name="index"),
    path("administrator", views.administrator, name="administrator"),
    path("commerce-law", views.commerceLaw, name="commerce-law"),
    path("privacy", views.privacy, name="privacy"),
    path("terms", views.terms, name="terms"),
    path("condition", views.condition, name="condition"),
    
    path('step_one', views.step_one, name='step_one'),
    path("step_user", views.step_user, name="step_user"),
    path("step_inquiry", views.step_inquiry, name="step_inquiry"),

    path("get_city", views.get_city, name="get_city"),

]