from django.contrib import admin

from .models import Course


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "capacity", "start_date", "status", "is_active")
    list_filter = ("status", "is_active", "category", "shift")
    search_fields = ("name", "description", "teacher", "location")

