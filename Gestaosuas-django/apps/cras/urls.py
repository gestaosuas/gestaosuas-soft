from django.urls import path
from .views import (
    CrasHomeView, CrasCreateUpdateView, CrasDataView,
    CrasMonthlyNarrativeView, CrasNarrativeListView
)

app_name = "cras"

urlpatterns = [
    path("<uuid:pk>/", CrasHomeView.as_view(), name="home"),
    path("<uuid:pk>/preencher/", CrasCreateUpdateView.as_view(), name="form"),
    path("<uuid:pk>/dados/", CrasDataView.as_view(), name="data"),
    path("<uuid:pk>/relatorio-mensal/", CrasMonthlyNarrativeView.as_view(), name="monthly-report"),
    path("<uuid:pk>/relatorios/", CrasNarrativeListView.as_view(), name="reports"),
]
