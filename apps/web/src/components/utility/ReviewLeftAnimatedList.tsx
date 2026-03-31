'use client';

import { cn } from '@/lib/utils';
import { AnimatedList } from '../magicui/animated-list';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import HomeDataActions from '@/lib/backend/home/home-data-actioms';
import { ReviewDTO } from '@nocturn/types';

function truncateChars(text: string, maxChars: number): string {
    if (!text) return '';
    return text.length <= maxChars ? text : text.slice(0, maxChars) + '...';
}

const Notification = ({
    name,
    comment,
    image,
    time,
}: {
    name: string;
    comment: string;
    image?: string;
    time: string;
}) => {
    const truncatedComment = truncateChars(comment, 30);

    return (
        <figure
            className={cn(
                'relative mx-auto min-h-fit w-full max-w-[400px] overflow-hidden rounded-2xl p-4',
                'transition-all duration-200 ease-in-out hover:scale-[103%]',
                'bg-neutral-50 border border-neutral-200',
                'transform-gpu dark:bg-neutral-900/40 dark:backdrop-blur-md dark:border dark:border-white/10 dark:shadow-[0_-20px_80px_-20px_#ffffff1f_inset]',
            )}
        >
            <div className="flex flex-row items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl overflow-hidden bg-neutral-300 dark:bg-neutral-700">
                    {image ? (
                        <Image
                            src={image}
                            alt={name}
                            width={40}
                            height={40}
                            className="rounded-2xl object-cover"
                        />
                    ) : (
                        <span className="text-sm text-white">{name[0]}</span>
                    )}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium text-neutral-800 dark:text-white">
                        <span className="text-sm sm:text-lg">{name}</span>
                        <span className="mx-1">·</span>
                        <span className="text-xs text-gray-500">{time}</span>
                    </figcaption>
                    <p className="text-sm font-normal text-neutral-600 dark:text-white/60 max-w-xs break-words">
                        {truncatedComment}
                    </p>
                </div>
            </div>
        </figure>
    );
};

export default function ReviewLeftAnimatedList({ className }: { className?: string }) {
    const [reviews, setReviews] = useState<ReviewDTO[]>([]);
    const { session } = useUserSessionStore();

    useEffect(() => {
        async function fetchReviews() {
            const reviews = await HomeDataActions.get_reviews(session?.user.token);

            if (reviews) setReviews(reviews);
        }
        fetchReviews();
    }, [session?.user.token]);

    return (
        <div
            className={cn('relative flex h-[370px] w-full flex-col overflow-hidden p-2', className)}
        >
            <AnimatedList>
                {reviews.map((item, idx) => (
                    <Notification
                        key={idx}
                        name={item.user?.name}
                        comment={item.comment}
                        image={item.user.image || ''}
                        time={format(new Date(item.createdAt), 'MMM d, yyyy')}
                    />
                ))}
            </AnimatedList>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-background"></div>
        </div>
    );
}
