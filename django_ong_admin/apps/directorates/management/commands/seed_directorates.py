from django.core.management.base import BaseCommand

from apps.directorates.models import Directorate


DIRECTORATES = [
    {
        "name": "Beneficios Socioassistenciais",
        "slug": "beneficios-socioassistenciais",
        "group": Directorate.Group.MAIN,
        "kind": Directorate.Kind.BENEFICIOS,
        "order": 10,
    },
    {
        "name": "Qualificacao Profissional e SINE",
        "slug": "qualificacao-profissional-sine",
        "group": Directorate.Group.MAIN,
        "kind": Directorate.Kind.GENERIC,
        "order": 20,
    },
    {
        "name": "CRAS",
        "slug": "cras",
        "group": Directorate.Group.MAIN,
        "kind": Directorate.Kind.CRAS,
        "order": 30,
    },
    {
        "name": "CEAI",
        "slug": "ceai",
        "group": Directorate.Group.MAIN,
        "kind": Directorate.Kind.CEAI,
        "order": 40,
    },
    {
        "name": "CREAS Idoso e Pessoa com Deficiencia",
        "slug": "creas-idoso-pessoa-deficiencia",
        "group": Directorate.Group.MAIN,
        "kind": Directorate.Kind.CREAS,
        "order": 50,
    },
    {
        "name": "Populacao de Rua e Migrantes",
        "slug": "populacao-rua-migrantes",
        "group": Directorate.Group.MAIN,
        "kind": Directorate.Kind.POP_RUA,
        "order": 60,
    },
    {
        "name": "NAICAs",
        "slug": "naicas",
        "group": Directorate.Group.MAIN,
        "kind": Directorate.Kind.NAICA,
        "order": 70,
    },
    {
        "name": "Protecao Especial a Crianca e Adolescente",
        "slug": "protecao-especial-crianca-adolescente",
        "group": Directorate.Group.MAIN,
        "kind": Directorate.Kind.PROTECAO_ESPECIAL,
        "order": 80,
    },
    {
        "name": "Casa da Mulher",
        "slug": "casa-da-mulher",
        "group": Directorate.Group.MAIN,
        "kind": Directorate.Kind.CASA_MULHER,
        "order": 90,
    },
    {
        "name": "Subvencao",
        "slug": "subvencao",
        "group": Directorate.Group.MONITORING,
        "kind": Directorate.Kind.SUBVENCAO,
        "order": 10,
    },
    {
        "name": "Emendas e Fundos",
        "slug": "emendas-fundos",
        "group": Directorate.Group.MONITORING,
        "kind": Directorate.Kind.SUBVENCAO,
        "order": 20,
    },
    {
        "name": "Outros",
        "slug": "outros",
        "group": Directorate.Group.MONITORING,
        "kind": Directorate.Kind.OUTROS,
        "order": 30,
    },
]


class Command(BaseCommand):
    help = "Cria as diretorias e monitoramentos iniciais."

    def handle(self, *args, **options):
        created = 0
        updated = 0

        for item in DIRECTORATES:
            _, was_created = Directorate.objects.update_or_create(
                slug=item["slug"],
                defaults=item,
            )
            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(f"Diretorias criadas: {created}. Atualizadas: {updated}."))

