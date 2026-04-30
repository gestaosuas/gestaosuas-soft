from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("login/", auth_views.LoginView.as_view(template_name="registration/login.html"), name="login"),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
    path("", include("apps.core.urls")),
    path("alunos/", include("apps.students.urls")),
    path("cursos/", include("apps.courses.urls")),
    path("interesses/", include("apps.interests.urls")),
    path("matriculas/", include("apps.enrollments.urls")),
    path("diretorias/", include("apps.directorates.urls")),
    path("monitoramentos/", include("apps.monitorings.urls")),
]

