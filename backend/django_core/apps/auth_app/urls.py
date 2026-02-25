from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    NexorTokenObtainPairView,
    RegisterView,
    profile_view,
    memory_view,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', NexorTokenObtainPairView.as_view(), name='auth-login'),
    path('refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('profile/', profile_view, name='auth-profile'),
    path('memory/<str:mode>/', memory_view, name='auth-memory'),
]
