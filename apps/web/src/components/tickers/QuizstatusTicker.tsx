import { QuizStatusEnum } from '@nocturn/types';
import React from 'react';

interface QuizStatusTickerProps {
    status: QuizStatusEnum;
    className?: string;
}

const statusConfig = {
    [QuizStatusEnum.NULL]: {
        label: 'Unknown',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        dotColor: 'bg-gray-500',
    },
    [QuizStatusEnum.CREATED]: {
        label: 'Created',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        dotColor: 'bg-orange-500',
    },
    [QuizStatusEnum.SCHEDULED]: {
        label: 'Scheduled',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        dotColor: 'bg-blue-500',
    },
    [QuizStatusEnum.LIVE]: {
        label: 'Live',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        dotColor: 'bg-green-500',
    },
    [QuizStatusEnum.COMPLETED]: {
        label: 'Completed',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        dotColor: 'bg-purple-500',
    },
    [QuizStatusEnum.CANCELLED]: {
        label: 'Cancelled',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        dotColor: 'bg-red-500',
    },
    [QuizStatusEnum.PAYOUT_PENDING]: {
        label: 'Payout Pending',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        dotColor: 'bg-yellow-500',
    },
    [QuizStatusEnum.PAYOUT_COMPLETED]: {
        label: 'Payout Completed',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-800',
        dotColor: 'bg-emerald-500',
    },
    [QuizStatusEnum.PUBLISHED]: {
        label: 'Published',
        bgColor: 'bg-cyan-100',
        textColor: 'text-cyan-800',
        dotColor: 'bg-cyan-500',
    },
};

export default function QuizStatusTicker({ status, className = '' }: QuizStatusTickerProps) {
    const config = statusConfig[status];

    if (!config) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                Unknown
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
            {config.label}
        </span>
    );
}
