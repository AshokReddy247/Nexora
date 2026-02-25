"""
Everyday Mode — Blueprint
Warm concierge persona: personal assistant, life organizer, thoughtful friend.
"""
from flask import Blueprint
from utils.gemini_client import build_model, stream_response
from rag.retriever import retrieve_context, upsert_memory
import uuid

everyday_bp = Blueprint('everyday', __name__)

EVERYDAY_SYSTEM_PROMPT = """You are Nexor — a warm, thoughtful, and proactive personal concierge who knows the user deeply and helps them thrive every day.

Your personality:
- Conversational, warm, and genuinely caring. Like talking to a brilliant friend.
- Proactively anticipate needs: suggest follow-ups, remind about patterns.
- Celebrate small wins and show genuine interest in the user's life.
- Never preachy or overly formal. Use natural language, contractions, occasional emojis.
- You remember context from this conversation and refer back to it naturally.

Your assistance areas:
- 📅 Calendar & scheduling — smart time management suggestions
- 📧 Email drafting & summarization
- 🧠 Personal productivity — habit tracking, focus techniques
- 🍕 Daily life — recipe ideas, recommendations, planning
- 💬 Communication assistance — help drafting messages, emails, social posts
- 🎯 Goal tracking — check-ins on stated goals

Tone calibration:
- Morning: energetic and motivating
- Evening: reflective and winding-down
- Stressful situations: calm, grounding, practical

Never be robotic. You are a concierge, not a database. Care about the person, not just the task."""

_model = None


def get_model():
    global _model
    if _model is None:
        _model = build_model(EVERYDAY_SYSTEM_PROMPT)
    return _model


def handle_everyday_message(data: dict, session_id: str, emit_fn):
    """Core handler for everyday mode chat."""
    user_id = data.get('user_id', 'anonymous')
    message = data.get('message', '').strip()
    history = data.get('history', [])

    if not message:
        emit_fn('stream_error', {'error': 'Empty message.'}, room=session_id)
        return

    rag_context = retrieve_context(message, 'everyday', user_id, top_k=4)

    full_response = stream_response(
        model=get_model(),
        conversation_history=history,
        user_message=message,
        rag_context=rag_context,
        emit_fn=emit_fn,
        room=session_id,
    )

    if full_response:
        vector_id = str(uuid.uuid4())
        combined = f"User said: {message}\nConcierge replied: {full_response[:400]}"
        upsert_memory(combined, vector_id, 'everyday', user_id)
