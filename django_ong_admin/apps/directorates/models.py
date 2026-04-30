from django.db import models
from django.urls import reverse

from apps.common.models import ActiveModel, TimeStampedModel


class Directorate(TimeStampedModel, ActiveModel):
    class Group(models.TextChoices):
        MAIN = "main", "Diretoria"
        MONITORING = "monitoring", "Monitoramento"

    class Kind(models.TextChoices):
        BENEFICIOS = "beneficios", "Beneficios Socioassistenciais"
        CRAS = "cras", "CRAS"
        CEAI = "ceai", "CEAI"
        CREAS = "creas", "CREAS"
        POP_RUA = "pop_rua", "Populacao de Rua e Migrantes"
        NAICA = "naica", "NAICAs"
        PROTECAO_ESPECIAL = "protecao_especial", "Protecao Especial"
        CASA_MULHER = "casa_mulher", "Casa da Mulher"
        SUBVENCAO = "subvencao", "Subvencao"
        OUTROS = "outros", "Outros"
        GENERIC = "generic", "Generico"

    name = models.CharField(max_length=180, unique=True)
    slug = models.SlugField(max_length=180, unique=True)
    group = models.CharField(max_length=20, choices=Group.choices, default=Group.MAIN)
    kind = models.CharField(max_length=40, choices=Kind.choices, default=Kind.GENERIC)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ("group", "order", "name")

    def __str__(self) -> str:
        return self.name

    def get_absolute_url(self):
        return reverse("directorate_detail", kwargs={"slug": self.slug})

