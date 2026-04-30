import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("directorates", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="MonitoringRecord",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=180)),
                ("record_date", models.DateField()),
                ("notes", models.TextField(blank=True)),
                ("directorate", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="monitoring_records", to="directorates.directorate")),
            ],
            options={"ordering": ("-record_date", "-created_at")},
        ),
    ]

