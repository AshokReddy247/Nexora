import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .services.developer_service import handle_developer_message
from .services.student_service import handle_student_message
from .services.enquiry_service import handle_enquiry_message
from .services.everyday_service import handle_everyday_message
from .services.system_service import handle_system_message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.room_group_name = f'chat_{self.session_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        
        # Send ready signal similar to SocketIO's session_ready
        await self.send(text_data=json.dumps({
            'event': 'session_ready',
            'data': {'session_id': self.session_id, 'status': 'joined'}
        }))

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            event = data.get('event')
            payload = data.get('data', {})

            if event == 'chat_message':
                await self.handle_chat_message(payload)
                
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON format")

    async def handle_chat_message(self, data):
        mode = data.get('mode', 'system')
        session_id = data.get('session_id', self.session_id)
        
        mode_handlers = {
            'developer': handle_developer_message,
            'student': handle_student_message,
            'enquiry': handle_enquiry_message,
            'everyday': handle_everyday_message,
            'system': handle_system_message,
        }

        if mode not in mode_handlers:
            await self.send_error(f"Unknown mode: {mode}")
            return

        await self.send_event('stream_start', {'mode': mode})

        # Define an emit function that sync code can call
        # We need asgiref.sync.async_to_sync if calling from sync thread
        from asgiref.sync import async_to_sync
        
        def emit_fn(event_name, event_data, room=None):
            # If room is provided, broadcast to group, else send to self
            if room:
                async_to_sync(self.channel_layer.group_send)(
                    f'chat_{room}',
                    {
                        'type': 'chat_message_broadcast',
                        'event': event_name,
                        'data': event_data
                    }
                )
            else:
                async_to_sync(self.send)(text_data=json.dumps({
                    'event': event_name,
                    'data': event_data
                }))

        try:
            # We run the synchronous handler in an executor to avoid blocking the async event loop
            import asyncio
            loop = asyncio.get_event_loop()
            handler = mode_handlers[mode]
            await loop.run_in_executor(None, handler, data, session_id, emit_fn)
        except Exception as e:
            await self.send_error(f"Internal Server Error: {str(e)}")

    # Receive message from room group
    async def chat_message_broadcast(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'event': event['event'],
            'data': event['data']
        }))
        
    async def send_error(self, message):
        await self.send_event('stream_error', {'error': message})
        
    async def send_event(self, event_name, data):
        await self.send(text_data=json.dumps({
            'event': event_name,
            'data': data
        }))
