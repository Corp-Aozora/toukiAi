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
    path('step_four', views.step_four, name='step_four'),
    path('step_five', views.step_five, name='step_five'),
    path('step_six', views.step_six, name='step_six'),
    path("step_option_select", views.step_option_select, name="step_option_select"),
    path("step_inquiry", views.step_inquiry, name="step_inquiry"),

    path("get_decedent_city_data", views.get_decedent_city_data, name="get_decedent_city_data"),
    path("get_registry_name_and_address_city_data", views.get_registry_name_and_address_city_data, name="get_registry_name_and_address_city_data"),
    path("get_heirs_city_data", views.get_heirs_city_data, name="get_heirs_city_data"),
    path("get_city", views.get_city, name="get_city"),
    path("get_office", views.get_office, name="get_office"),
    path("is_email", views.is_email, name="is_email"),
    path("step_back", views.step_back, name="step_back"),
]

