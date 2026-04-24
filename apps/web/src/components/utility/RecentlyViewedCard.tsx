'use client';
import EmptyCanvas from '../canvas/EmptyCanvas';
import moment from 'moment';
import { QuizViewsType } from '@nocturn/types';
import { JSX } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { GoGrabber } from 'react-icons/go';
import { RxOpenInNewWindow } from 'react-icons/rx';
import { useDraggableQuizCard } from '@/hooks/useDraggableQuizCard';
import CanvasSkeletonCard from '@/components/skeletons/CanvasSkeleton';

interface RecentlyViewedCardProps {
    quiz?: Partial<QuizViewsType>;
    className?: string;
    loading?: boolean;
}

export default function RecentlyViewedCard({
    quiz,
    className,
    loading = false,
}: RecentlyViewedCardProps): JSX.Element {
    const router = useRouter();
    const quizId = quiz?.quiz?.id;
    const formattedTime = quiz?.viewedAt ? moment(quiz.viewedAt).format('MMM D, YYYY') : '';
    const { cardRef, originRect, isThisCardDragging, suppressClickRef, handlers, isDeleting } =
        useDraggableQuizCard({ quizId });

    function handleCardClick(e: React.MouseEvent) {
        if (loading || isDeleting) return;
        if (suppressClickRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        router.push(`/new/${quizId}`);
    }

    return (
        <>
            {isThisCardDragging && originRect && (
                <div style={{ width: originRect.width, height: originRect.height }} />
            )}

            <div
                ref={cardRef}
                className={cn(
                    'w-full rounded-sm',
                    className,
                    isDeleting && 'animate-pulse animation-duration-[2s] pointer-events-none',
                )}
            >
                {loading ? (
                    <CanvasSkeletonCard />
                ) : (
                    quiz?.quiz?.template && (
                        <div className="relative group">
                            <EmptyCanvas
                                className={cn(
                                    'w-full aspect-video rounded-[6px] outline-2 outline-black/40 dark:outline-white/40',
                                )}
                                template={quiz.quiz.template}
                            />

                            <div className="absolute inset-0 flex p-0.5 rounded-[10px] overflow-hidden">
                                <div
                                    className={cn(
                                        'w-full h-full opacity-0 group-hover:opacity-100',
                                        'cursor-grab bg-dark-base/30 hover:bg-dark-base/50 flex items-center justify-center rounded-r-none',
                                    )}
                                    onPointerDown={handlers.onHandlePointerDown}
                                    onPointerUp={handlers.onPointerUp}
                                    onPointerLeave={handlers.onPointerUp}
                                    onPointerMove={handlers.onPointerMove}
                                >
                                    <GoGrabber className="size-7 text-light-base" />
                                </div>

                                <div
                                    className={cn(
                                        'w-full h-full opacity-0 group-hover:opacity-100',
                                        'cursor-pointer bg-dark-base/30 hover:bg-dark-base/50 flex items-center justify-center rounded-l-none',
                                    )}
                                    onClick={handleCardClick}
                                >
                                    <RxOpenInNewWindow className="size-4.5 text-light-base" />
                                </div>
                            </div>
                        </div>
                    )
                )}

                {!loading && (
                    <div className="flex items-center gap-x-2 pt-2">
                        {quiz?.quiz?.host?.image && (
                            <Image
                                src={quiz.quiz.host.image}
                                width={32}
                                height={32}
                                alt="user"
                                className="rounded-full"
                            />
                        )}

                        <div>
                            <span className="block text-normal">
                                {quiz?.quiz?.title?.slice(0, 28)}...
                            </span>
                            <span className="block text-xs text-black/60 dark:text-white/60">
                                last viewed {formattedTime}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
