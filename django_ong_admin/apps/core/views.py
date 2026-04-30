from django.contrib.auth.decorators import login_required
from django.shortcuts import render

from apps.courses.models import Course
from apps.directorates.models import Directorate
from apps.enrollments.models import Enrollment
from apps.interests.models import CourseInterest
from apps.students.models import Student


@login_required
def dashboard(request):
    context = {
        "total_students": Student.objects.count(),
        "total_courses": Course.objects.count(),
        "total_interests": CourseInterest.objects.count(),
        "total_active_enrollments": Enrollment.objects.filter(status=Enrollment.Status.ENROLLED).count(),
        "main_directorates": Directorate.objects.filter(group=Directorate.Group.MAIN, is_active=True).order_by("order", "name"),
        "monitoring_directorates": Directorate.objects.filter(group=Directorate.Group.MONITORING, is_active=True).order_by("order", "name"),
    }
    return render(request, "core/dashboard.html", context)

