from django.urls import path
from . import views
 
app_name = 'toukiApp'
 
urlpatterns = [
    path("", views.index, name="index"),
    path("index", views.index, name="index"),
    path("administrator", views.administrator, name="administrator"),
    path("commerce_law", views.commerceLaw, name="commerce_law"),
    path("privacy", views.privacy, name="privacy"),
    path("terms", views.terms, name="terms"),
    path("condition", views.condition, name="condition"),
    
    path('step_one_trial', views.step_one_trial, name='step_one_trial'),
    path('step_one', views.step_one, name='step_one'),
    path('step_two', views.step_two, name='step_two'),
    path('step_three', views.step_three, name='step_three'),
    path('step_four', views.step_four, name='step_four'),
    path('step_division_agreement', views.step_division_agreement, name='step_division_agreement'),
    path('step_POA', views.step_POA, name='step_POA'),
    path('step_application_form', views.step_application_form, name='step_application_form'),
    path('step_diagram', views.step_diagram, name='step_diagram'),
    path('step_five', views.step_five, name='step_five'),
    path('step_six', views.step_six, name='step_six'),
    path("step_inquiry", views.step_inquiry, name="step_inquiry"),

    path("get_decedent_city_data", views.get_decedent_city_data, name="get_decedent_city_data"),
    path("get_registry_name_and_address_city_data", views.get_registry_name_and_address_city_data, name="get_registry_name_and_address_city_data"),
    path("get_heirs_city_data", views.get_heirs_city_data, name="get_heirs_city_data"),
    path("get_city", views.get_city, name="get_city"),
    path("get_office", views.get_office, name="get_office"),
    path("is_email", views.is_email, name="is_email"),
    path("step_back", views.step_back, name="step_back"),
    
    path("redirect_to_progress_page", views.redirect_to_progress_page, name="redirect_to_progress_page"),
    path("nav_to_last_user_page", views.nav_to_last_user_page, name="nav_to_last_user_page"),
    path("sort_out_trial", views.sort_out_trial, name="sort_out_trial"),    
    path('convert_html_to_pdf', views.convert_html_to_pdf, name='convert_html_to_pdf'),
]

