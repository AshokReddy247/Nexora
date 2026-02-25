from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
import uuid

from .models import NexorUser, UserMemory
from .serializers import (
    NexorTokenObtainPairSerializer,
    RegisterSerializer,
    UserProfileSerializer,
    UserMemorySerializer,
)


class NexorTokenObtainPairView(TokenObtainPairView):
    """JWT login — returns access + refresh tokens with embedded user info."""
    serializer_class = NexorTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    """POST /api/auth/register/ — Create a new Nexor user."""
    queryset = NexorUser.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'message': 'Account created successfully. Welcome to Nexor AI!',
                'username': user.username,
                'preferred_mode': user.preferred_mode,
            },
            status=status.HTTP_201_CREATED,
        )


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """GET/PATCH /api/auth/profile/ — get or update the logged-in user's profile."""
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    elif request.method == 'PATCH':
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def memory_view(request, mode):
    """
    GET    /api/auth/memory/<mode>/  — retrieve memory for this mode
    POST   /api/auth/memory/<mode>/  — save/append messages
    DELETE /api/auth/memory/<mode>/  — clear all memory for this mode
    """
    if mode not in ['developer', 'student', 'enquiry', 'everyday', 'system']:
        return Response({'error': 'Invalid mode.'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'GET':
        session_id = request.query_params.get('session_id', '')
        memories = UserMemory.objects.filter(user=request.user, mode=mode)
        if session_id:
            memories = memories.filter(session_id=session_id)
        serializer = UserMemorySerializer(memories, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        session_id = request.data.get('session_id') or str(uuid.uuid4())
        role = request.data.get('role', 'user')
        content = request.data.get('content', '')
        pinecone_id = request.data.get('pinecone_id', '')

        if not content:
            return Response({'error': 'content is required.'}, status=status.HTTP_400_BAD_REQUEST)

        memory, _ = UserMemory.objects.get_or_create(
            user=request.user,
            mode=mode,
            session_id=session_id,
        )
        memory.append_message(role, content)
        if pinecone_id:
            memory.pinecone_ids.append(pinecone_id)
            memory.save()

        return Response(
            {'session_id': session_id, 'message_count': len(memory.messages)},
            status=status.HTTP_200_OK,
        )

    elif request.method == 'DELETE':
        deleted_count, _ = UserMemory.objects.filter(
            user=request.user, mode=mode
        ).delete()
        return Response(
            {'message': f'Cleared {deleted_count} memory session(s) for {mode} mode.'},
            status=status.HTTP_200_OK,
        )
