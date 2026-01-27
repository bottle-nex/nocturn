'use client';
import EmptyCanvas from '../canvas/EmptyCanvas';
import moment from 'moment';
import { QuizViewsType } from '@nocturn/types';
import { JSX, useRef, useState, useEffect } from 'react';
import { templates } from '@/lib/templates';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDragQuizStore } from '@/store/home/useDragQuizStore';
import { useRecentlyViewedQuizStore } from '@/store/user/useRecentlyViewedQuizStore';
import QuizActions from '@/lib/backend/home/quiz-actions';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { GoGrabber } from 'react-icons/go';
import { RxOpenInNewWindow } from 'react-icons/rx';

interface RecentlyViewedCardProps {
    quiz: Partial<QuizViewsType>;
}

export default function RecentlyViewedCard({ quiz }: RecentlyViewedCardProps): JSX.Element {
    const template = templates.find((t) => t.id === quiz.quiz?.theme);
    const formattedTime = moment(quiz.viewedAt).format('MMM D, YYYY');
    const router = useRouter();
    const dragActiveRef = useRef(false);

    const quizId = quiz.quiz?.id;

    const handlePressedRef = useRef(false);
    const suppressClickRef = useRef(false);
    const longPressRef = useRef<NodeJS.Timeout | null>(null);
    const startPointerRef = useRef({ x: 0, y: 0 });
    const pointerIdRef = useRef<number | null>(null);

    const [isDraggingLocal, setIsDraggingLocal] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [originRect, setOriginRect] = useState<DOMRect | null>(null);

    const cardRef = useRef<HTMLDivElement>(null);
    const targetPos = useRef({ x: 0, y: 0 });
    const visualPos = useRef({ x: 0, y: 0 });
    const velocity = useRef({ x: 0, y: 0 });

    const { session } = useUserSessionStore();
    const { deleteQuiz } = useRecentlyViewedQuizStore();
    const { draggingQuizId, startDrag, endDrag, isOverTrash } = useDragQuizStore();

    const isThisCardDragging = isDraggingLocal && draggingQuizId === quizId;

    async function handleDeleteQuiz(id: string) {
        if (!id || !session?.user.token) return;
        try {
            await QuizActions.delete_quiz(session.user.token, id);
            deleteQuiz(id);
            toast.success('Quiz deleted successfully');
        } catch {
            toast.error('Failed to delete the quiz');
        }
    }

    function handleCardClick(e: React.MouseEvent) {
        if (dragActiveRef.current || suppressClickRef.current || handlePressedRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        router.push(`/new/${quizId}`);
    }

    function handleHandlePointerDown(e: React.PointerEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (!quizId || !cardRef.current) return;

        handlePressedRef.current = true;
        pointerIdRef.current = e.pointerId;
        startPointerRef.current = { x: e.clientX, y: e.clientY };

        const rect = cardRef.current.getBoundingClientRect();
        setOriginRect(rect);
        setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });

        cardRef.current.style.transform = 'scale(0.80)';
        cardRef.current.style.opacity = '0.75';
        cardRef.current.style.transition = 'transform 120ms ease, opacity 120ms ease';

        longPressRef.current = setTimeout(() => {
            if (!cardRef.current || !handlePressedRef.current) return;

            dragActiveRef.current = true;
            setIsDraggingLocal(true);
            startDrag(quizId);

            const rectNow = cardRef.current.getBoundingClientRect();

            const startX = rectNow.left;
            const startY = rectNow.top;

            targetPos.current = { x: startX, y: startY };
            visualPos.current = { x: startX, y: startY };
            velocity.current = { x: 0, y: 0 };

            // Enter drag mode - keep card floating
            cardRef.current.style.position = 'fixed';
            cardRef.current.style.left = `${startX}px`;
            cardRef.current.style.top = `${startY}px`;
            cardRef.current.style.width = `${rectNow.width}px`;
            cardRef.current.style.zIndex = '9999';
            cardRef.current.style.pointerEvents = 'none';
            // Keep the pressed appearance, remove transition so it doesn't snap
            cardRef.current.style.transition = 'none';
            cardRef.current.style.transform = 'scale(0.80)';
            cardRef.current.style.opacity = '0.75';
        }, 120);

        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }

    function handlePointerMove(e: React.PointerEvent) {
        if (dragActiveRef.current) {
            const x = e.clientX - offset.x;
            const y = e.clientY - offset.y;
            targetPos.current = { x, y };
        }
    }

    function handlePointerUp(e: React.PointerEvent) {
        // Only process if this is the pointer we captured
        if (pointerIdRef.current !== null && e.pointerId !== pointerIdRef.current) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (longPressRef.current) {
            clearTimeout(longPressRef.current);
            longPressRef.current = null;
        }

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

            setTimeout(() => {
                suppressClickRef.current = false;
            }, 300);
        } else {
            if (cardRef.current) {
                cardRef.current.style.transform = '';
                cardRef.current.style.opacity = '';
                cardRef.current.style.transition = '';
            }

            suppressClickRef.current = true;
            setTimeout(() => {
                suppressClickRef.current = false;
            }, 200);
        }
    }

    function resetCardStyles() {
        if (!cardRef.current) return;
        cardRef.current.style.position = '';
        cardRef.current.style.left = '';
        cardRef.current.style.top = '';
        cardRef.current.style.width = '';
        cardRef.current.style.zIndex = '';
        cardRef.current.style.pointerEvents = '';
        cardRef.current.style.transform = '';
        cardRef.current.style.opacity = '';
    }

    useEffect(() => {
        if (!isDraggingLocal || !cardRef.current) return;

        let raf: number;
        const stiffness = 0.065;
        const damping = 0.82;

        const animate = () => {
            const dx = targetPos.current.x - visualPos.current.x;
            const dy = targetPos.current.y - visualPos.current.y;

            velocity.current.x += dx * stiffness;
            velocity.current.y += dy * stiffness;

            velocity.current.x *= damping;
            velocity.current.y *= damping;

            visualPos.current.x += velocity.current.x;
            visualPos.current.y += velocity.current.y;

            const speed = Math.min(20, Math.hypot(velocity.current.x, velocity.current.y));
            const scale = 0.94 - speed * 0.0008;
            const opacity = 0.85 - speed * 0.002;

            if (cardRef.current) {
                cardRef.current.style.left = `${visualPos.current.x}px`;
                cardRef.current.style.top = `${visualPos.current.y}px`;
                cardRef.current.style.transform = `scale(${Math.max(scale, 0.9)})`;
                cardRef.current.style.opacity = `${Math.max(opacity, 0.7)}`;
            }

            raf = requestAnimationFrame(animate);
        };

        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, [isDraggingLocal]);

    return (
        <>
            {isThisCardDragging && originRect && (
                <div style={{ width: originRect.width, height: originRect.height }} />
            )}

            <div
                ref={cardRef}
                // onClick={handleCardClick}
                onPointerMove={handlePointerMove}
                onPointerDown={(e) => {
                    if (isDraggingLocal) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
                className="w-88 aspect-video rounded-sm cursor-pointer transition-shadow"
            >
                {template && (
                    <div className="relative group">
                        <EmptyCanvas
                            className="w-full aspect-video rounded-[10px] outline-2 outline-black/40 dark:outline-white/40"
                            template={template}
                        />
                        <div className={cn('absolute w-full h-full top-0 p-0.5 rounded-lg flex')}>
                            <div
                                className={cn(
                                    'w-full h-full',
                                    'opacity-0 group-hover:opacity-100 transition-all duration-200',
                                    'cursor-grab active:cursor-grabbing touch-none',
                                    'bg-dark-base/30 hover:bg-dark-base/50 rounded-[4px] rounded-r-none',
                                    'flex justify-center items-center',
                                )}
                                onPointerDown={handleHandlePointerDown}
                                onPointerUp={handlePointerUp}
                                onPointerLeave={handlePointerUp}
                            >
                                <GoGrabber className="size-10 text-light-base stroke-1.5" />
                            </div>

                            <div
                                className={cn(
                                    'w-full h-full',
                                    'opacity-0 group-hover:opacity-100 transition-all duration-200',
                                    'cursor-pointer',
                                    'bg-dark-base/30 hover:bg-dark-base/50 rounded-[4px] rounded-l-none',
                                    'flex justify-center items-center',
                                )}
                                onClick={handleCardClick}
                            >
                                <RxOpenInNewWindow className="size-7 text-light-base stroke-1.5" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-start gap-x-2.5 pt-2">
                    {quiz.quiz?.host?.image && (
                        <Image
                            src={quiz.quiz.host.image}
                            width={32}
                            height={32}
                            alt="user-logo"
                            className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all rounded-full"
                        />
                    )}

                    <div>
                        <span className="block text-normal mt-1">
                            {quiz.quiz?.title?.slice(0, 28)}...
                        </span>
                        <span className="block dark:text-white/60 text-black/60 text-[13px]">
                            last viewed {formattedTime}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
