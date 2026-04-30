from django.contrib import admin

from .models import MonitoringRecord


@admin.register(MonitoringRecord)
class MonitoringRecordAdmin(admin.ModelAdmin):
    list_display = ("title", "directorate", "record_date")
    list_filter = ("directorate", "record_date")
    search_fields = ("title", "notes")

