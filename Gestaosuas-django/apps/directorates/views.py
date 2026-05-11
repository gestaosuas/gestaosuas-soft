from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import OperationalError, ProgrammingError
from django.db.models import Count, Q, Sum
from django.shortcuts import render, get_object_or_404, redirect
from django.views import View
from django.views.generic import DetailView, ListView, CreateView, UpdateView, DeleteView, TemplateView
from django.urls import reverse
from django.http import JsonResponse
from django.template.loader import render_to_string
import json
import uuid
import math
import unicodedata
from datetime import datetime


def strip_accents(text):
    """Remove acentos de uma string para comparação insensível a acentuação."""
    return ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )

BIMESTER_LABELS = ["Jan/Fev", "Mar/Abr", "Mai/Jun", "Jul/Ago", "Set/Out", "Nov/Dez"]
BIMESTER_OPTIONS = [(i + 1, f"{i+1}o Bimestre ({BIMESTER_LABELS[i]})") for i in range(6)]

def current_bimester():
    return math.ceil(datetime.now().month / 2)

def bimester_months(bimester):
    return (bimester - 1) * 2 + 1, bimester * 2


from .models import Directorate, Osc, Visit, WorkPlan, MonthlyReport, FormDelegation
from apps.beneficios.models import BeneficiosReport
from apps.accounts.models import Profile


def normalize_plan_blocks(content):
    if not isinstance(content, list):
        return []

    normalized = []
    for index, block in enumerate(content, start=1):
        if not isinstance(block, dict):
            continue

        block_type = block.get("type", "paragraph")
        block_content = block.get("content", "")
        normalized.append(
            {
                "index": index,
                "type": block_type,
                "content": block_content,
            }
        )
    return normalized


def get_latest_work_plan_for_osc(directorate_id, osc_id):
    if not osc_id:
        return None

    return (
        WorkPlan.objects
        .filter(directorate_id=directorate_id, osc_id=osc_id)
        .order_by("-updated_at", "-created_at")
        .first()
    )


def build_work_plan_document_context(plan):
    osc = plan.osc
    directorate = plan.directorate
    return {
        "plan": plan,
        "osc": osc,
        "directorate": directorate,
        "document_title": plan.title or f"Plano de Trabalho - {osc.name}",
        "content_blocks": normalize_plan_blocks(plan.content),
        "generated_at": datetime.now(),
    }


def get_request_user_display_name(request):
    profile = getattr(request.user, "profile", None)
    if profile and profile.full_name:
        return profile.full_name
    return request.user.get_full_name() or request.user.get_username()


def title_name(value):
    return " ".join(part.capitalize() for part in str(value or "").split())


def append_visit_uploaded_documents(visit, files):
    document_fields = {
        "balanco_financeiro": "Balanço Financeiro",
        "fotos_camera": "Foto / Evidência",
        "fotos_galeria": "Foto / Evidência",
    }
    documents = list(visit.documents or [])

    for field_name, label in document_fields.items():
        for uploaded_file in files.getlist(field_name):
            documents.append(
                {
                    "name": uploaded_file.name,
                    "type": label,
                    "field": field_name,
                    "url": f"/media/mock/{uploaded_file.name}",
                    "uploaded_at": datetime.now().isoformat(),
                }
            )

    visit.documents = documents


def normalize_visit_attendance(visit, atendimento):
    presentes = atendimento.get("presentes") or {}
    try:
        manha = int(presentes.get("manha") or 0)
    except (TypeError, ValueError):
        manha = 0
    try:
        tarde = int(presentes.get("tarde") or 0)
    except (TypeError, ValueError):
        tarde = 0

    atendimento["total_mes"] = str(manha + tarde)
    subsidized_count = getattr(visit.osc, "subsidized_count", 0)
    atendimento["subvencionados"] = "Conforme Demanda" if subsidized_count == -1 else str(subsidized_count or 0)
    return atendimento


