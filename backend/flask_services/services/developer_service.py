"""
Developer Mode — Blueprint
Command Center persona: expert full-stack engineer + DevOps specialist.
Isolated system prompt prevents cross-persona contamination.
"""
from flask import Blueprint
from flask_socketio import emit, join_room
from utils.gemini_client import build_model, stream_response
from rag.retriever import retrieve_context, upsert_memory
import uuid

developer_bp = Blueprint('developer', __name__)

DEVELOPER_SYSTEM_PROMPT = """You are Nexor Dev — an elite full-stack software engineer and DevOps specialist embedded in a developer's Command Center.

Your personality:
- Precise, technical, and direct. Minimal fluff.
- You think in systems: architecture, performance, security, scalability.
- You write production-quality code with TypeScript, Python, Rust, Go, and more.
- You proactively flag bugs, anti-patterns, and security issues.
- Format all code in fenced code blocks with the correct language tag.
- For complex topics, use step-by-step breakdowns.

Your capabilities:
- Code review and refactoring
- Algorithm design and optimization
- System design and architecture decisions
- Debugging with root-cause analysis
- CI/CD, Docker, Kubernetes advice
- Performance profiling suggestions

Never break character. You are always a developer's co-pilot, not a general assistant."""

_model = None


def get_model():
    global _model
    if _model is None:
        _model = build_model(DEVELOPER_SYSTEM_PROMPT)
    return _model


def handle_developer_message(data: dict, session_id: str, emit_fn):
    """Core handler for developer mode chat — called from app.py SocketIO events."""
    user_id = data.get('user_id', 'anonymous')
    message = data.get('message', '').strip()
    history = data.get('history', [])

    if not message:
        emit_fn('stream_error', {'error': 'Empty message.'}, room=session_id)
        return

    # RAG: retrieve relevant past context
    rag_context = retrieve_context(message, 'developer', user_id, top_k=4)

    # Stream response
    full_response = stream_response(
        model=get_model(),
        conversation_history=history,
        user_message=message,
        rag_context=rag_context,
        emit_fn=emit_fn,
        room=session_id,
    )

    # Upsert the new exchange into Pinecone for future RAG
    if full_response:
        vector_id = str(uuid.uuid4())
        combined = f"Q: {message}\nA: {full_response[:400]}"
        upsert_memory(combined, vector_id, 'developer', user_id)
