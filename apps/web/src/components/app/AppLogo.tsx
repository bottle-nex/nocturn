import { cn } from '@/lib/utils';
import Link from 'next/link';
import CatRive from '../ui/CatRive';

export default function AppLogo({
    className,
    size = 32,
    withText = false,
}: {
    className?: string;
    withText?: boolean;
    size?: number;
}) {
    return (
        <Link href={'/'} className={cn('relative', className)}>
            <div
                className={cn(
                    'flex items-center justify-center rounded-full',
                    withText && '-space-x-9',
                )}
                style={{ width: size, height: size }}
            >
                <CatRive useDevicePixelRatio={true} />
                {withText && (
                    <span className="bg-nprimary text-light-alpha text-[18px] h-10 px-4 flex items-center justify-center rounded-full shadow-xs shadow-black/5 mb-2">
                        Nocturn
                    </span>
                )}
            </div>
        </Link>
    );
}