def set_nested_value(target, parts, value):
    current = target
    for index, part in enumerate(parts[:-1]):
        next_part = parts[index + 1]
        if part.isdigit():
            part_index = int(part)
            while len(current) <= part_index:
                current.append({} if not next_part.isdigit() else [])
            current = current[part_index]
            continue

        if part not in current:
            current[part] = [] if next_part.isdigit() else {}
        current = current[part]

    last = parts[-1]
    if last.isdigit() and isinstance(current, list):
        last_index = int(last)
        while len(current) <= last_index:
            current.append("")
        current[last_index] = value
    else:
        current[last] = value


def read_bracket_parts(key, prefix):
    prefix_length = len(prefix) + 1
    return key[prefix_length:-1].split("][")


def is_subvencao_directorate(directorate):
    ascii_name = strip_accents((getattr(directorate, "name", "") or "").lower())
    return "subvencao" in ascii_name

def current_bimester():
    return math.ceil(datetime.now().month / 2)

def bimester_months(bimester):
    return (bimester - 1) * 2 + 1, bimester * 2
from apps.beneficios.models import BeneficiosReport
from apps.accounts.models import Profile


class DirectorateListView(LoginRequiredMixin, ListView):
    template_name = "directorates/list.html"
    model = Directorate
    context_object_name = "directorates"

    def get_queryset(self):
        try:
            return Directorate.objects.order_by("name")
        except (OperationalError, ProgrammingError):
            return Directorate.objects.none()


