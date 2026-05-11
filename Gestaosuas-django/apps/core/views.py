from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import OperationalError, ProgrammingError
from django.views.generic import TemplateView

from apps.accounts.models import Profile
from apps.directorates.models import DailyReport, Directorate, MonthlySubmission, Osc, Visit, WorkPlan


def safe_count(model):
    try:
        return model.objects.count()
    except (OperationalError, ProgrammingError):
        return 0


def safe_queryset(queryset, limit=5):
    try:
        return list(queryset[:limit])
    except (OperationalError, ProgrammingError):
        return []


class DashboardView(LoginRequiredMixin, TemplateView):
    template_name = "core/dashboard.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        try:
            profile = Profile.objects.filter(user=user).select_related("primary_directorate").first()
        except (OperationalError, ProgrammingError):
            profile = None

        try:
            directorates = list(Directorate.objects.order_by("name")[:12])
        except (OperationalError, ProgrammingError):
            directorates = []

        context.update(
            {
                "profile": profile,
                "directorates": directorates,
                "cards": [
                    {"label": "Total em acompanhamento", "value": safe_count(DailyReport), "accent": "blue"},
                    {"label": "Planos de trabalho", "value": safe_count(WorkPlan), "accent": "violet"},
                    {"label": "OSCs cadastradas", "value": safe_count(Osc), "accent": "green"},
                    {"label": "Visitas técnicas", "value": safe_count(Visit), "accent": "pink"},
                ],
                "recent_submissions": safe_queryset(
                    MonthlySubmission.objects.select_related("directorate").order_by("-created_at")
                ),
                "recent_visits": safe_queryset(
                    Visit.objects.select_related("osc", "directorate").order_by("-visit_date", "-created_at")
                ),
            }
        )
        return context


class LandingView(TemplateView):
    template_name = "core/landing.html"
