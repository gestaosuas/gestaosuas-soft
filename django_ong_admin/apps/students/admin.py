from django.contrib import admin

from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("full_name", "cpf", "phone", "status", "is_active")
    list_filter = ("status", "is_active", "city")
    search_fields = ("full_name", "cpf", "rg", "email", "phone", "whatsapp")