class DirectorateDetailView(LoginRequiredMixin, DetailView):
    template_name = "directorates/detail.html"
    model = Directorate
    context_object_name = "directorate"

    def get(self, request, *args, **kwargs):
        self.object = self.get_object()
        normalized_name = self.object.name.lower()
        if "benef" in normalized_name:
            return redirect("beneficios:home", pk=self.object.pk)
        if "sine" in normalized_name or "qual" in normalized_name or "profissional" in normalized_name:
            return redirect("sinecp:home", pk=self.object.pk)
        if "naica" in normalized_name:
            return redirect("naica:home", pk=self.object.pk)
        if "cras" in normalized_name:
            return redirect("cras:home", pk=self.object.pk)
        return redirect("monitoramento:home", pk=self.object.pk)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = self.object
        normalized_name = directorate.name.lower()
        # Versão sem acentos para comparações (ex: "subvenção" → "subvencao")
        ascii_name = strip_accents(normalized_name)

        # Filtering parameters
        year = self.request.GET.get("year", datetime.now().year)
        month = self.request.GET.get("month", "all")
        bimester = self.request.GET.get("bimestre", str(current_bimester()))
        context["selected_year"] = int(year)
        context["selected_month"] = month
        context["selected_bimester"] = bimester
        context["years_range"] = range(2023, datetime.now().year + 1)
        context["months_range"] = [
            (1, "Janeiro"), (2, "Fevereiro"), (3, "Março"), (4, "Abril"),
            (5, "Maio"), (6, "Junho"), (7, "Julho"), (8, "Agosto"),
            (9, "Setembro"), (10, "Outubro"), (11, "Novembro"), (12, "Dezembro")
        ]
        context["bimester_options"] = BIMESTER_OPTIONS

        try:
            context["recent_visits"] = directorate.visits.select_related("osc").all()[:5]
            context["recent_plans"] = directorate.work_plans.select_related("osc").all()[:5]
            context["recent_oscs"] = directorate.oscs.all()[:5]

            # Detecção do tipo de diretoria (insensível a acentos)
            context["is_beneficios"] = "benef" in ascii_name
            context["is_subvencao"] = (
                any(x in ascii_name for x in ["subvencao", "emendas", "fundos"])
                and "outros" not in ascii_name
            )
            context["is_outros"] = "outros" in ascii_name
            context["is_monitoramento"] = context["is_subvencao"] or context["is_outros"]

            if context["is_beneficios"]:
                # ... (existing beneficios logic) ...
                reports = BeneficiosReport.objects.filter(directorate=directorate, year=year).order_by("month")
                context["beneficios_reports"] = reports
                
                # Filtering logic
                current_month_num = None
                if month != "all":
                    current_month_num = int(month)
                    m_report = reports.filter(month=current_month_num).first()
                    prev_month_num = current_month_num - 1 if current_month_num > 1 else 12
                    prev_year = year if current_month_num > 1 else int(year) - 1
                    p_report = BeneficiosReport.objects.filter(directorate=directorate, year=prev_year, month=prev_month_num).first()
                else:
                    # Year total
                    from django.db.models import Sum
                    m_report_data = reports.aggregate(
                        inclusao=Sum("encaminhadas_inclusao_cadunico"),
                        atualizacao=Sum("encaminhadas_atualizacao_cadunico"),
                        pro_pao=Sum("pro_pao"),
                        cesta=Sum("cesta_basica"),
                        familias_pbf=Sum("familias_pbf"),
                        pessoas_cadunico=Sum("pessoas_cadunico"),
                        v_cadunico=Sum("visitas_cadunico"),
                        v_nucleo=Sum("visita_nucleo_habitacao"),
                        v_cesta=Sum("visita_cesta_fraldas_colchoes"),
                        v_dmae=Sum("visita_dmae"),
                        v_propao=Sum("visitas_pro_pao")
                    )
                    m_report = type('obj', (object,), m_report_data) # Fake object
                    p_report = None # No simple comparison for whole year vs prev year for now

                # Metrics and Variations
                def get_var(curr, prev):
                    if not prev or prev == 0: return 0
                    return round(((curr - prev) / prev) * 100, 1)

                if m_report:
                    metrics = {
                        "inclusao": getattr(m_report, "inclusao", m_report.encaminhadas_inclusao_cadunico if hasattr(m_report, "encaminhadas_inclusao_cadunico") else 0),
                        "atualizacao": getattr(m_report, "atualizacao", m_report.encaminhadas_atualizacao_cadunico if hasattr(m_report, "encaminhadas_atualizacao_cadunico") else 0),
                        "pro_pao": getattr(m_report, "pro_pao", m_report.pro_pao if hasattr(m_report, "pro_pao") else 0),
                        "cesta": getattr(m_report, "cesta", m_report.cesta_basica if hasattr(m_report, "cesta_basica") else 0)
                    }
                    
                    vars = {}
                    if p_report:
                        vars["inclusao"] = get_var(metrics["inclusao"], p_report.encaminhadas_inclusao_cadunico)
                        vars["atualizacao"] = get_var(metrics["atualizacao"], p_report.encaminhadas_atualizacao_cadunico)
                        vars["pro_pao"] = get_var(metrics["pro_pao"], p_report.pro_pao)
                        vars["cesta"] = get_var(metrics["cesta"], p_report.cesta_basica)
                    
                    context["latest_metrics"] = metrics
                    context["variations"] = vars

                # Insights
                visitas = [
                    ("CadÚnico", getattr(m_report, "v_cadunico", m_report.visitas_cadunico if hasattr(m_report, "visitas_cadunico") else 0)),
                    ("Habitação", getattr(m_report, "v_nucleo", m_report.visita_nucleo_habitacao if hasattr(m_report, "visita_nucleo_habitacao") else 0)),
                    ("Cesta/Fralda", getattr(m_report, "v_cesta", m_report.visita_cesta_fraldas_colchoes if hasattr(m_report, "visita_cesta_fraldas_colchoes") else 0)),
                    ("DMAE", getattr(m_report, "v_dmae", m_report.visita_dmae if hasattr(m_report, "visita_dmae") else 0)),
                    ("Pró-Pão", getattr(m_report, "v_propao", m_report.visitas_pro_pao if hasattr(m_report, "visitas_pro_pao") else 0))
                ]
                visitas.sort(key=lambda x: x[1], reverse=True)
                context["top_visita"] = visitas[0] if visitas[0][1] > 0 else None
                context["visitas_sorted"] = visitas
                
                # Growth Insight
                if context.get("variations"):
                    max_growth = max(context["variations"].items(), key=lambda x: x[1])
                    if max_growth[1] > 0:
                        context["growth_insight"] = f"Aumento expressivo em {max_growth[0].replace('_', ' ')} (+{max_growth[1]}%)"

            elif context["is_monitoramento"]:
                now = datetime.now()
                curr_year = int(year)
                if bimester != "all":
                    curr_bimester = int(bimester)
                else:
                    curr_bimester = current_bimester()
                b_start_month, b_end_month = bimester_months(curr_bimester)
                b_labels = BIMESTER_LABELS
                context["bimester_label"] = f"{curr_bimester}o Bimestre ({b_labels[curr_bimester-1]})"
                
                visits = directorate.visits.filter(
                    visit_date__year=curr_year,
                    visit_date__month__gte=b_start_month,
                    visit_date__month__lte=b_end_month
                )
                
                # Filter by status if needed, but for stats we need all in bimester
                all_visits = list(visits)
                
                stats = {
                    "totalOSCs": directorate.oscs.count(),
                    "totalVisits": len(all_visits),
                    "finalizedVisits": len([v for v in all_visits if v.status in ['completed', 'finalized']]),
                    "draftReports": len([v for v in all_visits if v.parecer_tecnico and v.parecer_tecnico.get('status') == 'draft']),
                    "finalizedReports": len([v for v in all_visits if v.parecer_tecnico and v.parecer_tecnico.get('status') == 'finalized']),
                    "finalizedFinalReports": len([v for v in all_visits if v.relatorio_final and v.relatorio_final.get('status') == 'finalized']),
                    "finalizedConclusiveOpinions": len([v for v in all_visits if v.parecer_conclusivo and v.parecer_conclusivo.get('status') == 'finalized'])
                }
                context["subvencao_stats"] = stats
                context["all_visits_data"] = all_visits
                
                # For charts
                context["stats_json"] = stats # To be used in JS
                
                # Mode flags
                context["is_outros_mode"] = context["is_outros"]
                context["is_subvencao_mode"] = context["is_subvencao"]

        except (OperationalError, ProgrammingError):
            context["recent_visits"] = []
            context["recent_plans"] = []
            context["recent_oscs"] = []
            context["beneficios_reports"] = []
            
        return context


