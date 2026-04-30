from django.urls import path

from . import views

urlpatterns = [
    path("", views.CourseInterestListView.as_view(), name="interest_list"),
    path("novo/", views.CourseInterestCreateView.as_view(), name="interest_create"),
]

