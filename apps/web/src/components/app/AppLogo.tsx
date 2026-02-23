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
        <Link
            href={'/'}
            className={cn(
                className,
            )}
        >
            <div
                className='flex items-center justify-center rounded-full bg-black overflow-hidden'
                style={{ width: size, height: size }}
            >
                <CatRive useDevicePixelRatio={true} size={80} />
            </div>
            {withText && <span className='text-4xl'>Nocturn</span>}
        </Link>
    );
}