class OscListView(LoginRequiredMixin, ListView):
    template_name = "directorates/monitoring/osc_list.html"
    model = Osc
    context_object_name = "oscs"

    def get_queryset(self):
        return Osc.objects.filter(directorate_id=self.kwargs["pk"])

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = Directorate.objects.get(pk=self.kwargs["pk"])
        context["directorate"] = directorate
        types = (
            Osc.objects.filter(directorate_id=self.kwargs["pk"])
            .exclude(activity_type="")
            .values_list("activity_type", flat=True)
            .distinct()
            .order_by("activity_type")
        )
        context["activity_types"] = list(types)
        return context

class VisitListView(LoginRequiredMixin, ListView):
    template_name = "directorates/monitoring/visit_list.html"
    model = Visit
    context_object_name = "visits"
    paginate_by = 50

    def get_queryset(self):
        qs = Visit.objects.filter(directorate_id=self.kwargs["pk"]).select_related("osc", "directorate")
        bimester = self.request.GET.get("bimestre", str(current_bimester()))
        year = self.request.GET.get("year", datetime.now().year)
        start_date = self.request.GET.get("start_date", "")
        end_date = self.request.GET.get("end_date", "")

        if start_date and end_date:
            qs = qs.filter(visit_date__gte=start_date, visit_date__lte=end_date)
        elif bimester != "all":
            start, end = bimester_months(int(bimester))
            import calendar
            qs = qs.filter(
                visit_date__year=year,
                visit_date__month__gte=start,
                visit_date__month__lte=end,
            )
        if not start_date:
            qs = qs.filter(visit_date__year=year)
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["directorate"] = Directorate.objects.get(pk=self.kwargs["pk"])
        for visit in context["visits"]:
            identificacao = visit.identificacao or {}
            visit.registered_by_name = (
                identificacao.get("registered_by_name")
                or identificacao.get("registrado_por")
                or "Desconhecido"
            )
            assinaturas = visit.assinaturas or {}
            visit.tecnico1_display = title_name(assinaturas.get("tecnico1_nome", ""))
            visit.tecnico2_display = title_name(assinaturas.get("tecnico2_nome", ""))
        context["profiles"] = Profile.objects.all().order_by("full_name")
        context["all_directorates"] = Directorate.objects.all().order_by("name")
        context["years_range"] = range(2023, datetime.now().year + 1)
        context["selected_year"] = int(self.request.GET.get("year", datetime.now().year))
        context["selected_bimester"] = self.request.GET.get("bimestre", str(current_bimester()))
        context["bimester_options"] = BIMESTER_OPTIONS
        return context

