import { cn } from '@/lib/utils';
import { Major_Mono_Display } from 'next/font/google';
import NocturnLogo from '../ui/svg/NocturnLogo';
import Link from 'next/link';

const major_mono_display = Major_Mono_Display({
    subsets: ['latin'],
    display: 'swap',
    weight: ['400'],
});

export default function AppLogo({ className }: { className?: string }) {
    return (
        <Link
            href={'/'}
            className={cn(
                'flex items-center justify-start gap-x-4 cursor-pointer group z-20',
                className,
            )}
        >
            <span
                className={`text-[22px] text-neutral-900 dark:text-light-base font-medium tracking-wide flex items-center justify-center ${major_mono_display.className}`}
            >
                N
                {
                    <span className="translate-y-[7px]">
                        <NocturnLogo />
                    </span>
                }
                turn
            </span>
        </Link>
    );
}
