from datetime import date
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import Http404
from django.shortcuts import redirect
from django.urls import reverse
from django.views.generic import DetailView, FormView, TemplateView

from apps.directorates.models import Directorate, MonthlyReport
from apps.core.utils import (
    MONTH_LABELS, MONTH_OPTIONS, build_sparkline, build_column_points,
    build_period_label, build_year_range_from_years, build_variation,
    build_donut_style, safe_total, build_series, current_or_total
)
from .models import BeneficiosReport
from .forms import BeneficiosReportForm

BENEFICIOS_CARD_FIELDS = [
    ("Inclusao CadUnico", "encaminhadas_inclusao_cadunico", "user-plus", "#3b82f6"),
    ("Atualizacao CadUnico", "encaminhadas_atualizacao_cadunico", "refresh-cw", "#06b6d4"),
    ("Pro-pao Total", "pro_pao", "package", "#f59e0b"),
    ("Cesta Basica", "cesta_basica", "shopping-basket", "#10b981"),
]

VISITS_BREAKDOWN = [
    ("visitas_cadunico", "Visitas D. CadUnico", "#3b82f6"),
    ("visita_nucleo_habitacao", "Visita Nucleo S. Habitacao", "#ef4444"),
    ("visita_cesta_fraldas_colchoes", "Visita D. Cesta Basica", "#10b981"),
    ("visita_dmae", "Visita DMAE", "#f59e0b"),
    ("visitas_pro_pao", "Visitas Pro-pao", "#8b5cf6"),
]


class BeneficiosBaseMixin(LoginRequiredMixin):
    def get_directorate(self):
        directorate = Directorate.objects.filter(pk=self.kwargs["pk"]).first()
        if not directorate:
            raise Http404("Diretoria nao encontrada.")
        normalized = directorate.name.lower()
        if "benef" not in normalized:
            raise Http404("A diretoria informada nao corresponde a Beneficios.")
        return directorate

    def get_year(self):
        return int(self.request.GET.get("year") or date.today().year)

    def get_month(self):
        return self.request.GET.get("month") or "all"


class BeneficiosHomeView(BeneficiosBaseMixin, DetailView):
    template_name = "beneficios/home.html"
    context_object_name = "directorate"

    def get_object(self, queryset=None):
        return self.get_directorate()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.object
        selected_year = self.get_year()
        selected_month = self.get_month()
        reports = BeneficiosReport.objects.filter(directorate=directorate, year=selected_year).order_by("month")
        reports_by_month = {report.month: report for report in reports}
        available_years = BeneficiosReport.objects.filter(directorate=directorate).values_list("year", flat=True)

        cards = []
        for index, field_info in enumerate(BENEFICIOS_CARD_FIELDS):
            label, field_name, icon, color = field_info
            history = build_series(reports_by_month, field_name)
            cards.append(
                {
                    "label": label,
                    "value": current_or_total(reports_by_month, field_name, selected_month),
                    "history": history,
                    "sparkline": build_sparkline(history),
                    "icon": icon,
                    "color": color,
                    "variation": build_variation(history, selected_month),
                }
            )

        latest = reports.last()
        familias_history = build_series(reports_by_month, "familias_pbf")
        pessoas_history = build_series(reports_by_month, "pessoas_cadunico")
        visits_breakdown = [
            {
                "label": label,
                "value": safe_total(latest, field_name),
                "color": color,
            }
            for field_name, label, color in VISITS_BREAKDOWN
            if safe_total(latest, field_name) > 0
        ]
        monthly_reports = MonthlyReport.objects.filter(
            directorate=directorate,
            setor="beneficios",
        ).order_by("-year", "-month", "-created_at")[:6]

        context.update(
            {
                "selected_year": selected_year,
                "selected_month": selected_month,
                "months_range": MONTH_OPTIONS,
                "years_range": build_year_range_from_years(available_years, selected_year),
                "cards": cards,
                "reports": reports,
                "latest_report": latest,
                "line_chart_familias": build_column_points(familias_history),
                "line_chart_pessoas": build_column_points(pessoas_history),
                "visits_breakdown": visits_breakdown,
                "visits_donut_style": build_donut_style(visits_breakdown),
                "monthly_narratives": monthly_reports,
            }
        )
        return context


