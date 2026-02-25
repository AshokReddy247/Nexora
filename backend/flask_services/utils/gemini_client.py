"""
Gemini 2.5 Flash streaming client.
Handles token-by-token streaming and emits via SocketIO.
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv('GEMINI_API_KEY', ''))

# Gemini 2.5 Flash — fast character-by-character streaming
GEMINI_MODEL = 'gemini-2.0-flash'

GENERATION_CONFIG = {
    'temperature': 0.85,
    'top_p': 0.95,
    'top_k': 40,
    'max_output_tokens': 2048,
}


def build_model(system_prompt: str):
    """Create a Gemini model instance with an injected system prompt."""
    return genai.GenerativeModel(
        model_name=GEMINI_MODEL,
        generation_config=GENERATION_CONFIG,
        system_instruction=system_prompt,
    )


def stream_response(
    model,
    conversation_history: list,
    user_message: str,
    rag_context: str,
    emit_fn,
    room: str,
):
    """
    Stream Gemini response token-by-token via SocketIO.

    Args:
        model: Gemini model instance (with system prompt)
        conversation_history: list of {role, parts} dicts (Gemini format)
        user_message: the current user input
        rag_context: retrieved context from Pinecone (prepended to prompt)
        emit_fn: SocketIO emit function
        room: SocketIO room (session_id)
    """
    # Build the augmented prompt
    augmented_message = user_message
    if rag_context:
        augmented_message = (
            f"[Retrieved Context from Memory]\n{rag_context}\n\n"
            f"[User Question]\n{user_message}"
        )

    # Build chat history in Gemini's expected format
    history = []
    for msg in conversation_history[-20:]:  # Keep last 20 messages for context
        history.append({
            'role': msg.get('role', 'user'),
            'parts': [msg.get('content', '')]
        })

    try:
        chat = model.start_chat(history=history)
        full_response = ''

        response_stream = chat.send_message(augmented_message, stream=True)

        for chunk in response_stream:
            if chunk.text:
                token = chunk.text
                full_response += token
                emit_fn('stream_token', {'token': token}, room=room)

        # Send the final complete response
        emit_fn('stream_end', {
            'full_response': full_response,
            'sources': [],
        }, room=room)

        return full_response

    except Exception as e:
        error_msg = f'Streaming error: {str(e)}'
        emit_fn('stream_error', {'error': error_msg}, room=room)
        return ''
