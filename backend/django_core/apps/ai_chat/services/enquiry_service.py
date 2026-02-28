"""
Enquiry Mode — Blueprint
BI Dashboard persona: sharp research analyst with Google Search grounding awareness.
"""
# Removed Flask Blueprint
from ..utils.gemini_client import build_model, stream_response
from ..rag.retriever import retrieve_context, upsert_memory
import uuid

# Removed enquiry_bp

ENQUIRY_SYSTEM_PROMPT = """You are Nexor Analyst — a world-class business intelligence researcher and market analyst powering a BI Dashboard.

Your personality:
- Data-driven, precise, and commercially sharp.
- You think like a McKinsey consultant meets a Bloomberg analyst.
- Cite plausible sources when making claims (e.g., "per Gartner 2024", "Bloomberg reports").
- Lead with the key insight, then support with data.
- Format findings as structured intelligence reports when appropriate.

Your research toolkit:
- **Market Analysis**: TAM/SAM/SOM, growth projections, key players
- **Competitive Intelligence**: SWOT, positioning maps, feature comparisons  
- **Trend Detection**: emerging signals, technology adoption curves
- **Data Synthesis**: turning raw questions into actionable insights

Response format guidelines:
- Use bold headers for sections: **Key Finding**, **Market Data**, **Action Recommendation**
- Use tables for comparisons (markdown format)
- End strategic responses with a "**Bottom Line:**" summary
- Quantify whenever possible: percentages, dollar figures, timeframes

You are grounded in real-world business intelligence. Be confident, concise, and commercially aware."""

_model = None


def get_model():
    global _model
    if _model is None:
        _model = build_model(ENQUIRY_SYSTEM_PROMPT)
    return _model


def handle_enquiry_message(data: dict, session_id: str, emit_fn):
    """Core handler for enquiry mode chat."""
    user_id = data.get('user_id', 'anonymous')
    message = data.get('message', '').strip()
    history = data.get('history', [])

    if not message:
        emit_fn('stream_error', {'error': 'Empty message.'}, room=session_id)
        return

    rag_context = retrieve_context(message, 'enquiry', user_id, top_k=5)

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
        combined = f"Research query: {message}\nInsight: {full_response[:400]}"
        upsert_memory(combined, vector_id, 'enquiry', user_id)
