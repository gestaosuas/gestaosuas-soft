from django.db import models
from django.urls import reverse

from apps.common.models import ActiveModel, TimeStampedModel


class Student(TimeStampedModel, ActiveModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Ativo"
        INACTIVE = "inactive", "Inativo"
        WAITING = "waiting", "Aguardando"

    full_name = models.CharField(max_length=180)
    birth_date = models.DateField(null=True, blank=True)
    cpf = models.CharField(max_length=14, blank=True)
    rg = models.CharField(max_length=30, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    whatsapp = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    mother_name = models.CharField(max_length=180, blank=True)
    guardian_name = models.CharField(max_length=180, blank=True)
    address = models.CharField(max_length=255, blank=True)
    neighborhood = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=120, blank=True)
    zip_code = models.CharField(max_length=12, blank=True)
    education_level = models.CharField(max_length=120, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        ordering = ("full_name",)

    def __str__(self) -> str:
        return self.full_name

    def get_absolute_url(self):
        return reverse("student_detail", kwargs={"pk": self.pk})

