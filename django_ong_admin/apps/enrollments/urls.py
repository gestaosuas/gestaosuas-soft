from django.urls import path

from . import views

urlpatterns = [
    path("", views.EnrollmentListView.as_view(), name="enrollment_list"),
    path("novo/", views.EnrollmentCreateView.as_view(), name="enrollment_create"),
]

