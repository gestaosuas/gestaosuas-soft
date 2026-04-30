from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, render

from .models import Directorate


@login_required
def directorate_list(request):
    directorates = Directorate.objects.filter(is_active=True).order_by("group", "order", "name")
    return render(request, "directorates/list.html", {"directorates": directorates})


@login_required
def directorate_detail(request, slug):
    directorate = get_object_or_404(Directorate, slug=slug, is_active=True)
    return render(request, "directorates/detail.html", {"directorate": directorate})

