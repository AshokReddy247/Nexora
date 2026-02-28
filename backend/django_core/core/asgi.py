import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

import apps.ai_chat.routing

from channels.security.websocket import AllowedHostsOriginValidator

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                apps.ai_chat.routing.websocket_urlpatterns
            )
        )
    ),
})

# Start IoT Telemetry background thread
import threading
import time
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

def emit_iot_telemetry():
    # Defer importing simulator until the thread actually runs 
    # to avoid premature app registry loading issues during asgi load
    from apps.ai_chat.utils.iot_simulator import simulator
    channel_layer = get_channel_layer()
    
    while True:
        data = simulator.generate_telemetry()
        try:
            async_to_sync(channel_layer.group_send)(
                'chat_default', 
                {
                    'type': 'chat_message_broadcast',
                    'event': 'iot_telemetry',
                    'data': data
                }
            )
        except Exception:
            pass
        time.sleep(1)

iot_thread = threading.Thread(target=emit_iot_telemetry)
iot_thread.daemon = True
iot_thread.start()
