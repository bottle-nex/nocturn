'use client';

import OpacityBackground from '@/components/utility/OpacityBackground';
import { cn } from '@/lib/utils';
import { LiaPagerSolid } from 'react-icons/lia';
import { useState } from 'react';

interface PreviewQuizSkeletonProps {
    onPreviewClose?: () => void;
}

export default function PreviewQuizSkeleton({ onPreviewClose }: PreviewQuizSkeletonProps) {
    const [themePanel, setThemePanel] = useState<boolean>(false);

    return (
        <OpacityBackground onBackgroundClick={onPreviewClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    'max-h-full w-fit flex flex-col gap-y-3 p-6 rounded-beta bg-dark-base',
                    'border border-neutral-700',
                )}
            >
                {/* HEADER SKELETON */}
                <div className="relative w-full flex justify-between items-center h-10">
                    {/* Theme Button Placeholder */}
                    <div
                        className={cn(
                            'relative flex items-center gap-x-1 px-3 py-1.5',
                            'rounded-beta hover:bg-dark-alpha transition cursor-pointer',
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            setThemePanel(true);
                        }}
                    >
                        <LiaPagerSolid size={20} />
                        <span>Change theme</span>
                    </div>

                    {/* Center Text Placeholder */}
                    <div
                        className={cn(
                            'absolute left-1/2 -translate-x-1/2 text-4xl ',
                            'dark:bg-clip-text dark:text-transparent dark:bg-linear-to-b dark:from-light-base dark:via-light-base/80 dark:to-light-base/10',
                        )}
                    >
                        Previewing slides
                    </div>

                    {/* Action Buttons Placeholder */}
                    <div className="flex gap-x-3">
                        <div
                            className="px-3 py-1.5 rounded-beta bg-light-alpha text-dark-alpha cursor-pointer"
                            onClick={onPreviewClose}
                        >
                            Cancel
                        </div>
                        <div className="px-3 py-1.5 rounded-beta bg-alpha text-light-alpha cursor-pointer">
                            Continue
                        </div>
                    </div>
                </div>

                {/* TITLE SKELETON */}
                <div className="w-full h-[66px] rounded-beta border border-neutral-700 bg-neutral-800/50 animate-pulse flex items-center justify-center">
                    <div className="h-6 w-1/3 bg-neutral-700/50 rounded-md" />
                </div>

                {/* CONTENT SKELETON */}
                <div className="h-full flex items-start gap-x-3">
                    {/* QUESTIONS SIDEBAR LIST (Simulating 4 slides) */}
                    <div className="h-85 flex flex-col gap-y-3 shrink-0">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="w-30 flex items-end gap-x-2">
                                {/* Number */}
                                <div className="h-4 w-3 bg-neutral-800 rounded animate-pulse mb-1" />
                                {/* Thumbnail */}
                                <div
                                    className={cn(
                                        'w-full aspect-video rounded-[8px] bg-neutral-800 animate-pulse',
                                        'border border-neutral-800',
                                    )}
                                />
                            </div>
                        ))}
                    </div>

                    {/* MAIN CANVAS SKELETON */}
                    <div className="w-150">
                        <div
                            className={cn(
                                'w-full aspect-video rounded-[10px] bg-neutral-800 animate-pulse',
                                'border border-neutral-700',
                            )}
                        />
                    </div>
                </div>
            </div>
        </OpacityBackground>
    );
}
