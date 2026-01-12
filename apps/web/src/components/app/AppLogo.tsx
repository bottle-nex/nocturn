import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function AppLogo({
    className,
    withText,
}: {
    className?: string;
    withText?: boolean;
}) {
    return (
        <Link
            href={'/'}
            className={cn(
                'flex items-center justify-start gap-x-4 cursor-pointer group z-20',
                className,
            )}
        >
            <div className="flex items-center justify-start gap-x-2">
                <Image src={'/icons/nocturn.png'} alt="Nocturn Logo" width={40} height={40} />
                {withText && (
                    <span className="font-bold text-lg text-black dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                        Nocturn
                    </span>
                )}
            </div>
        </Link>
    );
}
