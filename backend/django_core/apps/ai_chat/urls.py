from django.urls import path
from . import views

urlpatterns = [
    path('export/pdf', views.export_pdf_view, name='export_pdf'),
    path('export/github', views.export_github_view, name='export_github'),
]
