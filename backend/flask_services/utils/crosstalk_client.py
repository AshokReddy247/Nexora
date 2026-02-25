"""
Cross-Talk Sandboxed Client — Phase 5
Allows Developer AI to call Enquiry/System AI for focused lookups.
Data isolation: ONLY the literal query string is passed — no user session,
no Pinecone namespace, no conversation history is shared between agents.
"""
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv('GEMINI_API_KEY', ''))

# Enquiry agent system prompt (minimal, focused)
ENQUIRY_LOOKUP_PROMPT = """You are a focused research assistant. Answer the following technical/market lookup request in 3-5 concise bullet points. Be specific, cite approximate dates/versions. No fluff."""

SYSTEM_CHECK_PROMPT = """You are a technical fact-checker. Answer the version/compatibility check in 2-3 bullet points. Be definitive."""

AGENT_PROMPTS = {
    'enquiry': ENQUIRY_LOOKUP_PROMPT,
    'system': SYSTEM_CHECK_PROMPT,
}

GENERATION_CONFIG = {
    'temperature': 0.3,
    'top_p': 0.9,
    'max_output_tokens': 512,
}


def cross_talk_query(
    query: str,
    target_agent: str,
    emit_fn,
    room: str,
    calling_agent: str = 'developer',
) -> str:
    """
    Execute a sandboxed cross-agent query.

    Args:
        query: The literal lookup question (only data crossing agent boundary)
        target_agent: 'enquiry' or 'system'
        emit_fn: SocketIO emit function
        room: SocketIO room (session_id)
        calling_agent: which agent initiated the request (for attribution)

    Returns: full response text
    """
    if target_agent not in AGENT_PROMPTS:
        return ''

    try:
        model = genai.GenerativeModel(
            model_name='gemini-2.0-flash',
            generation_config=GENERATION_CONFIG,
            system_instruction=AGENT_PROMPTS[target_agent],
        )

        # Notify frontend that cross-talk is starting
        emit_fn('crosstalk_start', {
            'from_agent': calling_agent,
            'to_agent': target_agent,
            'query': query[:80],
        }, room=room)

        full_response = ''
        response_stream = model.generate_content(
            f'[LOOKUP REQUEST from {calling_agent.upper()} agent]\n{query}',
            stream=True,
        )

        for chunk in response_stream:
            if chunk.text:
                full_response += chunk.text
                emit_fn('crosstalk_token', {'token': chunk.text}, room=room)

        emit_fn('crosstalk_end', {
            'from_agent': calling_agent,
            'to_agent': target_agent,
            'full_response': full_response,
            'query': query[:80],
        }, room=room)

        return full_response

    except Exception as e:
        emit_fn('crosstalk_error', {'error': str(e)}, room=room)
        return ''


def parse_crosstalk_triggers(message: str) -> list[dict]:
    """
    Detect [LOOKUP: ...] and [CHECK: ...] patterns in AI response text.
    Returns list of {type, query, target_agent} dicts.
    """
    import re
    triggers = []

    lookup_matches = re.findall(r'\[LOOKUP:\s*([^\]]+)\]', message)
    for q in lookup_matches:
        triggers.append({'type': 'LOOKUP', 'query': q.strip(), 'target_agent': 'enquiry'})

    check_matches = re.findall(r'\[CHECK:\s*([^\]]+)\]', message)
    for q in check_matches:
        triggers.append({'type': 'CHECK', 'query': q.strip(), 'target_agent': 'system'})

    return triggers