class VisitDelegateView(LoginRequiredMixin, View):
    def post(self, request, pk):
        visit = get_object_or_404(Visit, pk=pk)
        user_ids = request.POST.getlist("user_ids")
        directorate_ids = request.POST.getlist("directorate_ids")
        
        # Clear existing
        FormDelegation.objects.filter(visit=visit).delete()
        
        # Add Users
        for uid in user_ids:
            FormDelegation.objects.create(
                id=uuid.uuid4(),
                visit=visit,
                user_id=uid,
                delegated_by=request.user.id
            )
            
        # Add Directorates
        for did in directorate_ids:
            FormDelegation.objects.create(
                id=uuid.uuid4(),
                visit=visit,
                directorate_id=did,
                delegated_by=request.user.id
            )
            
        return redirect("directorates:visit-list", kwargs={"pk": visit.directorate.pk})

class WorkPlanListView(LoginRequiredMixin, ListView):
    template_name = "directorates/monitoring/plan_list.html"
    model = WorkPlan
    context_object_name = "oscs"

    def get_queryset(self):
        queryset = Osc.objects.filter(directorate_id=self.kwargs["pk"]).prefetch_related("work_plans")
        osc_id = self.request.GET.get("osc")
        if osc_id:
            queryset = queryset.filter(pk=osc_id)
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["directorate"] = Directorate.objects.get(pk=self.kwargs["pk"])
        context["selected_osc_id"] = self.request.GET.get("osc", "")
        return context

class WorkPlanUpdateView(LoginRequiredMixin, UpdateView):
    model = WorkPlan
    template_name = "directorates/monitoring/plan_form.html"
    fields = ["title", "content", "status"]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["directorate"] = self.object.directorate
        context["selected_osc_id"] = str(self.object.osc_id)
        return context
    
    def get_success_url(self):
        return reverse("directorates:plan-list", kwargs={"pk": self.object.directorate.pk})

class WorkPlanCreateView(LoginRequiredMixin, CreateView):
    model = WorkPlan
    template_name = "directorates/monitoring/plan_form.html"
    fields = ["title", "content", "status", "osc"]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["directorate"] = Directorate.objects.get(pk=self.kwargs["pk"])
        context["selected_osc_id"] = self.request.GET.get("osc", "")
        return context

    def form_valid(self, form):
        form.instance.directorate_id = self.kwargs["pk"]
        return super().form_valid(form)

    def get_success_url(self):
        return reverse("directorates:plan-list", kwargs={"pk": self.kwargs["pk"]})

class WorkPlanDeleteView(LoginRequiredMixin, DeleteView):
    model = WorkPlan
    template_name = "directorates/monitoring/confirm_delete.html"
    
    def get_success_url(self):
        return reverse("directorates:plan-list", kwargs={"pk": self.object.directorate.pk})


