'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Mode } from '@/store/modeStore';
import { toast } from '@/store/toastStore';
import { TokenStorage } from '@/lib/authClient';

const FLASK_URL = process.env.NEXT_PUBLIC_FLASK_URL || 'http://localhost:5000';

interface UseSocketOptions {
    sessionId: string;
    onToken: (token: string) => void;
    onEnd: (fullResponse: string) => void;
    onError: (error: string) => void;
    onStart?: () => void;
    // Phase 4 — RAG trace for BrainView
    onRagTrace?: (data: unknown) => void;
    // Phase 5 — Cross-Talk events
    onCrosstalkStart?: (data: unknown) => void;
    onCrosstalkToken?: (data: unknown) => void;
    onCrosstalkEnd?: (data: unknown) => void;
}

export function useSocket(options: UseSocketOptions) {
    const {
        sessionId,
        onToken,
        onEnd,
        onError,
        onStart,
        onRagTrace,
        onCrosstalkStart,
        onCrosstalkToken,
        onCrosstalkEnd,
    } = options;

    const socketRef = useRef<Socket | null>(null);
    const isConnected = useRef(false);

    useEffect(() => {
        const socket = io(FLASK_URL, {
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            isConnected.current = true;
            socket.emit('join_session', { session_id: sessionId });
        });

        socket.on('disconnect', () => {
            isConnected.current = false;
        });

        socket.on('connect_error', () => {
            toast.error('Connection Error', 'Could not reach AI service. Is Flask running?');
        });

        socket.on('session_ready', () => {
            // Session joined — ready to send
        });

        socket.on('stream_start', () => {
            onStart?.();
        });

        socket.on('stream_token', (data: { token: string }) => {
            onToken(data.token);
        });

        socket.on('stream_end', (data: { full_response: string }) => {
            onEnd(data.full_response);
        });

        socket.on('stream_error', (data: { error: string; rate_limited?: boolean; retry_after?: number }) => {
            onError(data.error);
            if (data.rate_limited) {
                toast.warning(
                    'Rate limit reached',
                    `Too many requests. Retry in ${data.retry_after ?? 60}s.`
                );
            } else {
                toast.error('AI Error', data.error);
            }
        });

        // Phase 4 — Brain View RAG trace
        socket.on('rag_trace', (data: unknown) => {
            onRagTrace?.(data);
        });

        // Phase 5 — Cross-Talk events
        socket.on('crosstalk_start', (data: unknown) => {
            onCrosstalkStart?.(data);
        });

        socket.on('crosstalk_token', (data: unknown) => {
            onCrosstalkToken?.(data);
        });

        socket.on('crosstalk_end', (data: unknown) => {
            onCrosstalkEnd?.(data);
        });

        socket.on('crosstalk_error', (data: { error: string }) => {
            toast.error('Cross-Talk Error', data.error);
        });

        return () => {
            socket.emit('leave_session', { session_id: sessionId });
            socket.disconnect();
            isConnected.current = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    const sendMessage = useCallback(
        (
            mode: Mode,
            message: string,
            history: Array<{ role: string; content: string }>,
            zeroRetention = false,
        ) => {
            const socket = socketRef.current;
            if (!socket?.connected) {
                onError('Not connected to AI service.');
                toast.error('Not connected', 'Check that Flask is running on port 5000.');
                return;
            }
            const user = TokenStorage.getUser();
            socket.emit('chat_message', {
                mode,
                message,
                session_id: sessionId,
                user_id: user?.username || 'anonymous',
                history,
                zero_retention: zeroRetention,
            });
        },
        [sessionId, onError]
    );

    return { sendMessage };
}
