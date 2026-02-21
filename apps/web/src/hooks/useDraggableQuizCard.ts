'use client';
import { useEffect, useRef, useState } from 'react';
import { useDragQuizStore } from '@/store/home/useDragQuizStore';
import { useRecentlyViewedQuizStore } from '@/store/user/useRecentlyViewedQuizStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { toast } from '@/lib/toast';

interface UseDraggableQuizCardProps {
    quizId?: string;
}

export function useDraggableQuizCard({ quizId }: UseDraggableQuizCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const dragActiveRef = useRef(false);
    const handlePressedRef = useRef(false);
    const suppressClickRef = useRef(false);
    const longPressRef = useRef<NodeJS.Timeout | null>(null);
    const pointerIdRef = useRef<number | null>(null);

    const targetPos = useRef({ x: 0, y: 0 });
    const visualPos = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });

    const [isDraggingLocal, setIsDraggingLocal] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [originRect, setOriginRect] = useState<DOMRect | null>(null);

    const { session } = useUserSessionStore();
    const { deleteQuiz } = useRecentlyViewedQuizStore();
    const { draggingQuizId, startDrag, endDrag, isOverTrash } = useDragQuizStore();

    const isThisCardDragging = isDraggingLocal && draggingQuizId === quizId;

    async function handleDeleteQuiz(id: string) {
        if (!session?.user.token) return;
        try {
            await QuizActions.delete_quiz(session.user.token, id);
            deleteQuiz(id);
            toast.success('Quiz deleted successfully');
        } catch {
            toast.error('Failed to delete the quiz');
        }
    }

    function resetCardStyles() {
        if (!cardRef.current) return;
        Object.assign(cardRef.current.style, {
            position: '',
            left: '',
            top: '',
            width: '',
            zIndex: '',
            pointerEvents: '',
            transform: '',
            opacity: '',
            transition: '',
        });
    }

    function onHandlePointerDown(e: React.PointerEvent) {
        if (!quizId || !cardRef.current) return;

        e.preventDefault();
        e.stopPropagation();

        handlePressedRef.current = true;
        pointerIdRef.current = e.pointerId;

        const rect = cardRef.current.getBoundingClientRect();
        setOriginRect(rect);
        setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });

        cardRef.current.style.transform = 'scale(0.8)';
        cardRef.current.style.opacity = '0.75';
        cardRef.current.style.transition = 'transform 120ms ease, opacity 120ms ease';

        longPressRef.current = setTimeout(() => {
            if (!handlePressedRef.current || !cardRef.current) return;

            dragActiveRef.current = true;
            setIsDraggingLocal(true);
            startDrag(quizId);

            const r = cardRef.current.getBoundingClientRect();
            targetPos.current = { x: r.left, y: r.top };
            visualPos.current = { x: r.left, y: r.top };
            velocity.current = { x: 0, y: 0 };

            Object.assign(cardRef.current.style, {
                position: 'fixed',
                left: `${r.left}px`,
                top: `${r.top}px`,
                width: `${r.width}px`,
                zIndex: '9999',
                pointerEvents: 'none',
                transition: 'none',
            });
        }, 120);

        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: React.PointerEvent) {
        if (!dragActiveRef.current) return;
        targetPos.current = {
            x: e.clientX - offset.x,
            y: e.clientY - offset.y,
        };
    }

    function onPointerUp(e: React.PointerEvent) {
        if (pointerIdRef.current !== e.pointerId) return;

        e.preventDefault();
        e.stopPropagation();

        if (longPressRef.current) clearTimeout(longPressRef.current);

        const wasDragging = dragActiveRef.current;

        handlePressedRef.current = false;
        pointerIdRef.current = null;

        if (wasDragging && quizId) {
            if (isOverTrash) handleDeleteQuiz(quizId);

            suppressClickRef.current = true;
            resetCardStyles();

            setIsDraggingLocal(false);
            dragActiveRef.current = false;
            endDrag();

            setTimeout(() => (suppressClickRef.current = false), 300);
        } else {
            resetCardStyles();
            suppressClickRef.current = true;
            setTimeout(() => (suppressClickRef.current = false), 200);
        }
    }

    useEffect(() => {
        if (!isDraggingLocal || !cardRef.current) return;

        let raf: number;
        const stiffness = 0.065;
        const damping = 0.82;

        const animate = () => {
            const dx = targetPos.current.x - visualPos.current.x;
            const dy = targetPos.current.y - visualPos.current.y;

            velocity.current.x = (velocity.current.x + dx * stiffness) * damping;
            velocity.current.y = (velocity.current.y + dy * stiffness) * damping;

            visualPos.current.x += velocity.current.x;
            visualPos.current.y += velocity.current.y;

            cardRef.current!.style.left = `${visualPos.current.x}px`;
            cardRef.current!.style.top = `${visualPos.current.y}px`;

            raf = requestAnimationFrame(animate);
        };

        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, [isDraggingLocal]);

    return {
        cardRef,
        originRect,
        isThisCardDragging,
        suppressClickRef,
        handlers: {
            onHandlePointerDown,
            onPointerMove,
            onPointerUp,
        },
    };
}
