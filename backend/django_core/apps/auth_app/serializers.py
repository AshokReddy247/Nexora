from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import NexorUser, UserMemory


class NexorTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extends JWT payload with user info so the frontend doesn't need extra calls."""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['preferred_mode'] = user.preferred_mode
        token['avatar_url'] = user.avatar_url
        return token


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = NexorUser
        fields = ('username', 'email', 'password', 'password2', 'preferred_mode')
        extra_kwargs = {
            'email': {'required': True},
            'preferred_mode': {'required': False},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = NexorUser.objects.create_user(**validated_data)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = NexorUser
        fields = ('id', 'username', 'email', 'preferred_mode', 'avatar_url', 'created_at')
        read_only_fields = ('id', 'username', 'email', 'created_at')


class UserMemorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserMemory
        fields = ('id', 'mode', 'session_id', 'messages', 'pinecone_ids', 'updated_at')
        read_only_fields = ('id', 'updated_at')
