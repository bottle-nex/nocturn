'use client';
import { cn } from '@/lib/utils';
import InvertedQuizCards from '../utility/InvertedQuizCards';

export interface StyleInterface {
    style?: React.CSSProperties;
}

export interface HomeDashboardProps extends StyleInterface {
    className: string;
}

export default function HomeDashboard({ style, className }: HomeDashboardProps) {
    return (
        <div className={cn('flex flex-col overflow-hidden relative', className)} style={style}>
            <div className="w-[24rem] flex flex-col relative p-8">
                <InvertedQuizCards />
            </div>
        </div>
    );
}
