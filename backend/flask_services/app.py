"""
Flask Application Factory — Phase 5 Update
Nexor AI — Mode-Isolated Microservices
Adds: Agent Cross-Talk, Session Export (PDF + GitHub), and Rate Limiting
Port: 5000
"""
import os
import time
import threading

from flask import Flask, jsonify, request, send_file
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from dotenv import load_dotenv
import io

from services.developer_service import handle_developer_message
from services.student_service import handle_student_message
from services.enquiry_service import handle_enquiry_message
from services.everyday_service import handle_everyday_message
from services.system_service import handle_system_message

from utils.crosstalk_client import cross_talk_query, parse_crosstalk_triggers
from utils.exporter import generate_pdf, commit_to_github

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'nexor-flask-dev-key')

CORS(app, resources={r'/*': {'origins': os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000')}})

socketio = SocketIO(
    app,
    cors_allowed_origins='*',
    async_mode='threading',  # Using threading for Python 3.12+ compatibility
    logger=True,            # Added logging to help debug
    engineio_logger=True,
)

# ── Mode handler routing ──────────────────────────────────────────────────────
MODE_HANDLERS = {
    'developer': handle_developer_message,
    'student': handle_student_message,
    'enquiry': handle_enquiry_message,
    'everyday': handle_everyday_message,
    'system': handle_system_message,
}

# ── Per-mode rate limits (requests per minute) ────────────────────────────────
MODE_RATE_LIMITS = {
    'developer': 20,
    'enquiry':   15,
    'student':   30,
    'everyday':  40,
    'system':    10,
}

# In-memory rate limit tracker: {user_id+mode: [timestamps]}
_rate_limit_store: dict[str, list] = {}
_rate_lock = threading.Lock()


def check_rate_limit(user_id: str, mode: str) -> tuple[bool, int]:
    """
    Returns (allowed: bool, retry_after_seconds: int).
    Uses a sliding window of 60 seconds.
    """
    key = f'{user_id}:{mode}'
    limit = MODE_RATE_LIMITS.get(mode, 20)
    now = time.time()
    window = 60  # seconds

    with _rate_lock:
        timestamps = _rate_limit_store.get(key, [])
        # Remove entries older than the window
        timestamps = [t for t in timestamps if now - t < window]
        if len(timestamps) >= limit:
            oldest = timestamps[0]
            retry_after = int(window - (now - oldest)) + 1
            _rate_limit_store[key] = timestamps
            return False, retry_after
        timestamps.append(now)
        _rate_limit_store[key] = timestamps
        return True, 0


# ── HTTP Health Endpoint ──────────────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'nexor-flask',
        'modes': list(MODE_HANDLERS.keys()),
        'phase': '5',
    })


# ── Export: PDF ───────────────────────────────────────────────────────────────
@app.route('/export/pdf', methods=['POST'])
def export_pdf():
    data = request.get_json(force=True)
    try:
        pdf_bytes = generate_pdf(data)
        buf = io.BytesIO(pdf_bytes)
        mode = data.get('mode', 'session')
        return send_file(
            buf,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'nexor-{mode}-export.pdf',
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── Export: GitHub ────────────────────────────────────────────────────────────
@app.route('/export/github', methods=['POST'])
def export_github():
    data = request.get_json(force=True)
    github_pat = data.get('githubPat', '')
    repo_name = data.get('githubRepo', '')
    if not github_pat or not repo_name:
        return jsonify({'error': 'githubPat and githubRepo are required'}), 400
    result = commit_to_github(data, github_pat, repo_name)
    if 'error' in result:
        return jsonify(result), 500
    return jsonify(result)


# ── SocketIO Events ───────────────────────────────────────────────────────────
@socketio.on('connect')
def on_connect():
    print('[WS] Client connected')


@socketio.on('disconnect')
def on_disconnect():
    print('[WS] Client disconnected')


@socketio.on('join_session')
def on_join(data):
    session_id = data.get('session_id', 'default')
    join_room(session_id)
    emit('session_ready', {'session_id': session_id, 'status': 'joined'})


@socketio.on('leave_session')
def on_leave(data):
    session_id = data.get('session_id', 'default')
    leave_room(session_id)


@socketio.on('chat_message')
def on_chat_message(data):
    """
    Main event handler: rate-check → route to mode service.
    Payload: { mode, message, session_id, user_id, history, zero_retention }
    """
    mode = data.get('mode', 'system')
    session_id = data.get('session_id', 'default')
    user_id = data.get('user_id', 'anonymous')

    if mode not in MODE_HANDLERS:
        emit('stream_error', {'error': f'Unknown mode: {mode}'}, room=session_id)
        return

    # Rate limiting
    allowed, retry_after = check_rate_limit(user_id, mode)
    if not allowed:
        emit('stream_error', {
            'error': f'Rate limit reached for {mode} mode. Try again in {retry_after}s.',
            'retry_after': retry_after,
            'rate_limited': True,
        }, room=session_id)
        return

    emit('stream_start', {'mode': mode}, room=session_id)
    MODE_HANDLERS[mode](data, session_id, socketio.emit)


@socketio.on('agent_crosstalk')
def on_crosstalk(data):
    """
    Initiates a sandboxed cross-agent call.
    Payload: { from_agent, to_agent, query, session_id }
    Only the `query` string crosses agent boundaries.
    """
    from_agent = data.get('from_agent', 'developer')
    to_agent = data.get('to_agent', 'enquiry')
    query = data.get('query', '')
    session_id = data.get('session_id', 'default')

    if not query:
        emit('crosstalk_error', {'error': 'Query is required.'}, room=session_id)
        return

    # Run in background thread so it doesn't block the main loop
    # threading.Thread works fine here in threading async mode
    t = threading.Thread(target=cross_talk_query, kwargs={
        'query': query,
        'target_agent': to_agent,
        'emit_fn': socketio.emit,
        'room': session_id,
        'calling_agent': from_agent,
    })
    t.daemon = True
    t.start()


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f'🚀 Nexor Flask Services (Phase 5) running on http://localhost:{port}')
    socketio.run(app, host='0.0.0.0', port=port, debug=os.getenv('DEBUG', 'True') == 'True')
