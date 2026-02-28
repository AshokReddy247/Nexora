'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Mode } from '@/store/modeStore';
import { toast } from '@/store/toastStore';
import { TokenStorage } from '@/lib/authClient';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

interface UseSocketOptions {
    sessionId: string;
    onToken: (token: string) => void;
    onEnd: (fullResponse: string) => void;
    onError: (error: string) => void;
    onStart?: () => void;
    onRagTrace?: (data: unknown) => void;
    onCrosstalkStart?: (data: unknown) => void;
    onCrosstalkToken?: (data: unknown) => void;
    onCrosstalkEnd?: (data: unknown) => void;
    onIoTTelemetry?: (data: unknown) => void;
}

export function useSocket(options: UseSocketOptions) {
    const { sessionId } = options;
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const savedCallbacks = useRef(options);

    useEffect(() => {
        savedCallbacks.current = options;
    }, [options]);

    useEffect(() => {
        // Django Channels WS URL expects the session ID in the path
        const wsUrl = `${WS_URL}/ws/chat/${sessionId}/`;
        let socket: WebSocket;
        let reconnectTimeout: ReturnType<typeof setTimeout>;
        let attempt = 0;
        const maxAttempts = 10;
        let isComponentMounted = true;

        function connect() {
            if (!isComponentMounted) return;

            socket = new WebSocket(wsUrl);
            socketRef.current = socket;

            socket.onopen = () => {
                setIsConnected(true);
                attempt = 0;
            };

            socket.onmessage = (messageEvent) => {
                try {
                    const data = JSON.parse(messageEvent.data);
                    const event = data.event;
                    const payload = data.data;

                    switch (event) {
                        case 'session_ready':
                            break;
                        case 'stream_start':
                            savedCallbacks.current.onStart?.();
                            break;
                        case 'stream_token':
                            savedCallbacks.current.onToken(payload.token);
                            break;
                        case 'stream_end':
                            savedCallbacks.current.onEnd(payload.full_response);
                            break;
                        case 'stream_error':
                            savedCallbacks.current.onError(payload.error);
                            if (payload.rate_limited) {
                                toast.warning('Rate limit reached', `Too many requests. Retry in ${payload.retry_after ?? 60}s.`);
                            } else {
                                toast.error('AI Error', payload.error);
                            }
                            break;
                        case 'rag_trace':
                            savedCallbacks.current.onRagTrace?.(payload);
                            break;
                        case 'crosstalk_start':
                            savedCallbacks.current.onCrosstalkStart?.(payload);
                            break;
                        case 'crosstalk_token':
                            savedCallbacks.current.onCrosstalkToken?.(payload);
                            break;
                        case 'crosstalk_end':
                            savedCallbacks.current.onCrosstalkEnd?.(payload);
                            break;
                        case 'iot_telemetry':
                            savedCallbacks.current.onIoTTelemetry?.(payload);
                            break;
                        case 'crosstalk_error':
                            toast.error('Cross-Talk Error', payload.error);
                            break;
                    }
                } catch (e) {
                    console.error("Failed to parse websocket message", e);
                }
            };

            socket.onclose = () => {
                setIsConnected(false);
                if (isComponentMounted && attempt < maxAttempts) {
                    attempt++;
                    reconnectTimeout = setTimeout(connect, 1000 * attempt);
                }
            };

            socket.onerror = () => {
                if (attempt === 0) {
                    toast.error('Connection Error', 'Could not reach AI service. Is Django running?');
                }
            };
        }

        connect();

        return () => {
            isComponentMounted = false;
            clearTimeout(reconnectTimeout);
            if (socket) {
                // Ensure socket is completely disconnected
                socket.close();
            }
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [sessionId]);

    const sendMessage = useCallback(
        (
            mode: Mode,
            message: string,
            history: Array<{ role: string; content: string }>,
            zeroRetention = false,
        ) => {
            const socket = socketRef.current;
            if (!socket || socket.readyState !== WebSocket.OPEN) {
                savedCallbacks.current.onError('Not connected to AI service.');
                toast.error('Not connected', 'Check that Django Channels is running.');
                return;
            }

            const user = TokenStorage.getUser();

            // Replicate the socket.io emit pattern
            socket.send(JSON.stringify({
                event: 'chat_message',
                data: {
                    mode,
                    message,
                    session_id: sessionId,
                    user_id: user?.username || 'anonymous',
                    history,
                    zero_retention: zeroRetention,
                }
            }));
        },
        [sessionId]
    );

    return { sendMessage, isConnected };
}
