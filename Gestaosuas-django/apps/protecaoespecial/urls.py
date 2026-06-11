from django.urls import path
from . import views

app_name = "protecaoespecial"

urlpatterns = [
    path("<uuid:pk>/", views.ProtecaoEspecialHomeView.as_view(), name="home"),
    path("<uuid:pk>/atualizar/protetivo/", views.CreasProtetivoFormView.as_view(), name="form-protetivo"),
    path("<uuid:pk>/atualizar/socioeducativo/", views.CreasSocioeducativoFormView.as_view(), name="form-socioeducativo"),
    path("<uuid:pk>/dados/protetivo/", views.CreasProtetivoDataView.as_view(), name="data-protetivo"),
    path("<uuid:pk>/dados/socioeducativo/", views.CreasSocioeducativoDataView.as_view(), name="data-socioeducativo"),
    path("quick-edit/protetivo/", views.CreasProtetivoQuickEditView.as_view(), name="quick-edit-protetivo"),
    path("quick-edit/socioeducativo/", views.CreasSocioeducativoQuickEditView.as_view(), name="quick-edit-socioeducativo"),
]
