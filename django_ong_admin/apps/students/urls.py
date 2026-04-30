from django.urls import path

from . import views

urlpatterns = [
    path("", views.StudentListView.as_view(), name="student_list"),
    path("novo/", views.StudentCreateView.as_view(), name="student_create"),
    path("<int:pk>/", views.StudentDetailView.as_view(), name="student_detail"),
    path("<int:pk>/editar/", views.StudentUpdateView.as_view(), name="student_update"),
]

