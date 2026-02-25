from django.contrib import admin
from .models import NexorUser, UserMemory


@admin.register(NexorUser)
class NexorUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'preferred_mode', 'created_at', 'is_active')
    list_filter = ('preferred_mode', 'is_active')
    search_fields = ('username', 'email')


@admin.register(UserMemory)
class UserMemoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'mode', 'session_id', 'updated_at')
    list_filter = ('mode',)
    search_fields = ('user__username', 'session_id')
    readonly_fields = ('created_at', 'updated_at')
