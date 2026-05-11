from django.urls import path
from .views import (
    SineCpHomeView, SineCreateUpdateView, QualificacaoCreateUpdateView,
    SineDataView, QualificacaoDataView, SineMonthlyNarrativeView,
    QualificacaoMonthlyNarrativeView, SineNarrativeListView,
    QualificacaoNarrativeListView
)

app_name = "sinecp"

urlpatterns = [
    path("<uuid:pk>/", SineCpHomeView.as_view(), name="home"),
    
    # SINE
    path("<uuid:pk>/sine/preencher/", SineCreateUpdateView.as_view(), name="sine-form"),
    path("<uuid:pk>/sine/dados/", SineDataView.as_view(), name="sine-data"),
    path("<uuid:pk>/sine/relatorio-mensal/", SineMonthlyNarrativeView.as_view(), name="sine-monthly-report"),
    path("<uuid:pk>/sine/relatorios/", SineNarrativeListView.as_view(), name="sine-reports"),
    
    # Qualificação
    path("<uuid:pk>/qualificacao/preencher/", QualificacaoCreateUpdateView.as_view(), name="qualificacao-form"),
    path("<uuid:pk>/qualificacao/dados/", QualificacaoDataView.as_view(), name="qualificacao-data"),
    path("<uuid:pk>/qualificacao/relatorio-mensal/", QualificacaoMonthlyNarrativeView.as_view(), name="qualificacao-monthly-report"),
    path("<uuid:pk>/qualificacao/relatorios/", QualificacaoNarrativeListView.as_view(), name="qualificacao-reports"),
]
