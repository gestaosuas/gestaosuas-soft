from django.urls import path

from . import views

urlpatterns = [
    path("", views.monitoring_index, name="monitoring_index"),
]

