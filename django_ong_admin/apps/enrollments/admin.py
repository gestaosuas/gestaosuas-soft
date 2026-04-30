from django.contrib import admin

from .models import Enrollment


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "enrollment_date", "status")
    list_filter = ("status", "enrollment_date")
    search_fields = ("student__full_name", "course__name", "notes")

