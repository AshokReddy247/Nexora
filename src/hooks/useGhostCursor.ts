'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Mode } from '@/store/modeStore';

export type GhostIntent =
    | 'copy_code'
    | 'save_note'
    | 'export_pdf'
    | 'switch_mode'
    | 'export_csv'
    | 'crosstalk'
    | null;

interface GhostCursorState {
    intent: GhostIntent;
    confidence: number; // 0-1
}

interface UseGhostCursorOptions {
    mode: Mode;
    messageCount: number;
    lastAiMessage: string;
    lastUserMessage: string;
    onIntent: (state: GhostCursorState) => void;
}

// ------------------------------------------------------------------
// Heuristic pattern detectors
// ------------------------------------------------------------------
const CODE_PATTERN = /```[\s\S]*?```|`[^`]+`|\bfunction\b|\bconst\b|\bclass\b|\bdef\b/;
const TABLE_PATTERN = /\|.+\|.+\|/;
const QUESTION_PATTERN = /\?|how|what|why|explain|tell me/i;
const LENGTHY_THRESHOLD = 400; // chars

function detectIntent(
    mode: Mode,
    lastAiMessage: string,
    lastUserMessage: string,
    messageCount: number
): GhostCursorState {
    // No intent before any conversation
    if (messageCount < 2) return { intent: null, confidence: 0 };

    const aiHasCode = CODE_PATTERN.test(lastAiMessage);
    const aiHasTable = TABLE_PATTERN.test(lastAiMessage);
    const aiIsLong = lastAiMessage.length > LENGTHY_THRESHOLD;
    const userAskedQuestion = QUESTION_PATTERN.test(lastUserMessage);
    const userMentionedLookup =
        /latest|docs|documentation|trend|market|research/i.test(lastUserMessage);

    // Developer mode — code detected → predict "copy code"
    if (mode === 'developer' && aiHasCode) {
        return { intent: 'copy_code', confidence: 0.9 };
    }

    // Enquiry mode — table detected → predict CSV export
    if (mode === 'enquiry' && aiHasTable) {
        return { intent: 'export_csv', confidence: 0.88 };
    }

    // Student mode — long explanation → predict "save as note"
    if (mode === 'student' && aiIsLong) {
        return { intent: 'save_note', confidence: 0.85 };
    }

    // Developer + research intent → predict cross-talk
    if (mode === 'developer' && userMentionedLookup) {
        return { intent: 'crosstalk', confidence: 0.75 };
    }

    // After 8+ messages in any mode → predict PDF export
    if (messageCount >= 8) {
        return { intent: 'export_pdf', confidence: 0.65 };
    }

    // Long AI message in everyday/system → generic copy
    if ((mode === 'everyday' || mode === 'system') && aiIsLong) {
        return { intent: 'copy_code', confidence: 0.55 };
    }

    return { intent: null, confidence: 0 };
}

// ------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------
export function useGhostCursor({
    mode,
    messageCount,
    lastAiMessage,
    lastUserMessage,
    onIntent,
}: UseGhostCursorOptions) {
    const prevIntentRef = useRef<GhostIntent>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const evaluate = useCallback(() => {
        const state = detectIntent(mode, lastAiMessage, lastUserMessage, messageCount);

        // Only fire callback when intent changes
        if (state.intent !== prevIntentRef.current) {
            prevIntentRef.current = state.intent;
            onIntent(state);

            // Auto-clear ghost highlight after 4 seconds
            if (timerRef.current) clearTimeout(timerRef.current);
            if (state.intent) {
                timerRef.current = setTimeout(() => {
                    onIntent({ intent: null, confidence: 0 });
                    prevIntentRef.current = null;
                }, 4000);
            }
        }
    }, [mode, lastAiMessage, lastUserMessage, messageCount, onIntent]);

    useEffect(() => {
        // Small delay prevents jitter while typing
        const t = setTimeout(evaluate, 600);
        return () => clearTimeout(t);
    }, [evaluate]);

    // Cleanup
    useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
}
