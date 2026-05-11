from django.urls import path

from .views import (
    DirectorateDetailView, 
    DirectorateListView,
    OscListView,
    VisitListView,
    WorkPlanListView,
    MonitoringReportListView,
    OscCreateView,
    OscUpdateView,
    OscDeleteView,
    VisitCreateView,
    VisitInstrumentalView,
    VisitRevertView,
    VisitDeleteView,
    VisitDelegateView,
    WorkPlanCreateView,
    WorkPlanUpdateView,
    WorkPlanDeleteView,
    WorkPlanPreviewView,
    WorkPlanDocumentView,
    VisitReportView,
    VisitUploadDocumentView
)


app_name = "directorates"

urlpatterns = [
    path("", DirectorateListView.as_view(), name="list"),
    path("<uuid:pk>/", DirectorateDetailView.as_view(), name="detail"),
    path("<uuid:pk>/oscs/", OscListView.as_view(), name="osc-list"),
    path("<uuid:pk>/oscs/novo/", OscCreateView.as_view(), name="osc-create"),
    path("oscs/<uuid:pk>/editar/", OscUpdateView.as_view(), name="osc-update"),
    path("oscs/<uuid:pk>/excluir/", OscDeleteView.as_view(), name="osc-delete"),
    path("<uuid:pk>/visitas/", VisitListView.as_view(), name="visit-list"),
    path("<uuid:pk>/visitas/novo/", VisitCreateView.as_view(), name="visit-create"),
    path("visitas/<uuid:pk>/instrumental/", VisitInstrumentalView.as_view(), name="visit-instrumental"),
    path("visitas/<uuid:pk>/reverter/", VisitRevertView.as_view(), name="visit-revert"),
    path("visitas/<uuid:pk>/excluir/", VisitDeleteView.as_view(), name="visit-delete"),
    path("visitas/<uuid:pk>/delegar/", VisitDelegateView.as_view(), name="visit-delegate"),
    path("<uuid:pk>/planos/", WorkPlanListView.as_view(), name="plan-list"),
    path("<uuid:pk>/planos/preview/", WorkPlanPreviewView.as_view(), name="plan-preview"),
    path("<uuid:pk>/planos/documento/", WorkPlanDocumentView.as_view(), name="plan-document"),
    path("<uuid:pk>/planos/novo/", WorkPlanCreateView.as_view(), name="plan-create"),
    path("planos/<uuid:pk>/editar/", WorkPlanUpdateView.as_view(), name="plan-update"),
    path("planos/<uuid:pk>/excluir/", WorkPlanDeleteView.as_view(), name="plan-delete"),
    path("<uuid:pk>/relatorios/", MonitoringReportListView.as_view(), name="report-list"),
    path("visitas/<uuid:pk>/relatorio/<str:report_type>/", VisitReportView.as_view(), name="visit-report"),
    path("visitas/<uuid:pk>/upload-document/", VisitUploadDocumentView.as_view(), name="visit-upload-document"),
]
