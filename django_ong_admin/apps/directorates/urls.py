from django.urls import path

from . import views

urlpatterns = [
    path("", views.directorate_list, name="directorate_list"),
    path("<slug:slug>/", views.directorate_detail, name="directorate_detail"),
]

