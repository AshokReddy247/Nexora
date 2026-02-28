"""
Pinecone RAG pipeline: embed → query → retrieve context.
Uses sentence-transformers all-MiniLM-L6-v2 for embeddings (384-dim).
Emits rag_trace SocketIO event with real-time node graph data.
"""
import os
import time
import math
import random
from dotenv import load_dotenv

load_dotenv()

_embedder = None
_pinecone_index = None


def _get_embedder():
    global _embedder
    if _embedder is None:
        print("[RAG] Loading SentenceTransformer model...")
        from sentence_transformers import SentenceTransformer
        _embedder = SentenceTransformer('all-MiniLM-L6-v2')
        print("[RAG] Model loaded.")
    return _embedder


def _get_index():
    global _pinecone_index
    if _pinecone_index is None:
        from pinecone import Pinecone, ServerlessSpec
        api_key = os.getenv('PINECONE_API_KEY', '')
        index_name = os.getenv('PINECONE_INDEX', 'nexor-ai')
        if not api_key:
            return None
        pc = Pinecone(api_key=api_key)
        if index_name not in pc.list_indexes().names():
            pc.create_index(
                name=index_name,
                dimension=384,
                metric='cosine',
                spec=ServerlessSpec(
                    cloud=os.getenv('PINECONE_CLOUD', 'aws'),
                    region=os.getenv('PINECONE_ENVIRONMENT', 'us-east-1'),
                )
            )
        _pinecone_index = pc.Index(index_name)
    return _pinecone_index


def _spherical_pos(index: int, total: int, radius: float = 3.0):
    """Distribute retrieved nodes on a sphere for the 3D graph."""
    phi = math.acos(1 - 2 * (index + 0.5) / max(total, 1))
    theta = math.pi * (1 + 5 ** 0.5) * index
    return [
        round(radius * math.sin(phi) * math.cos(theta), 3),
        round(radius * math.sin(phi) * math.sin(theta), 3),
        round(radius * math.cos(phi), 3),
    ]


def embed_text(text: str) -> list:
    """Generate embedding vector for a text string."""
    return _get_embedder().encode(text).tolist()


def upsert_memory(
    text: str,
    vector_id: str,
    mode: str,
    user_id: str,
    metadata: dict = None,
    zero_retention: bool = False,
) -> bool:
    """
    Upsert a text embedding into Pinecone.
    Skips silently if zero_retention is True.
    """
    if zero_retention:
        return False
    index = _get_index()
    if index is None:
        return False
    vector = embed_text(text)
    meta = {
        'text': text[:500],
        'mode': mode,
        'user_id': str(user_id),
        **(metadata or {}),
    }
    index.upsert(
        vectors=[{'id': vector_id, 'values': vector, 'metadata': meta}],
        namespace=f'{mode}_{user_id}',
    )
    return True


def retrieve_context(
    query: str,
    mode: str,
    user_id: str,
    top_k: int = 5,
    emit_fn=None,
    room: str = None,
) -> str:
    """
    Query Pinecone for similar memories.
    Emits a rag_trace SocketIO event with node-graph data for the Brain View.
    Returns context string or empty string.
    """
    index = _get_index()
    t_start = time.time()

    # --- Fallback: emit a demo trace when Pinecone is not configured ---
    if index is None:
        if emit_fn and room:
            demo_nodes = [
                {
                    'id': f'demo-{i}',
                    'text': f'Memory fragment #{i + 1}',
                    'score': round(0.95 - i * 0.1, 2),
                    'pos': _spherical_pos(i, 3),
                }
                for i in range(3)
            ]
            emit_fn('rag_trace', {
                'queryLabel': query[:60],
                'nodes': demo_nodes,
                'latencyMs': 0,
                'mode': mode,
                'timestamp': t_start,
                'demo': True,
            }, room=room)
        return ''

    try:
        query_vector = embed_text(query)
        results = index.query(
            vector=query_vector,
            top_k=top_k,
            namespace=f'{mode}_{user_id}',
            include_metadata=True,
        )
        latency_ms = round((time.time() - t_start) * 1000)
        matches = results.get('matches', [])

        context_parts = []
        trace_nodes = []

        for i, match in enumerate(matches):
            score = match.get('score', 0)
            text = match.get('metadata', {}).get('text', '')
            if score > 0.65 and text:
                context_parts.append(f'- {text}')
            trace_nodes.append({
                'id': match.get('id', f'node-{i}'),
                'text': text[:80] if text else 'Memory fragment',
                'score': round(score, 3),
                'pos': _spherical_pos(i, len(matches)),
            })

        # Emit brain view trace event
        if emit_fn and room and trace_nodes:
            emit_fn('rag_trace', {
                'queryLabel': query[:60],
                'nodes': trace_nodes,
                'latencyMs': latency_ms,
                'mode': mode,
                'timestamp': t_start,
                'demo': False,
            }, room=room)

        return '\n'.join(context_parts) if context_parts else ''

    except Exception:
        return ''
