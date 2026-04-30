from django.db import models

from apps.common.models import TimeStampedModel


class MonitoringRecord(TimeStampedModel):
    directorate = models.ForeignKey("directorates.Directorate", on_delete=models.PROTECT, related_name="monitoring_records")
    title = models.CharField(max_length=180)
    record_date = models.DateField()
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ("-record_date", "-created_at")

    def __str__(self) -> str:
        return self.title

