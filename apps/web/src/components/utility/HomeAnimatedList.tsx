'use client';

import { cn } from '@/lib/utils';
import { AnimatedList } from '../magicui/animated-list';
import Image from 'next/image';
import { format } from 'date-fns';

interface Review {
    user: {
        name: string;
        image?: string;
    };
    comment: string;
    createdAt: string;
}

function truncateChars(text: string, maxChars: number): string {
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
                            className="rounded-full object-cover"
                        />
                    ) : (
                        <span className="text-xs text-white">{name[0]}</span>
                    )}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium text-neutral-800 dark:text-white">
                        <span className="text-xs xs:text-md">{name}</span>
                        <span className="mx-1">·</span>
                        <span className="text-xs text-gray-500">{time}</span>
                    </figcaption>
                    <p className="text-xs font-normal text-neutral-600 dark:text-white/60 max-w-xs break-words">
                        {truncatedComment}
                    </p>
                </div>
            </div>
        </figure>
    );
};

const reviews: Review[] = [
    {
        user: {
            name: 'Alice Johnson',
            image: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-1.jpg',
        },
        comment: 'Absolutely loved the UI!',
        createdAt: '2025-09-20T12:00:00Z',
    },
    {
        user: {
            name: 'Bob xsith',
            image: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-2.jpg',
        },
        comment: 'Great experience overall.',
        createdAt: '2025-09-19T10:15:00Z',
    },
    {
        user: {
            name: 'Clara Lee',
            image: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-3.jpg',
        },
        comment: 'Support team was super helpful!',
        createdAt: '2025-09-18T08:45:00Z',
    },
    {
        user: {
            name: 'Daniel Kim',
            image: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-4.jpg',
        },
        comment: 'Fast and easy setup process.',
        createdAt: '2025-09-17T14:00:00Z',
    },
    {
        user: {
            name: 'Eva Martinez',
            image: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-5.jpg',
        },
        comment: 'Design feels super modern.',
        createdAt: '2025-09-15T09:30:00Z',
    },
    {
        user: {
            name: 'Frank Yang',
            image: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-6.jpg',
        },
        comment: 'Easy to navigate and well-built.',
        createdAt: '2025-09-14T11:20:00Z',
    },
];

export default function HomeAnimatedList({ className }: { className?: string }) {
    return (
        <div
            className={cn('relative flex h-[370px] w-full flex-col overflow-hidden p-2', className)}
        >
            <AnimatedList>
                {reviews.map((item, idx) => (
                    <Notification
                        key={idx}
                        name={item.user.name}
                        comment={item.comment}
                        image={item.user.image}
                        time={format(new Date(item.createdAt), 'MMM d, yyyy')}
                    />
                ))}
            </AnimatedList>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
        </div>
    );
}
