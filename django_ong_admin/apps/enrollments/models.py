from django.core.exceptions import ValidationError
from django.db import models

from apps.common.models import TimeStampedModel


class Enrollment(TimeStampedModel):
    class Status(models.TextChoices):
        ENROLLED = "enrolled", "Matriculado"
        IN_PROGRESS = "in_progress", "Em andamento"
        COMPLETED = "completed", "Concluido"
        CANCELED = "canceled", "Cancelado"
        DROPPED_OUT = "dropped_out", "Evadido"
        LOCKED = "locked", "Trancado"

    student = models.ForeignKey("students.Student", on_delete=models.PROTECT, related_name="enrollments")
    course = models.ForeignKey("courses.Course", on_delete=models.PROTECT, related_name="enrollments")
    interest = models.ForeignKey("interests.CourseInterest", on_delete=models.SET_NULL, null=True, blank=True, related_name="enrollments")
    enrollment_date = models.DateField()
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.ENROLLED)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ("-enrollment_date", "-created_at")
        constraints = [
            models.UniqueConstraint(fields=["student", "course"], name="unique_student_course_enrollment")
        ]

    def clean(self):
        if self.course and self.course.capacity and self.course.available_seats <= 0 and self.status == self.Status.ENROLLED:
            raise ValidationError("Curso sem vagas disponiveis.")

    def __str__(self) -> str:
        return f"{self.student} - {self.course}"

