from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import CreateView, ListView

from .forms import CourseInterestForm
from .models import CourseInterest


class CourseInterestListView(LoginRequiredMixin, ListView):
    model = CourseInterest
    template_name = "interests/list.html"
    context_object_name = "interests"
    paginate_by = 20


class CourseInterestCreateView(LoginRequiredMixin, CreateView):
    model = CourseInterest
    form_class = CourseInterestForm
    template_name = "interests/form.html"
    success_url = "/interesses/"

