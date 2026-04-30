from django.contrib import admin

from .models import CourseInterest


@admin.register(CourseInterest)
class CourseInterestAdmin(admin.ModelAdmin):
    list_display = ("student", "course", "interest_date", "status")
    list_filter = ("status", "interest_date")
    search_fields = ("student__full_name", "course__name", "notes")

