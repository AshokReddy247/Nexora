"""
Django Proxy Views — forwards non-streaming requests to Flask services.
Flask stays on an internal port; clients interact only with Django.
"""
import os
import requests
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

FLASK_INTERNAL_URL = os.getenv('FLASK_SERVICE_URL', 'http://localhost:5000')


def _proxy_to_flask(path: str, request) -> HttpResponse:
    """Forward a Django request to Flask and return the response."""
    url = f'{FLASK_INTERNAL_URL}/{path.lstrip("/")}'
    try:
        resp = requests.request(
            method=request.method,
            url=url,
            data=request.body,
            headers={
                'Content-Type': request.content_type or 'application/json',
            },
            timeout=30,
            stream=True,
        )
        return HttpResponse(
            content=resp.content,
            status=resp.status_code,
            content_type=resp.headers.get('Content-Type', 'application/json'),
        )
    except requests.exceptions.ConnectionError:
        return JsonResponse(
            {'error': 'AI service unavailable. Please try again shortly.'},
            status=503,
        )
    except requests.exceptions.Timeout:
        return JsonResponse({'error': 'AI service timed out.'}, status=504)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def proxy_export_pdf(request):
    """POST /api/proxy/export/pdf/ — proxy PDF export to Flask."""
    return _proxy_to_flask('/export/pdf', request)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def proxy_export_github(request):
    """POST /api/proxy/export/github/ — proxy GitHub export to Flask."""
    return _proxy_to_flask('/export/github', request)


@api_view(['GET'])
def proxy_health(request):
    """GET /api/proxy/health/ — check Flask service health."""
    return _proxy_to_flask('/health', request)
