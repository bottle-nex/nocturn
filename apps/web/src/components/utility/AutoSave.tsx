'use client';

import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useAutoSaveStatusStore, SAVE_STATUS } from '@/hooks/useAutoSave';

const statusConfig: Record<SAVE_STATUS, { color: string; label: string; pulse: boolean }> = {
    [SAVE_STATUS.IDLE]: { color: 'bg-neutral-400', label: 'auto save', pulse: false },
    [SAVE_STATUS.SAVED]: { color: 'bg-green-600', label: 'all changes saved', pulse: false },
    [SAVE_STATUS.SAVING]: { color: 'bg-yellow-500', label: 'saving...', pulse: true },
    [SAVE_STATUS.UNSAVED]: { color: 'bg-orange-500', label: 'unsaved changes', pulse: true },
};

export default function AutoSaveComponent({ className }: { className?: string }) {
    const { setState } = useDraftRendererStore();
    const underlineRef = useRef<HTMLDivElement>(null);
    const { quiz } = useNewQuizStore();
    const { status } = useAutoSaveStatusStore();

    const config = quiz.autoSave
        ? statusConfig[status]
        : { color: 'bg-red-500', label: 'auto save is off', pulse: false };

    useEffect(() => {
        const underline = underlineRef.current;
        if (!underline) return;

        gsap.set(underline, {
            scaleX: 0,
            transformOrigin: 'center',
        });

        const handleMouseEnter = () => {
            gsap.to(underline, {
                scaleX: 1,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const handleMouseLeave = () => {
            gsap.to(underline, {
                scaleX: 0,
                duration: 0.3,
                ease: 'power2.out',
            });
        };

        const parentElement = underline.parentElement;
        if (parentElement) {
            parentElement.addEventListener('mouseenter', handleMouseEnter);
            parentElement.addEventListener('mouseleave', handleMouseLeave);

            return () => {
                parentElement.removeEventListener('mouseenter', handleMouseEnter);
                parentElement.removeEventListener('mouseleave', handleMouseLeave);
            };
        }
    }, []);

    return (
        <div
            onClick={() => setState(DraftRenderer.ADVANCED)}
            className={`hidden lg:inline-flex items-center gap-x-2 whitespace-nowrap max-w-full cursor-pointer ${className} `}
        >
            <div
                className={`h-2 w-2 rounded-full shrink-0 ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}
            />
            <span className="relative text-neutral-500 dark:text-neutral-400 text-xs">
                {config.label}
                <div
                    ref={underlineRef}
                    className="absolute bottom-0 left-0 w-full h-px bg-current"
                />
            </span>
        </div>
    );
}
