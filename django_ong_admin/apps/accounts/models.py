from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel


class UserProfile(TimeStampedModel):
    class Role(models.TextChoices):
        ADMIN = "admin", "Administrador"
        USER = "user", "Usuario"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    full_name = models.CharField(max_length=180, blank=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    directorates = models.ManyToManyField("directorates.Directorate", blank=True, related_name="users")

    def __str__(self) -> str:
        return self.full_name or self.user.get_username()

