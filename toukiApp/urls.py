from django.urls import path
from . import views
 
app_name = 'toukiApp'
 
urlpatterns = [
    path("", views.index, name="index"),
    path("index", views.index, name="index"),
    path("administrator", views.administrator, name="administrator"),
    path("commerce-law", views.commerceLaw, name="commerce-law"),
    path("privacy", views.privacy, name="privacy"),
    path("terms", views.terms, name="terms"),
    path("condition", views.condition, name="condition"),
    
    path('step_one', views.step_one, name='step_one'),
    path('step_two', views.step_two, name='step_two'),
    path('step_three', views.step_three, name='step_three'),
    path("step_option_select", views.step_option_select, name="step_option_select"),
    path("step_inquiry", views.step_inquiry, name="step_inquiry"),

    path("get_city", views.get_city, name="get_city"),
    path("is_email", views.is_email, name="is_email"),
]