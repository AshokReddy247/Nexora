from django.contrib.auth.models import AbstractUser
from django.db import models


MODES = ['developer', 'student', 'enquiry', 'everyday', 'system']
MODE_CHOICES = [(m, m.capitalize()) for m in MODES]


class NexorUser(AbstractUser):
    """Extended user model with mode preference and Nexor-specific fields."""
    preferred_mode = models.CharField(
        max_length=20,
        choices=MODE_CHOICES,
        default='system'
    )
    avatar_url = models.URLField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Nexor User'
        verbose_name_plural = 'Nexor Users'

    def __str__(self):
        return self.username


class UserMemory(models.Model):
    """Stores per-mode conversation memory for RAG context retrieval."""
    user = models.ForeignKey(
        NexorUser,
        on_delete=models.CASCADE,
        related_name='memories'
    )
    mode = models.CharField(max_length=20, choices=MODE_CHOICES)
    session_id = models.CharField(max_length=64, db_index=True)
    # Stores the conversation as a JSON array of {role, content} dicts
    messages = models.JSONField(default=list)
    # Stores Pinecone vector IDs for this session's memories
    pinecone_ids = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'mode', 'session_id')
        ordering = ['-updated_at']
        verbose_name = 'User Memory'
        verbose_name_plural = 'User Memories'

    def __str__(self):
        return f'{self.user.username} | {self.mode} | {self.session_id}'

    def append_message(self, role: str, content: str):
        """Add a message and keep conversation window to last 20 exchanges."""
        self.messages.append({'role': role, 'content': content})
        if len(self.messages) > 40:  # 20 exchanges = 40 messages
            self.messages = self.messages[-40:]
        self.save()
