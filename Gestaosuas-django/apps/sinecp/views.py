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
    safe_total, build_series, current_or_total, sum_fields_by_month,
    selected_or_total_fields, build_highlight_badge
)
from .models import SineReport, QualificacaoReport
from .forms import SineReportForm, QualificacaoReportForm

SINE_CARD_FIELDS = [
    ("Inseridos no Mercado", "inseridos_mercado", "briefcase-business", "#3b82f6"),
    ("Entrevistas", "entrevistados", "messages-square", "#06b6d4"),
    ("Vagas Captadas", "vagas_captadas", "clipboard-list", "#0ea5e9"),
    ("Seguro Desemprego", "seguro_desemprego", "shield-check", "#f59e0b"),
    ("Curriculos", "curriculos", "file-text", "#10b981"),
]

SINE_SERVICE_FIELDS = [
    ("Orientacao Profissional", "orientacao_profissional"),
    ("Carteira Digital", "carteira_digital"),
    ("Processo Seletivo", "processo_seletivo"),
    ("Curriculos", "curriculos"),
    ("Seguro Desemprego", "seguro_desemprego"),
]

CP_CARD_FIELDS = [
    ("Concluintes", "resumo_concluintes", "graduation-cap", "#3b82f6"),
    ("Atendimentos", "__atendimentos__", "phone-call", "#06b6d4"),
    ("Cursos Total", "resumo_cursos", "book-open", "#f59e0b"),
    ("Turmas Total", "resumo_turmas", "users", "#10b981"),
]

CP_ATENDIMENTOS_FIELDS = [
    "cp_morumbi_atendimentos",
    "cp_lagoinha_atendimentos",
    "cp_campo_alegre_atendimentos",
    "cp_luizote_1_atendimentos",
    "cp_luizote_2_atendimentos",
    "cp_tocantis_atendimentos",
    "cp_planalto_atendimentos",
    "maravilha_atendimentos",
    "unitech_atendimentos",
    "onibus_atendimentos",
]

CP_PROCEDIMENTOS_FIELDS = []


class SineCpBaseMixin(LoginRequiredMixin):
    monthly_report_sector = ""
    report_title = ""
    success_view_name = ""

    def get_directorate(self):
        directorate = Directorate.objects.filter(pk=self.kwargs["pk"]).first()
        if not directorate:
            raise Http404("Diretoria nao encontrada.")
        normalized = directorate.name.lower()
        if "sine" not in normalized and "qual" not in normalized and "profissional" not in normalized:
            raise Http404("A diretoria informada nao corresponde a Qualificacao Profissional e SINE.")
        return directorate

    def get_year(self):
        return int(self.request.GET.get("year") or date.today().year)

    def get_month(self):
        return self.request.GET.get("month") or "all"

    def get_month_number(self):
        month_value = self.request.GET.get("month")
        return int(month_value) if month_value and month_value != "all" else date.today().month


