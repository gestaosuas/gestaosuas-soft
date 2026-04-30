from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Course",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("is_active", models.BooleanField(default=True)),
                ("name", models.CharField(max_length=180)),
                ("description", models.TextField(blank=True)),
                ("category", models.CharField(blank=True, max_length=120)),
                ("workload_hours", models.PositiveIntegerField(default=0)),
                ("capacity", models.PositiveIntegerField(default=0)),
                ("start_date", models.DateField(blank=True, null=True)),
                ("end_date", models.DateField(blank=True, null=True)),
                ("shift", models.CharField(blank=True, max_length=80)),
                ("weekdays", models.CharField(blank=True, max_length=180)),
                ("teacher", models.CharField(blank=True, max_length=180)),
                ("location", models.CharField(blank=True, max_length=180)),
                ("status", models.CharField(choices=[("active", "Ativo"), ("inactive", "Inativo"), ("finished", "Finalizado")], default="active", max_length=20)),
            ],
            options={"ordering": ("name",)},
        ),
    ]

