import { useEffect, useRef } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

export function useKeyPress(key: string, handler: KeyHandler, enabled: boolean = true) {
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        if (!enabled) return;

        function listener(e: KeyboardEvent) {
            if (e.key === key) handlerRef.current(e);
        }

        window.addEventListener('keydown', listener);
        return () => window.removeEventListener('keydown', listener);
    }, [key, enabled]);
}

export function useEscape(handler: () => void, enabled: boolean = true) {
    useKeyPress('Escape', handler, enabled);
}
