from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy
from django.views.generic import CreateView, DetailView, ListView, UpdateView

from .forms import CourseForm
from .models import Course


class CourseListView(LoginRequiredMixin, ListView):
    model = Course
    template_name = "courses/list.html"
    context_object_name = "courses"
    paginate_by = 20

    def get_queryset(self):
        queryset = Course.objects.all()
        search = self.request.GET.get("q")
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class CourseDetailView(LoginRequiredMixin, DetailView):
    model = Course
    template_name = "courses/detail.html"


class CourseCreateView(LoginRequiredMixin, CreateView):
    model = Course
    form_class = CourseForm
    template_name = "courses/form.html"


class CourseUpdateView(LoginRequiredMixin, UpdateView):
    model = Course
    form_class = CourseForm
    template_name = "courses/form.html"
    success_url = reverse_lazy("course_list")

