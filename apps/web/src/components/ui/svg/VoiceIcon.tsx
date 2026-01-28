import { cn } from '@/lib/utils';

interface VoiceIconProps {
    size?: number;
    className?: string;
}

export default function VoiceIcon({ size = 24, className = '' }: VoiceIconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={cn('block', className)}
            aria-hidden
        >
            <rect x="3.5" y="7.5" width="2.5" height="9" rx="1.25" />
            <rect x="8.5" y="4" width="2.5" height="16" rx="1.25" />
            <rect x="13.5" y="5.5" width="2.5" height="13" rx="1.25" />
            <rect x="18.5" y="7.5" width="2.5" height="9" rx="1.25" />
        </svg>
    );
}
