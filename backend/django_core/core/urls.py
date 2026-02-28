from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.auth_app.urls')),
    path('api/proxy/', include('apps.proxy.urls')),
    path('api/chat/', include('apps.ai_chat.urls')),
]
