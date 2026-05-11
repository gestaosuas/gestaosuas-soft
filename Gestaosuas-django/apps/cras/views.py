from datetime import date, datetime
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
    strip_accents
)
from .models import CrasReport
from .forms import CrasReportForm

CRAS_UNITS = [
    "ALVORADA", "CANA", "CAMPO ALEGRE", "EDSON TEIXEIRA", "JARDIM BRASILIA",
    "JARDIM CARELI", "JARDIM CELIA", "LAGOINHA", "MANA", "MARTA HELENA", "MORUMBI",
    "ROQUE REZENDE", "SO JORGE", "SHOPPING PARK", "TAPUIRAMA"
]

CRAS_CARD_FIELDS = [
    ("Familias PAIF", "atual", "users", "#3b82f6"),
    ("Atendimentos", "atendimentos", "phone-call", "#06b6d4"),
    ("Atualizacao Cad.", "recadastros", "refresh-cw", "#f59e0b"),
    ("Admitidas", "admitidas", "trending-up", "#10b981"),
    ("Desligadas", "desligadas", "trending-down", "#ef4444"),
    ("Taxa Retencao", "__retencao__", "percent", "#8b5cf6"),
]


class CrasBaseMixin(LoginRequiredMixin):
    monthly_report_sector = "cras"

    def get_directorate(self):
        directorate = Directorate.objects.filter(pk=self.kwargs["pk"]).first()
        if not directorate:
            raise Http404("Diretoria nao encontrada.")
        normalized = directorate.name.lower()
        if "cras" not in normalized:
            raise Http404("A diretoria informada nao corresponde a CRAS.")
        return directorate

    def get_year(self):
        return int(self.request.GET.get("year") or date.today().year)

    def get_month(self):
        return self.request.GET.get("month") or "all"

    def get_month_number(self):
        month_value = self.request.GET.get("month")
        return int(month_value) if month_value and month_value != "all" else date.today().month

    def get_unit_name(self):
        return self.request.GET.get("unit") or "all"


class CrasHomeView(CrasBaseMixin, DetailView):
    template_name = "cras/home.html"
    context_object_name = "directorate"

    def get_object(self, queryset=None):
        return self.get_directorate()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.object
        selected_year = self.get_year()
        selected_month = self.get_month()
        selected_unit = self.get_unit_name()

        reports = CrasReport.objects.filter(
            directorate=directorate, year=selected_year
        ).order_by("month", "unit_name")

        reports_by_month_unit = {}
        for report in list(reports):
            # Normalizar para lookup: UPPER + SEM ACENTOS
            unit_key = strip_accents(report.unit_name or "").strip().upper()
            reports_by_month_unit[(report.month, unit_key)] = report

        available_years = CrasReport.objects.filter(
            directorate=directorate
        ).values_list("year", flat=True)

        month_labels = [label for _month_num, label in MONTH_LABELS]

        def get_unit_history(field_name):
            history = [0] * 12
            if selected_unit == "all":
                for month_num in range(1, 13):
                    total = 0
                    for unit in CRAS_UNITS:
                        # CRAS_UNITS ja estao em UPPER no codigo, mas podem ter acentos
                        unit_key = strip_accents(unit).upper()
                        report = reports_by_month_unit.get((month_num, unit_key))
                        if report:
                            total += int(getattr(report, field_name, 0) or 0)
                    history[month_num - 1] = total
            else:
                unit_key = strip_accents(selected_unit).upper()
                for month_num in range(1, 13):
                    report = reports_by_month_unit.get((month_num, unit_key))
                    history[month_num - 1] = int(getattr(report, field_name, 0) or 0) if report else 0
            return history

        def get_unit_value(field_name):
            if selected_month == "all":
                return sum(get_unit_history(field_name))
            try:
                month_val = int(selected_month)
            except (ValueError, TypeError):
                month_val = date.today().month

            if selected_unit != "all":
                unit_key = strip_accents(selected_unit).upper()
                report = reports_by_month_unit.get((month_val, unit_key))
                return int(getattr(report, field_name, 0) or 0) if report else 0
            total = 0
            for unit in CRAS_UNITS:
                unit_key = strip_accents(unit).upper()
                r = reports_by_month_unit.get((month_val, unit_key))
                if r:
                    total += int(getattr(r, field_name, 0) or 0)
            return total

        atual_hist = get_unit_history("atual")

        cards = []
        for label, field_name, icon, color in CRAS_CARD_FIELDS:
            if field_name == "__retencao__":
                atual_val = get_unit_value("atual")
                deslig_val = get_unit_value("desligadas")
                value = round(((atual_val - deslig_val) / atual_val) * 100, 1) if atual_val > 0 else 0
                suffix = "%"
                history = atual_hist
            else:
                value = get_unit_value(field_name)
                suffix = ""
                history = get_unit_history(field_name)
            cards.append({
                "label": label,
                "value": value,
                "suffix": suffix,
                "sparkline": build_sparkline(history),
                "icon": icon,
                "color": color,
                "variation": build_variation(history, selected_month),
            })

        monthly_reports = MonthlyReport.objects.filter(
            directorate=directorate, setor="cras",
        ).order_by("-year", "-month", "-created_at")[:6]

        cadastros_hist = get_unit_history("cadastros_novos")
        recadastros_hist = get_unit_history("recadastros")
        admitidas_hist = get_unit_history("admitidas")
        desligadas_hist = get_unit_history("desligadas")
        atendimentos_hist = get_unit_history("atendimentos")

        context.update({
            "selected_year": selected_year,
            "selected_month": selected_month,
            "selected_unit": selected_unit,
            "months_range": MONTH_OPTIONS,
            "years_range": build_year_range_from_years(available_years, selected_year),
            "cras_units": CRAS_UNITS,
            "cards": cards,
            "reports": list(reports),
            "line_chart_cadastros": build_column_points(cadastros_hist),
            "line_chart_recadastros": build_column_points(recadastros_hist),
            "line_chart_admitidas": build_column_points(admitidas_hist),
            "line_chart_desligadas": build_column_points(desligadas_hist),
            "line_chart_atendimentos": build_column_points(atendimentos_hist),
            "line_chart_atual": build_column_points(atual_hist),
            "month_labels": month_labels,
            "period_label": build_period_label(selected_year, selected_month),
            "monthly_narratives": monthly_reports,
        })
        return context


