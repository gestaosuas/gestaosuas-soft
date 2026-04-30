import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("courses", "0001_initial"),
        ("interests", "0001_initial"),
        ("students", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Enrollment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("enrollment_date", models.DateField()),
                ("status", models.CharField(choices=[("enrolled", "Matriculado"), ("in_progress", "Em andamento"), ("completed", "Concluido"), ("canceled", "Cancelado"), ("dropped_out", "Evadido"), ("locked", "Trancado")], default="enrolled", max_length=30)),
                ("notes", models.TextField(blank=True)),
                ("course", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="enrollments", to="courses.course")),
                ("interest", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="enrollments", to="interests.courseinterest")),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="enrollments", to="students.student")),
            ],
            options={"ordering": ("-enrollment_date", "-created_at")},
        ),
        migrations.AddConstraint(
            model_name="enrollment",
            constraint=models.UniqueConstraint(fields=("student", "course"), name="unique_student_course_enrollment"),
        ),
    ]

