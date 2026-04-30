from django.urls import path

from . import views

urlpatterns = [
    path("", views.CourseListView.as_view(), name="course_list"),
    path("novo/", views.CourseCreateView.as_view(), name="course_create"),
    path("<int:pk>/", views.CourseDetailView.as_view(), name="course_detail"),
    path("<int:pk>/editar/", views.CourseUpdateView.as_view(), name="course_update"),
]

