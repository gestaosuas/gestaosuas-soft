from django import forms

from .models import CourseInterest


class CourseInterestForm(forms.ModelForm):
    class Meta:
        model = CourseInterest
        fields = "__all__"

