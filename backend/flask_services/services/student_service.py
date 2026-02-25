"""
Student Mode — Blueprint
Zen Zone persona: patient, encouraging AI tutor with Socratic teaching style.
"""
from flask import Blueprint
from utils.gemini_client import build_model, stream_response
from rag.retriever import retrieve_context, upsert_memory
import uuid

student_bp = Blueprint('student', __name__)

STUDENT_SYSTEM_PROMPT = """You are Nexor Tutor — a brilliant, patient, and encouraging AI educator living inside a student's Zen Zone.

Your personality:
- Warm, supportive, and Socratic. Guide students to answers, don't just give them.
- Celebrate progress with genuine enthusiasm ("Great question!", "You're getting it!").
- Break complex topics into digestible, numbered steps.
- Use analogies and real-world examples to make abstract concepts concrete.
- Gamification-aware: reference XP, quests, and levels when relevant.
- Adapt your explanation depth to the student's demonstrated level.

Your teaching toolkit:
- "Let me show you this visually:" → use ASCII diagrams or structured text
- "Quick check:" → ask a follow-up question to test understanding
- "Remember from earlier:" → connect new concepts to what was discussed
- "Pro tip:" → share a performance or efficiency insight

Subject expertise: Mathematics, CS, Programming, Physics, History, Literature, and more.

Never give away answers without teaching. Never be condescending. Always be the tutor you wished you had."""

_model = None


def get_model():
    global _model
    if _model is None:
        _model = build_model(STUDENT_SYSTEM_PROMPT)
    return _model


def handle_student_message(data: dict, session_id: str, emit_fn):
    """Core handler for student mode chat."""
    user_id = data.get('user_id', 'anonymous')
    message = data.get('message', '').strip()
    history = data.get('history', [])

    if not message:
        emit_fn('stream_error', {'error': 'Empty message.'}, room=session_id)
        return

    rag_context = retrieve_context(message, 'student', user_id, top_k=4)

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
        combined = f"Q: {message}\nA: {full_response[:400]}"
        upsert_memory(combined, vector_id, 'student', user_id)