class SineCpHomeView(SineCpBaseMixin, DetailView):
    template_name = "sinecp/home.html"
    context_object_name = "directorate"

    def get_object(self, queryset=None):
        return self.get_directorate()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.object
        selected_year = self.get_year()
        selected_month = self.get_month()
        active_tab = self.request.GET.get("tab") or "sine"
        month_labels = [label for _month_num, label in MONTH_LABELS]
        years_qs = list(SineReport.objects.filter(directorate=directorate).values_list("year", flat=True)) + list(
            QualificacaoReport.objects.filter(directorate=directorate).values_list("year", flat=True)
        )

        sine_reports = SineReport.objects.filter(directorate=directorate, year=selected_year).order_by("month")
        cp_reports = QualificacaoReport.objects.filter(directorate=directorate, year=selected_year).order_by("month")
        sine_by_month = {report.month: report for report in sine_reports}
        cp_by_month = {report.month: report for report in cp_reports}

        sine_cards = []
        for label, field_name, icon, color in SINE_CARD_FIELDS:
            history = build_series(sine_by_month, field_name)
            sine_cards.append(
                {
                    "label": label,
                    "value": current_or_total(sine_by_month, field_name, selected_month),
                    "sparkline": build_sparkline(history),
                    "icon": icon,
                    "color": color,
                    "variation": build_variation(history, selected_month),
                }
            )

        sine_service_bars = [
            {
                "label": label,
                "value": current_or_total(sine_by_month, field_name, selected_month),
            }
            for label, field_name in SINE_SERVICE_FIELDS
        ]
        max_service = max([item["value"] for item in sine_service_bars] or [1]) or 1
        for item in sine_service_bars:
            item["width"] = max(10, round((item["value"] / max_service) * 100)) if item["value"] else 10

        sine_attendance_points = []
        sine_empregador_history = build_series(sine_by_month, "atend_empregador")
        sine_trabalhador_history = build_series(sine_by_month, "atend_trabalhador")
        for index, (_month_num, label) in enumerate(MONTH_LABELS):
            sine_attendance_points.append(
                {
                    "label": label,
                    "empregador": sine_empregador_history[index],
                    "trabalhador": sine_trabalhador_history[index],
                }
            )

        cp_atendimentos_history = sum_fields_by_month(cp_by_month, CP_ATENDIMENTOS_FIELDS)
        cp_procedimentos_history = sum_fields_by_month(cp_by_month, CP_PROCEDIMENTOS_FIELDS)
        cp_cards = []
        cp_value_map = {
            "resumo_concluintes": current_or_total(cp_by_month, "resumo_concluintes", selected_month),
            "__atendimentos__": selected_or_total_fields(cp_by_month, CP_ATENDIMENTOS_FIELDS, selected_month),
            "__procedimentos__": selected_or_total_fields(cp_by_month, CP_PROCEDIMENTOS_FIELDS, selected_month),
            "resumo_cursos": current_or_total(cp_by_month, "resumo_cursos", selected_month),
            "resumo_turmas": current_or_total(cp_by_month, "resumo_turmas", selected_month),
        }
        cp_history_map = {
            "resumo_concluintes": build_series(cp_by_month, "resumo_concluintes"),
            "__atendimentos__": cp_atendimentos_history,
            "__procedimentos__": cp_procedimentos_history,
            "resumo_cursos": build_series(cp_by_month, "resumo_cursos"),
            "resumo_turmas": build_series(cp_by_month, "resumo_turmas"),
        }
        for label, field_name, icon, color in CP_CARD_FIELDS:
            cp_cards.append(
                {
                    "label": label,
                    "value": cp_value_map[field_name],
                    "sparkline": build_sparkline(cp_history_map[field_name]),
                    "icon": icon,
                    "color": color,
                    "variation": build_variation(cp_history_map[field_name], selected_month),
                }
            )

        cp_concluintes_points = build_column_points(build_series(cp_by_month, "resumo_concluintes"))
        latest_cp_report = cp_by_month.get(int(selected_month)) if selected_month != "all" else cp_reports.last()
        cp_gender = [
            {"label": "Homem", "value": int(getattr(latest_cp_report, "resumo_homens", 0) or 0), "color": "#3b82f6"},
            {"label": "Mulher", "value": int(getattr(latest_cp_report, "resumo_mulheres", 0) or 0), "color": "#f43f5e"},
        ]
        cp_gender = [item for item in cp_gender if item["value"] > 0]
        lead_service = build_highlight_badge(sine_service_bars, "Sem servicos")
        lead_gender = build_highlight_badge(cp_gender, "Sem genero")

        sine_chart_data = {
            "labels": month_labels,
            "services_labels": [item["label"] for item in sine_service_bars],
            "services_values": [item["value"] for item in sine_service_bars],
            "empregador_values": sine_empregador_history,
            "trabalhador_values": sine_trabalhador_history,
        }
        cp_chart_data = {
            "labels": month_labels,
            "concluintes_values": build_series(cp_by_month, "resumo_concluintes"),
            "atendimentos_values": cp_atendimentos_history,
            "procedimentos_values": cp_procedimentos_history,
            "gender_labels": [item["label"] for item in cp_gender],
            "gender_values": [item["value"] for item in cp_gender],
            "gender_colors": [item["color"] for item in cp_gender],
        }

        context.update(
            {
                "selected_year": selected_year,
                "selected_month": selected_month,
                "months_range": MONTH_OPTIONS,
                "years_range": build_year_range_from_years(years_qs, selected_year),
                "active_tab": active_tab,
                "chart_period_label": build_period_label(selected_year, selected_month),
                "sine_cards": sine_cards,
                "cp_cards": cp_cards,
                "cp_gender": cp_gender,
                "active_cards": sine_cards if active_tab == "sine" else cp_cards,
                "lead_service": lead_service,
                "sine_total_attendance": sum(sine_empregador_history) + sum(sine_trabalhador_history),
                "cp_peak_concluintes": max(build_series(cp_by_month, "resumo_concluintes") or [0]),
                "cp_total_interactions": sum(cp_atendimentos_history) + sum(cp_procedimentos_history),
                "lead_gender": lead_gender,
                "sine_chart_data": sine_chart_data,
                "cp_chart_data": cp_chart_data,
            }
        )
        return context


