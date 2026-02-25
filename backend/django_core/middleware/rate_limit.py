"""
Per-mode rate limiting middleware for Django.
Uses an in-memory store (swap for Redis in production).
"""
import time
import threading
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

# Per-mode requests per minute limits
MODE_RATE_LIMITS = {
    'developer': 20,
    'enquiry':   15,
    'student':   30,
    'everyday':  40,
    'system':    10,
}
DEFAULT_LIMIT = 20

_store: dict = {}
_lock = threading.Lock()


def check_rate_limit(user_id: str, mode: str) -> tuple[bool, int]:
    key = f'{user_id}:{mode}'
    limit = MODE_RATE_LIMITS.get(mode, DEFAULT_LIMIT)
    now = time.time()
    window = 60

    with _lock:
        timestamps = _store.get(key, [])
        timestamps = [t for t in timestamps if now - t < window]
        if len(timestamps) >= limit:
            retry_after = int(window - (now - timestamps[0])) + 1
            _store[key] = timestamps
            return False, retry_after
        timestamps.append(now)
        _store[key] = timestamps
        return True, 0


class ModeRateLimitMiddleware(MiddlewareMixin):
    """
    Rate-limits requests to /api/auth/memory/ endpoints based on mode
    (extracted from the URL path or request body).
    Only applies to authenticated users.
    """
    def process_request(self, request):
        if not request.path.startswith('/api/'):
            return None

        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return None

        # Extract mode from URL: /api/auth/memory/<mode>/
        path_parts = request.path.strip('/').split('/')
        mode = None
        if 'memory' in path_parts:
            idx = path_parts.index('memory')
            if idx + 1 < len(path_parts):
                mode = path_parts[idx + 1]

        if not mode or mode not in MODE_RATE_LIMITS:
            return None

        allowed, retry_after = check_rate_limit(str(user.id), mode)
        if not allowed:
            return JsonResponse(
                {
                    'error': f'Rate limit exceeded for {mode} mode.',
                    'retry_after': retry_after,
                },
                status=429,
                headers={'Retry-After': str(retry_after)},
            )
        return None
