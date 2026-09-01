import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const QueuedStatusIcon = ({ className }: { className?: string }) => (
    <Clock className={cn('size-3', className)} aria-hidden />
);
