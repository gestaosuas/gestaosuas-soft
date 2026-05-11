from django.conf import settings
from django.db import models

class Profile(models.Model):
    ROLE_ADMIN = "admin"
    ROLE_USER = "user"
    ROLE_DIRECTOR = "diretor"
    ROLE_CHOICES = [
        (ROLE_ADMIN, "Administrador"),
        (ROLE_USER, "Usuario"),
        (ROLE_DIRECTOR, "Diretor"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_USER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    primary_directorate = models.ForeignKey(
        "directorates.Directorate",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="primary_profiles",
    )
    directorates = models.ManyToManyField(
        "directorates.Directorate",
        through="accounts.ProfileDirectorate",
        related_name="profiles",
    )

    class Meta:
        ordering = ["full_name", "user__email"]

    def __str__(self) -> str:
        return self.full_name or self.user.get_username()


class ProfileDirectorate(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    directorate = models.ForeignKey("directorates.Directorate", on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)
    allowed_units = models.JSONField(null=True, blank=True)

    class Meta:
        unique_together = ("profile", "directorate")
        verbose_name = "Vinculo perfil-diretoria"
        verbose_name_plural = "Vinculos perfil-diretoria"

    def __str__(self) -> str:
        return f"{self.profile} -> {self.directorate}"
