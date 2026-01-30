import { cn } from '@/lib/utils';
import { QuizStatusEnum } from '@nocturn/types';
import React from 'react';

interface QuizStatusTickerProps {
    status: QuizStatusEnum;
    className?: string;
}

const statusConfig = {
    [QuizStatusEnum.NULL]: {
        label: 'Unknown',
        stripColor: 'bg-gray-500',
        bgColor: 'bg-gray-900/90 dark:bg-gray-100/90',
        textColor: 'text-gray-100 dark:text-gray-900',
    },
    [QuizStatusEnum.CREATED]: {
        label: 'Created',
        stripColor: 'bg-orange-500',
        bgColor: 'bg-orange-900/90 dark:bg-orange-100/90',
        textColor: 'text-orange-100 dark:text-orange-900',
    },
    [QuizStatusEnum.SCHEDULED]: {
        label: 'Scheduled',
        stripColor: 'bg-blue-500',
        bgColor: 'bg-blue-900/90 dark:bg-blue-100/90',
        textColor: 'text-blue-100 dark:text-blue-900',
    },
    [QuizStatusEnum.LIVE]: {
        label: 'Live',
        stripColor: 'bg-green-500',
        bgColor: 'bg-green-900/90 dark:bg-green-100/90',
        textColor: 'text-green-100 dark:text-green-900',
    },
    [QuizStatusEnum.COMPLETED]: {
        label: 'Completed',
        stripColor: 'bg-purple-500',
        bgColor: 'bg-purple-900/90 dark:bg-purple-100/90',
        textColor: 'text-purple-100 dark:text-purple-900',
    },
    [QuizStatusEnum.CANCELLED]: {
        label: 'Cancelled',
        stripColor: 'bg-red-500',
        bgColor: 'bg-red-900/90 dark:bg-red-100/90',
        textColor: 'text-red-100 dark:text-red-900',
    },
    [QuizStatusEnum.PAYOUT_PENDING]: {
        label: 'Payout Pending',
        stripColor: 'bg-yellow-500',
        bgColor: 'bg-yellow-900/90 dark:bg-yellow-100/90',
        textColor: 'text-yellow-100 dark:text-yellow-900',
    },
    [QuizStatusEnum.PAYOUT_COMPLETED]: {
        label: 'Payout Completed',
        stripColor: 'bg-emerald-500',
        bgColor: 'bg-emerald-900/90 dark:bg-emerald-100/90',
        textColor: 'text-emerald-100 dark:text-emerald-900',
    },
    [QuizStatusEnum.PUBLISHED]: {
        label: 'Published',
        stripColor: 'bg-cyan-500',
        bgColor: 'bg-cyan-900/90 dark:bg-cyan-100/90',
        textColor: 'text-cyan-100 dark:text-cyan-900',
    },
};

export default function QuizStatusTicker({ status, className = '' }: QuizStatusTickerProps) {
    const config = statusConfig[status];

    if (!config) {
        return (
            <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500 text-white ${className}`}
            >
                Unknown
            </span>
        );
    }

    return (
        <span
            className={cn(
                `inline-flex items-center px-2.5 py-1 rounded-alpha text-xs font-medium ${config.stripColor} text-white', ${className}`,
            )}
        >
            {config.label}
        </span>
    );
}