class WorkPlanPreviewView(LoginRequiredMixin, View):
    def get(self, request, pk):
        osc_id = request.GET.get("osc")
        if not osc_id:
            return JsonResponse({"success": False, "error": "Selecione uma OSC para visualizar o plano."}, status=400)

        plan = get_latest_work_plan_for_osc(pk, osc_id)
        if not plan:
            return JsonResponse({"success": False, "error": "Nenhum plano de trabalho encontrado para esta OSC."}, status=404)

        context = build_work_plan_document_context(plan)
        html = render_to_string("directorates/monitoring/partials/work_plan_preview.html", context, request=request)
        open_url = reverse("directorates:plan-document", kwargs={"pk": plan.directorate.pk}) + f"?osc={plan.osc.pk}"
        return JsonResponse(
            {
                "success": True,
                "title": context["document_title"],
                "html": html,
                "open_url": open_url,
            }
        )


class WorkPlanDocumentView(LoginRequiredMixin, TemplateView):
    template_name = "directorates/monitoring/work_plan_document.html"

    def get(self, request, *args, **kwargs):
        osc_id = request.GET.get("osc")
        if not osc_id:
            messages.error(request, "Selecione uma OSC para visualizar o plano de trabalho.")
            return redirect("directorates:plan-list", pk=self.kwargs["pk"])

        plan = get_latest_work_plan_for_osc(self.kwargs["pk"], osc_id)
        if not plan:
            messages.error(request, "Nenhum plano de trabalho encontrado para esta OSC.")
            return redirect("directorates:plan-list", pk=self.kwargs["pk"])

        context = self.get_context_data(**kwargs)
        context.update(build_work_plan_document_context(plan))
        return render(request, self.template_name, context)

class MonitoringReportListView(LoginRequiredMixin, ListView):
    template_name = "directorates/monitoring/report_list.html"
    model = Visit
    context_object_name = "visits"

    def get_queryset(self):
        return Visit.objects.filter(directorate_id=self.kwargs["pk"]).order_by("-visit_date")
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["directorate"] = Directorate.objects.get(pk=self.kwargs["pk"])
        return context

class VisitReportView(LoginRequiredMixin, DetailView):
    """Generic view to handle the 3 types of specialized reports."""
    model = Visit
    template_name = "directorates/monitoring/report_form.html"
    context_object_name = "visit"

    REPORT_LABELS = {
        "parecer_tecnico": "Parecer Tecnico",
        "parecer_conclusivo": "Parecer Conclusivo",
        "relatorio_final": "Relatorio Final",
    }

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        report_type = self.kwargs.get("report_type", "parecer_tecnico")
        context["report_type"] = report_type
        context["report_label"] = self.REPORT_LABELS.get(report_type, report_type.replace("_", " ").title())
        context["report_data"] = getattr(self.object, report_type) or {}
        context["directorate"] = self.object.directorate
        return context

    def post(self, request, *args, **kwargs):
        visit = self.get_object()
        report_type = self.kwargs.get("report_type", "parecer_tecnico")
        
        try:
            data = json.loads(request.POST.get("data", "{}"))
            setattr(visit, report_type, data)
            visit.save()
            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)}, status=400)

class VisitUploadDocumentView(LoginRequiredMixin, View):
    def post(self, request, pk):
        visit = get_object_or_404(Visit, pk=pk)
        file = request.FILES.get("file")
        if not file:
            return JsonResponse({"success": False, "error": "No file provided"}, status=400)
        
        # In a real scenario, upload to Supabase or S3
        # Here we'll simulate saving the name and a mock URL
        doc_data = {
            "name": file.name,
            "url": f"/media/mock/{file.name}", # Mock URL
            "uploaded_at": datetime.now().isoformat()
        }
        
        if not visit.documents:
            visit.documents = []
        visit.documents.append(doc_data)
        visit.save()
        
        return JsonResponse({"success": True, "document": doc_data})


