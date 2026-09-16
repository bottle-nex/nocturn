import { cn } from '@/lib/utils';
import Link from 'next/link';
import CatRive from '../ui/Rives/CatRive';
import { audio } from '../test/LandingFooter';

// cat.riv draws its art at ~32% of the canvas it is given (the rest is
// transparent padding), so the canvas is sized up from the height we actually
// want the cat to be.
const ART_SCALE = 0.32;
// The cat is slightly wider than it is tall.
const ART_ASPECT = 1.13;
// Height of the two-line "Nocturn / Play Bold" wordmark; the cat matches it.
const LOCKUP_HEIGHT = 36;

export default function AppLogo({
    className,
    size = 32,
    withText = false,
    textColor,
}: {
    className?: string;
    withText?: boolean;
    /** Canvas size for the bare cat. Ignored with `withText`, where the cat is
     * locked to the wordmark height. */
    size?: number;
    textColor?: string;
}) {
    const canvas = withText ? Math.round(LOCKUP_HEIGHT / ART_SCALE) : size;
    const artWidth = withText ? Math.round(LOCKUP_HEIGHT * ART_ASPECT) : size;
    const artHeight = withText ? LOCKUP_HEIGHT : size;

    return (
        <Link href={'/'} className={cn('relative inline-flex items-center gap-x-2', className)}>
            <div className="relative shrink-0" style={{ width: artWidth, height: artHeight }}>
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ width: canvas, height: canvas }}
                >
                    <CatRive useDevicePixelRatio={true} />
                </div>
            </div>
            {withText && (
                <div
                    className={cn(
                        'flex flex-col -space-y-1 text-dark-alpha dark:text-light-alpha',
                        textColor,
                    )}
                >
                    <div className={cn('font-semibold text-base', audio.className)}>Nocturn</div>
                    <div className={cn('text-[13px] opacity-70')}>Play Bold</div>
                </div>
            )}
        </Link>
    );
}
