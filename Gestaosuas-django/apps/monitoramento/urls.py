from django.urls import path
from .views import MonitoramentoHomeView, MonitoramentoFormView

app_name = "monitoramento"

urlpatterns = [
    path("<uuid:pk>/", MonitoramentoHomeView.as_view(), name="home"),
    path("<uuid:pk>/preencher/", MonitoramentoFormView.as_view(), name="form"),
]