class SineCreateUpdateView(SineCpBaseMixin, FormView):
    template_name = "sinecp/shared/form.html"
    form_class = SineReportForm
    model = SineReport
    report_title = "SINE"
    success_view_name = "sinecp:home"

    def get_initial(self):
        initial = super().get_initial()
        initial["month"] = self.get_month_number()
        initial["year"] = self.get_year()
        report = self.get_existing_report()
        if report:
            for model_field in self.form_class.Meta.model._meta.fields:
                if model_field.name in self.form_class.base_fields:
                    initial[model_field.name] = getattr(report, model_field.name)
        return initial

    def get_existing_report(self):
        return self.model.objects.filter(
            directorate=self.get_directorate(),
            month=self.get_month_number(),
            year=self.get_year(),
        ).first()

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        form = context["form"]
        context.update(
            {
                "directorate": self.get_directorate(),
                "selected_year": self.get_year(),
                "selected_month": self.get_month_number(),
                "module_title": self.report_title,
                "section_items": [
                    {"title": title, "fields": [form[field_name] for field_name in field_names]}
                    for title, field_names in self.form_class.section_map
                ],
                "existing_report": self.get_existing_report(),
                "back_url": reverse("sinecp:home", kwargs={"pk": self.kwargs["pk"]}),
                "data_url": reverse("sinecp:sine-data", kwargs={"pk": self.kwargs["pk"]}) + f"?year={self.get_year()}",
            }
        )
        return context

    def form_valid(self, form):
        directorate = self.get_directorate()
        month = form.cleaned_data["month"]
        year = form.cleaned_data["year"]
        report, _created = self.model.objects.get_or_create(
            month=month,
            year=year,
            defaults={"directorate": directorate},
        )
        report.directorate = directorate
        for field_name, value in form.cleaned_data.items():
            setattr(report, field_name, value)
        report.user_external_id = None
        report.save()
        messages.success(self.request, f"Dados de {self.report_title} salvos com sucesso.")
        return redirect(reverse(self.success_view_name, kwargs={"pk": directorate.pk}) + f"?tab=sine&year={year}")


class QualificacaoCreateUpdateView(SineCreateUpdateView):
    form_class = QualificacaoReportForm
    model = QualificacaoReport
    report_title = "Qualificacao Profissional"

    def form_valid(self, form):
        directorate = self.get_directorate()
        month = form.cleaned_data["month"]
        year = form.cleaned_data["year"]
        report, _created = self.model.objects.get_or_create(
            month=month,
            year=year,
            defaults={"directorate": directorate},
        )
        report.directorate = directorate
        vagas = int(form.cleaned_data.get("resumo_vagas") or 0)
        vagas_ocupadas = int(form.cleaned_data.get("resumo_vagas_ocupadas") or 0)
        taxa = round((vagas_ocupadas / vagas) * 100, 2) if vagas > 0 else 0
        for field_name, value in form.cleaned_data.items():
            setattr(report, field_name, value)
        report.resumo_taxa_ocupacao = taxa
        report.user_external_id = None
        report.save()
        messages.success(self.request, "Dados de Qualificacao Profissional salvos com sucesso.")
        return redirect(reverse(self.success_view_name, kwargs={"pk": directorate.pk}) + f"?tab=cp&year={year}")

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["module_title"] = self.report_title
        context["data_url"] = reverse("sinecp:qualificacao-data", kwargs={"pk": self.kwargs["pk"]}) + f"?year={self.get_year()}"
        return context