class BeneficiosCreateUpdateView(BeneficiosBaseMixin, FormView):
    template_name = "beneficios/form.html"
    form_class = BeneficiosReportForm

    def get_initial(self):
        initial = super().get_initial()
        initial["month"] = int(self.request.GET.get("month") or date.today().month)
        initial["year"] = self.get_year()
        report = self.get_existing_report()
        if report:
            for field_name in self.form_class.Meta.model._meta.fields:
                if field_name.name in self.form_class.base_fields:
                    initial[field_name.name] = getattr(report, field_name.name)
        return initial

    def get_existing_report(self):
        directorate = self.get_directorate()
        month = int(self.request.GET.get("month") or date.today().month)
        year = self.get_year()
        return BeneficiosReport.objects.filter(directorate=directorate, month=month, year=year).first()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        form = context["form"]
        section_items = []
        for section_title, field_names in self.form_class.section_map:
            section_items.append(
                {
                    "title": section_title,
                    "fields": [form[field_name] for field_name in field_names],
                }
            )
        context["directorate"] = self.get_directorate()
        context["selected_year"] = self.get_year()
        context["selected_month"] = int(self.request.GET.get("month") or date.today().month)
        context["section_items"] = section_items
        context["existing_report"] = self.get_existing_report()
        return context

    def form_valid(self, form):
        directorate = self.get_directorate()
        month = form.cleaned_data["month"]
        year = form.cleaned_data["year"]
        report, _created = BeneficiosReport.objects.get_or_create(
            directorate=directorate,
            month=month,
            year=year,
        )
        for field_name, value in form.cleaned_data.items():
            setattr(report, field_name, value)
        report.user_external_id = None
        report.save()
        messages.success(self.request, "Dados de Beneficios salvos com sucesso.")
        return redirect(reverse("beneficios:home", kwargs={"pk": directorate.pk}))


class BeneficiosDataView(BeneficiosBaseMixin, TemplateView):
    template_name = "beneficios/data.html"

    month_labels = MONTH_LABELS

    row_groups = BeneficiosReportForm.section_map

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.get_directorate()
        selected_year = self.get_year()
        reports = {
            report.month: report
            for report in BeneficiosReport.objects.filter(directorate=directorate, year=selected_year)
        }
        table_groups = []
        for title, fields in self.row_groups:
            table_groups.append(
                {
                    "title": title,
                    "rows": [
                        {
                            "field": field_name,
                            "label": BeneficiosReportForm.labels.get(field_name, field_name),
                            "values": [getattr(reports.get(month_num), field_name, "") if reports.get(month_num) else "" for month_num, _label in self.month_labels],
                        }
                        for field_name in fields
                    ],
                }
            )

        context.update(
            {
                "directorate": directorate,
                "selected_year": selected_year,
                "month_labels": [label for _month, label in self.month_labels],
                "table_groups": table_groups,
            }
        )
        return context


class BeneficiosMonthlyNarrativeView(BeneficiosBaseMixin, TemplateView):
    template_name = "beneficios/monthly_report.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.get_directorate()
        selected_year = self.get_year()
        month = int(self.request.GET.get("month") or date.today().month)
        report = MonthlyReport.objects.filter(
            directorate=directorate,
            setor="beneficios",
            year=selected_year,
            month=month,
        ).first()
        history = MonthlyReport.objects.filter(
            directorate=directorate,
            setor="beneficios",
        ).order_by("-year", "-month", "-created_at")[:8]
        context.update(
            {
                "directorate": directorate,
                "selected_year": selected_year,
                "selected_month": month,
                "monthly_report": report,
                "history": history,
            }
        )
        return context


class BeneficiosNarrativeListView(BeneficiosBaseMixin, TemplateView):
    template_name = "beneficios/reports.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.get_directorate()
        selected_year = self.get_year()
        reports = MonthlyReport.objects.filter(
            directorate=directorate,
            setor="beneficios",
        ).order_by("-year", "-month", "-created_at")
        if selected_year:
            reports = reports.filter(year=selected_year)
        context.update(
            {
                "directorate": directorate,
                "selected_year": selected_year,
                "reports": reports,
            }
        )
        return context
