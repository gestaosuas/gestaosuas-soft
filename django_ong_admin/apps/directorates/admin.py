from django.contrib import admin

from .models import Directorate


@admin.register(Directorate)
class DirectorateAdmin(admin.ModelAdmin):
    list_display = ("name", "group", "kind", "is_active", "order")
    list_filter = ("group", "kind", "is_active")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name", "description")

