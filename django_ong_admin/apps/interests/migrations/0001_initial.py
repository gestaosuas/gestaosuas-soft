import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("courses", "0001_initial"),
        ("students", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="CourseInterest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("interest_date", models.DateField()),
                ("status", models.CharField(choices=[("interested", "Demonstrou interesse"), ("waiting_class", "Aguardando turma"), ("pre_selected", "Pre-selecionado"), ("approved", "Aprovado para matricula"), ("rejected", "Nao aprovado"), ("withdrew", "Desistiu")], default="interested", max_length=30)),
                ("notes", models.TextField(blank=True)),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="interests", to="courses.course")),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="course_interests", to="students.student")),
            ],
            options={"ordering": ("-interest_date", "-created_at")},
        ),
    ]