class CrasCreateUpdateView(CrasBaseMixin, FormView):
    template_name = "cras/form.html"
    form_class = CrasReportForm

    def get_initial(self):
        initial = super().get_initial()
        initial["month"] = self.get_month_number()
        initial["year"] = self.get_year()
        unit = self.request.GET.get("unit") or ""
        if unit:
            initial["unit_name"] = unit
        report = self._get_existing_report()
        if report:
            for model_field in self.form_class.Meta.model._meta.fields:
                if model_field.name in self.form_class.base_fields and model_field.name != "unit_name":
                    initial[model_field.name] = getattr(report, model_field.name)
            initial["unit_name"] = report.unit_name
        return initial

    def _get_existing_report(self):
        directorate = self.get_directorate()
        unit_val = self.request.GET.get("unit") or ""
        if unit_val:
            return CrasReport.objects.filter(
                directorate=directorate, month=self.get_month_number(), year=self.get_year(), unit_name=unit_val
            ).first()
        return None

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        form = context["form"]
        directorate = self.get_directorate()
        section_items = []
        for title, fields_name in self.form_class.section_map:
            section_items.append({
                "title": title,
                "fields": [form[f] for f in fields_name],
            })
        context.update({
            "directorate": directorate,
            "selected_year": self.get_year(),
            "selected_month": self.get_month_number(),
            "section_items": section_items,
            "existing_report": self._get_existing_report(),
            "cras_units": CRAS_UNITS,
            "selected_unit": self.request.GET.get("unit") or "",
        })
        return context

    def form_valid(self, form):
        directorate = self.get_directorate()
        month_val = form.cleaned_data["month"]
        year_val = form.cleaned_data["year"]
        unit_name = self.request.POST.get("unit_name", "") or self.request.GET.get("unit", "")

        if not unit_name:
            messages.error(self.request, "Selecione uma unidade CRAS.")
            return redirect(reverse("cras:form", kwargs={"pk": directorate.pk}) + f"?year={year_val}&month={month_val}")

        try:
            report = CrasReport.objects.get(
                directorate=directorate, month=month_val, year=year_val, unit_name=unit_name,
            )
        except CrasReport.DoesNotExist:
            report = CrasReport(
                directorate=directorate, month=month_val, year=year_val, unit_name=unit_name,
                created_at=datetime.now(),
            )
        for field_name, value in form.cleaned_data.items():
            setattr(report, field_name, value)
        report.updated_at = datetime.now()
        report.save()
        messages.success(self.request, f"Dados do CRAS {unit_name} salvos com sucesso.")
        return redirect(reverse("cras:home", kwargs={"pk": directorate.pk}) + f"?year={year_val}&month={month_val}&unit={unit_name}")


class CrasDataView(CrasBaseMixin, TemplateView):
    template_name = "cras/data.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.get_directorate()
        selected_year = self.get_year()

        reports = CrasReport.objects.filter(directorate=directorate, year=selected_year).order_by("unit_name", "month")
        reports_by_unit_month = {}
        for report in reports:
            reports_by_unit_month[(report.unit_name, report.month)] = report

        units_tables = []
        for unit in CRAS_UNITS:
            groups = []
            for title, fields in CrasReportForm.section_map:
                rows = []
                for field_name in fields:
                    month_values = []
                    for month_num in range(1, 13):
                        report = reports_by_unit_month.get((unit, month_num))
                        month_values.append(getattr(report, field_name, "") if report else "")
                    rows.append({
                        "label": CrasReportForm.labels.get(field_name, field_name),
                        "values": month_values,
                    })
                groups.append({"title": title, "rows": rows})
            units_tables.append({"unit": unit, "groups": groups})

        context.update({
            "directorate": directorate,
            "selected_year": selected_year,
            "month_labels": [label for _month, label in MONTH_LABELS],
            "units_tables": units_tables,
        })
        return context


class CrasMonthlyNarrativeView(CrasBaseMixin, TemplateView):
    template_name = "cras/monthly_report.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.get_directorate()
        selected_year = self.get_year()
        month_val = self.get_month_number()
        report = MonthlyReport.objects.filter(
            directorate=directorate, setor="cras", year=selected_year, month=month_val,
        ).first()
        history = MonthlyReport.objects.filter(directorate=directorate, setor="cras").order_by("-year", "-month", "-created_at")[:8]
        context.update({
            "directorate": directorate,
            "selected_year": selected_year,
            "selected_month": month_val,
            "monthly_report": report,
            "history": history,
        })
        return context


class CrasNarrativeListView(CrasBaseMixin, TemplateView):
    template_name = "cras/reports.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.get_directorate()
        selected_year = self.get_year()
        reports = MonthlyReport.objects.filter(directorate=directorate, setor="cras").order_by("-year", "-month", "-created_at")
        if selected_year:
            reports = reports.filter(year=selected_year)
        context.update({
            "directorate": directorate,
            "selected_year": selected_year,
            "reports": reports,
        })
        return context
