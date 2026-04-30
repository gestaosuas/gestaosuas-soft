from django.db import models
from django.urls import reverse

from apps.common.models import ActiveModel, TimeStampedModel


class Course(TimeStampedModel, ActiveModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Ativo"
        INACTIVE = "inactive", "Inativo"
        FINISHED = "finished", "Finalizado"

    name = models.CharField(max_length=180)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=120, blank=True)
    workload_hours = models.PositiveIntegerField(default=0)
    capacity = models.PositiveIntegerField(default=0)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    shift = models.CharField(max_length=80, blank=True)
    weekdays = models.CharField(max_length=180, blank=True)
    teacher = models.CharField(max_length=180, blank=True)
    location = models.CharField(max_length=180, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)

    class Meta:
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name

    @property
    def active_enrollments_count(self) -> int:
        return self.enrollments.filter(status="enrolled").count()

    @property
    def available_seats(self) -> int:
        if self.capacity <= 0:
            return 0
        return max(self.capacity - self.active_enrollments_count, 0)

    def get_absolute_url(self):
        return reverse("course_detail", kwargs={"pk": self.pk})

