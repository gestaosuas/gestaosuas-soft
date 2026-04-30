from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Directorate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_active", models.BooleanField(default=True)),
                ("name", models.CharField(max_length=180, unique=True)),
                ("slug", models.SlugField(max_length=180, unique=True)),
                ("group", models.CharField(choices=[("main", "Diretoria"), ("monitoring", "Monitoramento")], default="main", max_length=20)),
                ("kind", models.CharField(choices=[("beneficios", "Beneficios Socioassistenciais"), ("cras", "CRAS"), ("ceai", "CEAI"), ("creas", "CREAS"), ("pop_rua", "Populacao de Rua e Migrantes"), ("naica", "NAICAs"), ("protecao_especial", "Protecao Especial"), ("casa_mulher", "Casa da Mulher"), ("subvencao", "Subvencao"), ("outros", "Outros"), ("generic", "Generico")], default="generic", max_length=40)),
                ("description", models.TextField(blank=True)),
                ("order", models.PositiveIntegerField(default=0)),
            ],
            options={"ordering": ("group", "order", "name")},
        ),
    ]