from .forms import OscForm, VisitForm

class OscCreateView(LoginRequiredMixin, CreateView):
    model = Osc
    form_class = OscForm
    template_name = "directorates/monitoring/osc_form.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["directorate"] = Directorate.objects.get(pk=self.kwargs["pk"])
        return context

    def form_valid(self, form):
        form.instance.directorate_id = self.kwargs["pk"]
        form.instance.id = uuid.uuid4()
        return super().form_valid(form)

    def get_success_url(self):
        return reverse("directorates:osc-list", kwargs={"pk": self.kwargs["pk"]})

class OscUpdateView(LoginRequiredMixin, UpdateView):
    model = Osc
    form_class = OscForm
    template_name = "directorates/monitoring/osc_form.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["directorate"] = self.object.directorate
        return context

    def get_success_url(self):
        return reverse("directorates:osc-list", kwargs={"pk": self.object.directorate.pk})

class OscDeleteView(LoginRequiredMixin, DeleteView):
    model = Osc
    
    def get_success_url(self):
        return reverse("directorates:osc-list", kwargs={"pk": self.object.directorate.pk})

class VisitCreateView(LoginRequiredMixin, TemplateView):
    template_name = "directorates/monitoring/visit_instrumental.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directorate = get_object_or_404(Directorate, pk=self.kwargs["pk"])
        context["directorate"] = directorate
        context["oscs"] = Osc.objects.filter(directorate=directorate).order_by("name")
        context["is_new"] = True
        context["object"] = None
        context["is_subvencao_visit"] = is_subvencao_directorate(directorate)
        return context

    def post(self, request, *args, **kwargs):
        directorate = get_object_or_404(Directorate, pk=self.kwargs["pk"])
        data = request.POST
        access_checkbox_fields = ("demanda_espontanea", "busca_ativa", "encaminhamento", "outros")

        osc_id = data.get("osc")
        if not osc_id:
            messages.error(request, "Selecione uma OSC.")
            return redirect("directorates:visit-create", pk=directorate.pk)

        visit = Visit(
            id=uuid.uuid4(),
            directorate=directorate,
            osc_id=osc_id,
            visit_date=data.get("identificacao[visit_date_1]", "") or datetime.now(),
            visit_time="09:00",
            status=data.get("status", "draft"),
        )

        identificacao = {}
        for key, value in data.items():
            if key.startswith("identificacao[") and key.endswith("]"):
                identificacao[key[14:-1]] = value
        identificacao["registered_by_name"] = get_request_user_display_name(request)
        identificacao["registered_by_username"] = request.user.get_username()
        if identificacao:
            visit.identificacao = identificacao

        atendimento = {}
        for key, value in data.items():
            if key.startswith("atendimento[") and key.endswith("]"):
                set_nested_value(atendimento, read_bracket_parts(key, "atendimento"), value)
        if atendimento:
            visit.atendimento = normalize_visit_attendance(visit, atendimento)

        forma_acesso = {
            field: data.get(f"forma_acesso[{field}]") == "on"
            for field in access_checkbox_fields
        }
        forma_acesso["quem_encaminha"] = data.get("forma_acesso[quem_encaminha]", "").strip()
        if any(forma_acesso[field] for field in access_checkbox_fields) or forma_acesso["quem_encaminha"]:
            visit.forma_acesso = forma_acesso

        assinaturas = {}
        for key, value in data.items():
            if key.startswith("assinaturas[") and key.endswith("]"):
                assinaturas[key[12:-1]] = value
        if assinaturas:
            visit.assinaturas = assinaturas

        if "rh_data" in data:
            try:
                visit.rh_data = json.loads(data["rh_data"])
            except json.JSONDecodeError:
                pass

        visit.observacoes = data.get("observacoes", "")
        visit.recomendacoes = data.get("recomendacoes", "")
        append_visit_uploaded_documents(visit, request.FILES)

        try:
            visit.save()
        except Exception:
            messages.error(request, "Nao foi possivel salvar a visita. Tente novamente.")
            return redirect("directorates:visit-create", pk=directorate.pk)

        if visit.status == "completed":
            messages.success(request, "Visita finalizada com sucesso.")
        else:
            messages.success(request, "Rascunho salvo com sucesso.")
        return redirect("directorates:visit-list", pk=directorate.pk)

