import type { TargetedMouseEvent } from 'preact';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import type { RippleWave } from '../types';

const RIPPLE_DURATION_MS = 550;

export function useRipple(durationMs = RIPPLE_DURATION_MS) {
    const [waves, setWaves] = useState<RippleWave[]>([]);
    const nextId = useRef(0);
    const timers = useRef(new Set<number>());

    useEffect(() => () => {
        timers.current.forEach(timer => window.clearTimeout(timer));
        timers.current.clear();
    }, []);

    const startRipple = useCallback((event: TargetedMouseEvent<HTMLElement>) => {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.detail ? event.clientX - rect.left : rect.width / 2;
        const y = event.detail ? event.clientY - rect.top : rect.height / 2;
        const size = 2 * Math.max(
            Math.hypot(x, y),
            Math.hypot(rect.width - x, y),
            Math.hypot(x, rect.height - y),
            Math.hypot(rect.width - x, rect.height - y),
        );
        const id = ++nextId.current;
        setWaves(current => [...current, { id, x, y, size, durationMs }]);

        const timer = window.setTimeout(() => {
            setWaves(current => current.filter(wave => wave.id !== id));
            timers.current.delete(timer);
        }, durationMs);
        timers.current.add(timer);
    }, [durationMs]);

    return { waves, startRipple };
}
