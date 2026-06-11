from django.urls import path
from .views import (
    CreasHomeView, CreasIdosoFormView, CreasPcdFormView,
    CreasIdosoDataView, CreasPcdDataView,
    CreasMonthlyNarrativeView, CreasNarrativeListView,
    CreasIdosoQuickEditView, CreasPcdQuickEditView
)

app_name = "creasidoso"

urlpatterns = [
    path("<uuid:pk>/", CreasHomeView.as_view(), name="home"),
    path("<uuid:pk>/preencher-idoso/", CreasIdosoFormView.as_view(), name="form-idoso"),
    path("<uuid:pk>/preencher-pcd/", CreasPcdFormView.as_view(), name="form-pcd"),
    path("<uuid:pk>/dados-idoso/", CreasIdosoDataView.as_view(), name="data-idoso"),
    path("<uuid:pk>/dados-pcd/", CreasPcdDataView.as_view(), name="data-pcd"),
    path("<uuid:pk>/relatorio-mensal/", CreasMonthlyNarrativeView.as_view(), name="monthly-report"),
    path("<uuid:pk>/relatorios/", CreasNarrativeListView.as_view(), name="reports"),
    path("quick-edit-idoso/", CreasIdosoQuickEditView.as_view(), name="quick-edit-idoso"),
    path("quick-edit-pcd/", CreasPcdQuickEditView.as_view(), name="quick-edit-pcd"),
]
