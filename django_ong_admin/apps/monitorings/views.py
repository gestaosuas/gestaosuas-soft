from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from apps.directorates.models import Directorate


@login_required
def monitoring_index(request):
    directorates = Directorate.objects.filter(group=Directorate.Group.MONITORING, is_active=True)
    return render(request, "monitorings/index.html", {"directorates": directorates})