class SharedDataView(SineCpBaseMixin, TemplateView):
    template_name = "sinecp/shared/data.html"
    model = None
    form_class = None
    module_title = ""
    back_tab = "sine"
    form_view_name = ""
    monthly_report_view_name = ""

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.get_directorate()
        selected_year = self.get_year()
        reports = {
            report.month: report
            for report in self.model.objects.filter(directorate=directorate, year=selected_year)
        }
        table_groups = []
        for title, fields in self.form_class.section_map:
            table_groups.append(
                {
                    "title": title,
                    "rows": [
                        {
                            "label": self.form_class.labels.get(field_name, field_name),
                            "values": [getattr(reports.get(month_num), field_name, "") if reports.get(month_num) else "" for month_num, _label in MONTH_LABELS],
                        }
                        for field_name in fields
                    ],
                }
            )
        context.update(
            {
                "directorate": directorate,
                "selected_year": selected_year,
                "month_labels": [label for _month, label in MONTH_LABELS],
                "table_groups": table_groups,
                "module_title": self.module_title,
                "back_url": reverse("sinecp:home", kwargs={"pk": self.kwargs["pk"]}) + f"?tab={self.back_tab}&year={selected_year}",
                "form_url": reverse(self.form_view_name, kwargs={"pk": self.kwargs["pk"]}) + f"?year={selected_year}",
                "monthly_report_url": reverse(self.monthly_report_view_name, kwargs={"pk": self.kwargs["pk"]}) + f"?year={selected_year}",
            }
        )
        return context


class SineDataView(SharedDataView):
    model = SineReport
    form_class = SineReportForm
    module_title = "SINE"
    back_tab = "sine"
    form_view_name = "sinecp:sine-form"
    monthly_report_view_name = "sinecp:sine-monthly-report"


class QualificacaoDataView(SharedDataView):
    model = QualificacaoReport
    form_class = QualificacaoReportForm
    module_title = "Qualificacao Profissional"
    back_tab = "cp"
    form_view_name = "sinecp:qualificacao-form"
    monthly_report_view_name = "sinecp:qualificacao-monthly-report"


class SharedMonthlyNarrativeView(SineCpBaseMixin, TemplateView):
    template_name = "sinecp/shared/monthly_report.html"
    setor = ""
    module_title = ""
    back_tab = "sine"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.get_directorate()
        selected_year = self.get_year()
        month_number = self.get_month_number()
        report = MonthlyReport.objects.filter(
            directorate=directorate,
            setor=self.setor,
            year=selected_year,
            month=month_number,
        ).first()
        history = MonthlyReport.objects.filter(
            directorate=directorate,
            setor=self.setor,
        ).order_by("-year", "-month", "-created_at")[:8]
        context.update(
            {
                "directorate": directorate,
                "selected_year": selected_year,
                "selected_month": month_number,
                "module_title": self.module_title,
                "monthly_report": report,
                "history": history,
                "back_url": reverse("sinecp:home", kwargs={"pk": self.kwargs["pk"]}) + f"?tab={self.back_tab}&year={selected_year}",
            }
        )
        return context


class SineMonthlyNarrativeView(SharedMonthlyNarrativeView):
    setor = "sine"
    module_title = "SINE"
    back_tab = "sine"


class QualificacaoMonthlyNarrativeView(SharedMonthlyNarrativeView):
    setor = "centros"
    module_title = "Qualificacao Profissional"
    back_tab = "cp"


class SharedNarrativeListView(SineCpBaseMixin, TemplateView):
    template_name = "sinecp/shared/reports.html"
    setor = ""
    module_title = ""
    back_tab = "sine"
    monthly_view_name = ""

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.get_directorate()
        selected_year = self.get_year()
        reports = MonthlyReport.objects.filter(
            directorate=directorate,
            setor=self.setor,
        ).order_by("-year", "-month", "-created_at")
        if selected_year:
            reports = reports.filter(year=selected_year)
        context.update(
            {
                "directorate": directorate,
                "selected_year": selected_year,
                "module_title": self.module_title,
                "reports": reports,
                "back_url": reverse("sinecp:home", kwargs={"pk": self.kwargs["pk"]}) + f"?tab={self.back_tab}&year={selected_year}",
                "monthly_report_base_url": reverse(self.monthly_view_name, kwargs={"pk": self.kwargs["pk"]}),
            }
        )
        return context


class SineNarrativeListView(SharedNarrativeListView):
    setor = "sine"
    module_title = "SINE"
    back_tab = "sine"
    monthly_view_name = "sinecp:sine-monthly-report"


class QualificacaoNarrativeListView(SharedNarrativeListView):
    setor = "centros"
    module_title = "Qualificacao Profissional"
    back_tab = "cp"
    monthly_view_name = "sinecp:qualificacao-monthly-report"
