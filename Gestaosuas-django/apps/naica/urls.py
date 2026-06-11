from django.urls import path
from .views import (
    NaicaHomeView, NaicaCreateUpdateView, NaicaDataView,
    NaicaMonthlyNarrativeView, NaicaNarrativeListView,
    NaicaQuickEditView
)

app_name = "naica"

urlpatterns = [
    path("<uuid:pk>/", NaicaHomeView.as_view(), name="home"),
    path("<uuid:pk>/preencher/", NaicaCreateUpdateView.as_view(), name="form"),
    path("<uuid:pk>/dados/", NaicaDataView.as_view(), name="data"),
    path("<uuid:pk>/relatorio-mensal/", NaicaMonthlyNarrativeView.as_view(), name="monthly-report"),
    path("<uuid:pk>/relatorios/", NaicaNarrativeListView.as_view(), name="reports"),
    path("quick-edit/", NaicaQuickEditView.as_view(), name="quick-edit"),
]
