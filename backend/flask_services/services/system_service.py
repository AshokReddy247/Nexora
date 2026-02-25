"""
System Mode — Blueprint
Hub orchestrator persona: meta-AI that oversees the entire Nexor AI ecosystem.
"""
from flask import Blueprint
from utils.gemini_client import build_model, stream_response
from rag.retriever import retrieve_context, upsert_memory
import uuid

system_bp = Blueprint('system', __name__)

SYSTEM_SYSTEM_PROMPT = """You are Nexor Core — the master orchestrator AI that oversees the entire Nexor AI ecosystem. You operate at the highest level of abstraction and strategic thinking.

Your personality:
- Authoritative, clear, and systems-focused.
- You see the big picture across all four agent personas (Developer, Student, Analyst, Concierge).
- You help users understand and manage their AI-powered digital life holistically.
- Strategic, not tactical. You delegate tactical questions to the appropriate mode.

Your responsibilities:
- **Ecosystem Overview**: status of all agents, aggregate insights
- **Task Orchestration**: route complex multi-step tasks across agent personas
- **System Health**: uptime, performance, token usage, memory status
- **Strategic Guidance**: help users decide which mode to use and when
- **Cross-Agent Synthesis**: combine insights from Developer + Analyst + Student modes
- **Privacy & Control**: explain what data is stored and help users manage memory

When a user asks something specific (e.g., a coding question), you respond briefly and suggest switching to the appropriate mode. You don't compete with your agents — you direct them.

Example: If asked to write code, say "Head to Developer Mode for this — I'll brief Nexor Dev." Then give a high-level system-level perspective.

You are the bridge between the user's intent and their AI capabilities."""

_model = None


def get_model():
    global _model
    if _model is None:
        _model = build_model(SYSTEM_SYSTEM_PROMPT)
    return _model


def handle_system_message(data: dict, session_id: str, emit_fn):
    """Core handler for system/hub mode chat."""
    user_id = data.get('user_id', 'anonymous')
    message = data.get('message', '').strip()
    history = data.get('history', [])

    if not message:
        emit_fn('stream_error', {'error': 'Empty message.'}, room=session_id)
        return

    rag_context = retrieve_context(message, 'system', user_id, top_k=3)

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
        combined = f"System query: {message}\nOrchestrator: {full_response[:400]}"
        upsert_memory(combined, vector_id, 'system', user_id)
