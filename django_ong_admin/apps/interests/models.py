from django.db import models

from apps.common.models import TimeStampedModel


class CourseInterest(TimeStampedModel):
    class Status(models.TextChoices):
        INTERESTED = "interested", "Demonstrou interesse"
        WAITING_CLASS = "waiting_class", "Aguardando turma"
        PRE_SELECTED = "pre_selected", "Pre-selecionado"
        APPROVED = "approved", "Aprovado para matricula"
        REJECTED = "rejected", "Nao aprovado"
        WITHDREW = "withdrew", "Desistiu"

    student = models.ForeignKey("students.Student", on_delete=models.PROTECT, related_name="course_interests")
    course = models.ForeignKey("courses.Course", on_delete=models.PROTECT, related_name="interests")
    interest_date = models.DateField()
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.INTERESTED)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ("-interest_date", "-created_at")

    def __str__(self) -> str:
        return f"{self.student} - {self.course}"

