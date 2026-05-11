from django.urls import path
from .views import (
    BeneficiosHomeView, BeneficiosCreateUpdateView, BeneficiosDataView,
    BeneficiosMonthlyNarrativeView, BeneficiosNarrativeListView
)

app_name = "beneficios"

urlpatterns = [
    path("<uuid:pk>/", BeneficiosHomeView.as_view(), name="home"),
    path("<uuid:pk>/atualizar/", BeneficiosCreateUpdateView.as_view(), name="update"),
    path("<uuid:pk>/dados/", BeneficiosDataView.as_view(), name="data"),
    path("<uuid:pk>/narrativa/", BeneficiosMonthlyNarrativeView.as_view(), name="narrative"),
    path("<uuid:pk>/relatorios/", BeneficiosNarrativeListView.as_view(), name="reports"),
]
