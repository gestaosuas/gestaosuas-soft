from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Student",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_active", models.BooleanField(default=True)),
                ("full_name", models.CharField(max_length=180)),
                ("birth_date", models.DateField(blank=True, null=True)),
                ("cpf", models.CharField(blank=True, max_length=14)),
                ("rg", models.CharField(blank=True, max_length=30)),
                ("phone", models.CharField(blank=True, max_length=30)),
                ("whatsapp", models.CharField(blank=True, max_length=30)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("mother_name", models.CharField(blank=True, max_length=180)),
                ("guardian_name", models.CharField(blank=True, max_length=180)),
                ("address", models.CharField(blank=True, max_length=255)),
                ("neighborhood", models.CharField(blank=True, max_length=120)),
                ("city", models.CharField(blank=True, max_length=120)),
                ("zip_code", models.CharField(blank=True, max_length=12)),
                ("education_level", models.CharField(blank=True, max_length=120)),
                ("notes", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("active", "Ativo"), ("inactive", "Inativo"), ("waiting", "Aguardando")], default="active", max_length=20)),
            ],
            options={"ordering": ("full_name",)},
        ),
    ]

