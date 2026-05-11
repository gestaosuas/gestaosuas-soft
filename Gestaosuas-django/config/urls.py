from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("apps.core.urls")),
    path("accounts/", include("apps.accounts.urls")),
    path("directorias/", include("apps.directorates.urls")),
    path("monitoramento/", include("apps.monitoramento.urls")),
    path("cras/", include("apps.cras.urls")),
    path("beneficios/", include("apps.beneficios.urls")),
    path("sine-cp/", include("apps.sinecp.urls")),
    path("naica/", include("apps.naica.urls")),
]
