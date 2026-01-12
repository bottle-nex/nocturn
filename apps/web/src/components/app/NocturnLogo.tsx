import { cn } from '@/lib/utils';
import { Audiowide } from 'next/font/google';

const audio_wide = Audiowide({
    subsets: ['latin'],
    weight: ['400'],
});

interface NocturnLogoProps {
    className?: string;
}

export default function NocturnLogo({ className }: NocturnLogoProps) {
    return (
        <div className={cn('text-gamma font-bold text-3xl', audio_wide.className, className)}>
            nocturn
        </div>
    );
}
