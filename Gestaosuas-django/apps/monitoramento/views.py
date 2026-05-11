import uuid
import math
from datetime import date, datetime

from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import Http404
from django.shortcuts import redirect
from django.urls import reverse
from django.views.generic import DetailView, FormView, TemplateView

from apps.directorates.models import Directorate, MonthlyReport, Osc, Visit, WorkPlan
from apps.core.utils import (
    MONTH_LABELS, MONTH_OPTIONS, build_sparkline,
    build_period_label, build_year_range_from_years, build_variation
)
from .models import GenericMonitoringReport
from .forms import GenericMonitoringForm
import json

BIMESTER_LABELS = ["Jan/Fev", "Mar/Abr", "Mai/Jun", "Jul/Ago", "Set/Out", "Nov/Dez"]
BIMESTER_OPTIONS = [(i + 1, f"{i+1}o Bimestre ({BIMESTER_LABELS[i]})") for i in range(6)]

def current_bimester():
    return math.ceil(datetime.now().month / 2)

def bimester_months(bimester):
    return (bimester - 1) * 2 + 1, bimester * 2


class MonitoramentoBaseMixin(LoginRequiredMixin):
    def get_directorate(self):
        directorate = Directorate.objects.filter(pk=self.kwargs["pk"]).first()
        if not directorate:
            raise Http404("Diretoria nao encontrada.")
        return directorate

    def get_year(self):
        return int(self.request.GET.get("year") or date.today().year)

    def get_month(self):
        return self.request.GET.get("month") or "all"

    def get_reference(self):
        ref = self.request.GET.get("ref")
        if not ref:
            directorate = self.get_directorate()
            ref = directorate.name.lower().replace(" ", "_")
        return ref


class MonitoramentoHomeView(MonitoramentoBaseMixin, DetailView):
    template_name = "monitoramento/home.html"
    context_object_name = "directorate"

    def get_object(self, queryset=None):
        return self.get_directorate()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.object
        selected_year = self.get_year()
        selected_month = self.get_month()
        bimester = self.request.GET.get("bimestre", str(current_bimester()))
        reference = self.get_reference()

        context["selected_year"] = int(selected_year)
        context["selected_month"] = selected_month
        context["selected_bimester"] = bimester
        context["months_range"] = MONTH_OPTIONS
        context["years_range"] = build_year_range_from_years([], selected_year)
        context["bimester_options"] = BIMESTER_OPTIONS
        context["bimester_label"] = ""

        # Bimester calculation
        curr_year = int(selected_year)
        if bimester != "all":
            curr_bimester = int(bimester)
            b_start, b_end = bimester_months(curr_bimester)
            context["bimester_label"] = f"{curr_bimester}o Bimestre ({BIMESTER_LABELS[curr_bimester-1]})"

            visits_qs = directorate.visits.filter(
                visit_date__year=curr_year,
                visit_date__month__gte=b_start,
                visit_date__month__lte=b_end,
            )
        else:
            visits_qs = directorate.visits.filter(visit_date__year=curr_year)

        all_visits = list(visits_qs)

        subvencao_stats = {
            "totalOSCs": directorate.oscs.count(),
            "totalVisits": len(all_visits),
            "finalizedVisits": len([v for v in all_visits if v.status in ["completed", "finalized"]]),
        }

        # Detect type
        normalized = directorate.name.lower()
        is_subvencao = "subvencao" in normalized or "emendas" in normalized or "fundos" in normalized
        is_outros = "outros" in normalized

        context.update({
            "subvencao_stats": subvencao_stats,
            "is_subvencao_mode": is_subvencao and not is_outros,
            "is_outros_mode": is_outros,
            "recent_visits": all_visits[:5],
            "recent_oscs": directorate.oscs.all()[:5],
        })

        # Also try to get form_definition cards for generic directorates
        form_def_raw = directorate.form_definition or []
        form_def = json.loads(form_def_raw) if isinstance(form_def_raw, str) else form_def_raw

        reports = GenericMonitoringReport.objects.filter(
            directorate=directorate, year=selected_year, reference=reference
        ).order_by("month")
        reports_by_month = {r.month: r for r in reports}

        cards = []
        sections = form_def if isinstance(form_def, list) else (form_def.get("sections", []) if isinstance(form_def, dict) else [])
        for section in sections:
            for field in section.get("fields", []):
                if field.get("type") == "number":
                    name = field.get("name")
                    label = field.get("label", name)
                    history = []
                    for m in range(1, 13):
                        r = reports_by_month.get(m)
                        history.append(int(r.payload.get(name, 0) or 0) if r else 0)
                    value = sum(history) if selected_month == "all" else (history[int(selected_month) - 1] if int(selected_month) <= len(history) else 0)
                    cards.append({
                        "label": label,
                        "value": value,
                        "sparkline": build_sparkline(history),
                        "icon": field.get("icon", "activity"),
                        "color": field.get("color", "#3b82f6"),
                        "variation": build_variation(history, selected_month),
                    })

        context["cards"] = cards
        context["period_label"] = build_period_label(selected_year, selected_month)
        return context


class MonitoramentoFormView(MonitoramentoBaseMixin, FormView):
    template_name = "monitoramento/shared/form.html"
    form_class = GenericMonitoringForm

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        raw_def = self.get_directorate().form_definition
        kwargs["form_definition"] = json.loads(raw_def) if isinstance(raw_def, str) else raw_def
        return kwargs

    def get_initial(self):
        initial = super().get_initial()
        directorate = self.get_directorate()
        reference = self.get_reference()
        month = int(self.request.GET.get("month") or date.today().month)
        year = self.get_year()

        initial["month"] = month
        initial["year"] = year

        report = GenericMonitoringReport.objects.filter(
            directorate=directorate, reference=reference, month=month, year=year
        ).first()

        if report:
            initial.update(report.payload)
        return initial

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.get_directorate()
        form = context["form"]
        section_items = []
        raw_def = directorate.form_definition or []
        form_def = json.loads(raw_def) if isinstance(raw_def, str) else raw_def
        for section in form_def:
            title = section.get("title", "Dados")
            fields = [form[f.get("name")] for f in section.get("fields", []) if f.get("name") in form.fields]
            if fields:
                section_items.append({"title": title, "fields": fields})
        context.update({
            "directorate": directorate,
            "module_title": directorate.name,
            "section_items": section_items,
            "back_url": reverse("monitoramento:home", kwargs={"pk": directorate.pk}),
        })
        return context

    def form_valid(self, form):
        directorate = self.get_directorate()
        reference = self.get_reference()
        month = int(form.cleaned_data.pop("month"))
        year = int(form.cleaned_data.pop("year"))
        report, _ = GenericMonitoringReport.objects.get_or_create(
            directorate=directorate, reference=reference, month=month, year=year
        )
        report.payload = form.cleaned_data
        report.save()
        messages.success(self.request, "Dados salvos com sucesso.")
        return redirect(reverse("monitoramento:home", kwargs={"pk": directorate.pk}) + f"?year={year}")