class VisitInstrumentalView(LoginRequiredMixin, UpdateView):
    model = Visit
    template_name = "directorates/monitoring/visit_instrumental.html"
    fields = ["status", "observacoes", "recomendacoes"]

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["directorate"] = self.object.directorate
        context["oscs"] = Osc.objects.filter(directorate_id=self.object.directorate.pk).order_by("name")
        context["is_new"] = False
        context["is_subvencao_visit"] = is_subvencao_directorate(self.object.directorate)
        return context

    def post(self, request, *args, **kwargs):
        self.object = self.get_object()

        # Manually extract nested data from POST
        data = request.POST
        access_checkbox_fields = ("demanda_espontanea", "busca_ativa", "encaminhamento", "outros")
        
        # Process Identificacao
        identificacao = self.object.identificacao or {}
        for key, value in data.items():
            if key.startswith("identificacao[") and key.endswith("]"):
                inner_key = key[14:-1]
                identificacao[inner_key] = value
        if not identificacao.get("registered_by_name"):
            identificacao["registered_by_name"] = get_request_user_display_name(request)
        if not identificacao.get("registered_by_username"):
            identificacao["registered_by_username"] = request.user.get_username()
        self.object.identificacao = identificacao

        # Process Atendimento
        atendimento = self.object.atendimento or {}
        for key, value in data.items():
            if key.startswith("atendimento[") and key.endswith("]"):
                set_nested_value(atendimento, read_bracket_parts(key, "atendimento"), value)
        self.object.atendimento = normalize_visit_attendance(self.object, atendimento)

        self.object.forma_acesso = {
            **{
                field: data.get(f"forma_acesso[{field}]") == "on"
                for field in access_checkbox_fields
            },
            "quem_encaminha": data.get("forma_acesso[quem_encaminha]", "").strip(),
        }

        # Process Assinaturas
        assinaturas = self.object.assinaturas or {}
        for key, value in data.items():
            if key.startswith("assinaturas[") and key.endswith("]"):
                inner_key = key[12:-1]
                assinaturas[inner_key] = value
        self.object.assinaturas = assinaturas

        # RH Data is already JSON string from JS
        if "rh_data" in data:
            import json
            try:
                self.object.rh_data = json.loads(data["rh_data"])
            except:
                pass

        self.object.observacoes = data.get("observacoes", "")
        self.object.recomendacoes = data.get("recomendacoes", "")
        self.object.status = data.get("status") or "draft"
        append_visit_uploaded_documents(self.object, request.FILES)

        try:
            self.object.save()
        except Exception:
            messages.error(request, "Nao foi possivel salvar a visita. Tente novamente.")
            return redirect("directorates:visit-instrumental", pk=self.object.pk)

        if self.object.status == "completed":
            messages.success(request, "Visita finalizada com sucesso.")
        else:
            messages.success(request, "Rascunho salvo com sucesso.")
        return redirect(self.get_success_url())

    def get_success_url(self):
        return reverse("directorates:visit-list", kwargs={"pk": self.object.directorate.pk})

class VisitRevertView(LoginRequiredMixin, View):
    def post(self, request, pk):
        visit = get_object_or_404(Visit, pk=pk)
        visit.status = "draft"
        visit.save()
        return redirect("directorates:visit-list", kwargs={"pk": visit.directorate.pk})

class VisitDeleteView(LoginRequiredMixin, DeleteView):
    model = Visit
    
    def get_success_url(self):
        return reverse("directorates:visit-list", kwargs={"pk": self.object.directorate.pk})
