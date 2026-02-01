import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react';

interface ToolTipComponentProps {
    children: React.ReactNode;
    content: React.ReactNode;
    duration?: number;
    className?: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

export default function ToolTipComponent({
    children,
    className,
    duration = 300,
    content,
    side = 'bottom',
}: ToolTipComponentProps) {
    return (
        <TooltipProvider delayDuration={duration}>
            <Tooltip>
                <TooltipTrigger asChild>{children}</TooltipTrigger>
                <TooltipContent className={className} side={side} sideOffset={5}>
                    <span>{content}</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
