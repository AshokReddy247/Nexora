from django.urls import path
from .views import proxy_export_pdf, proxy_export_github, proxy_health

urlpatterns = [
    path('export/pdf/', proxy_export_pdf, name='proxy-export-pdf'),
    path('export/github/', proxy_export_github, name='proxy-export-github'),
    path('health/', proxy_health, name='proxy-health'),
]
