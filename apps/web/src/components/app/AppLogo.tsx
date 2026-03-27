import { cn } from '@/lib/utils';
import Link from 'next/link';
import CatRive from '../ui/Rives/CatRive';
import { audio } from '../test/LandingFooter';

export default function AppLogo({
    className,
    size = 32,
    withText = false,
    textColor,
}: {
    className?: string;
    withText?: boolean;
    size?: number;
    textColor?: string;
}) {
    return (
        <Link href={'/'} className={cn('relative', className)}>
            <div
                className={cn('flex items-center justify-center rounded-full relative')}
                style={{ width: size, height: size }}
            >
                <CatRive useDevicePixelRatio={true} />
                {withText && (
                    <div
                        className={cn(
                            'absolute text-dark-alpha  dark:text-light-alpha flex flex-col -right-7 -space-y-1 h-9 -mt-3',
                            textColor,
                        )}
                    >
                        <div className={cn('font-semibold text-base', audio.className)}>
                            Nocturn
                        </div>
                        <div className={cn('text-[13px] opacity-70')}>Play Bold</div>
                    </div>
                )}
                {/* <span className="text-dark-base text-2xl h-10 px-4 flex items-center justify-center font-semibold mb-1">
                        Nocturn
                    </span> */}
            </div>
        </Link>
    );
}
