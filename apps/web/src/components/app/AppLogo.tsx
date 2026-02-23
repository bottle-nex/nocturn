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
                <svg width={40} height={40} viewBox="0 0 214 237" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M106 171H214L143.698 236H106V171Z" fill="#4F46E5" />
                    <path d="M106 91.9462L171 30V105.19L106 165V91.9462Z" fill="#FF477E" />
                    <path d="M14.7368 150.75L28 138V165H0L14.7368 150.75Z" fill="#FFC412" />
                    <path d="M100 165H34V55.917L100 0V165Z" fill="#FF477E" />
                    <path d="M100 237L34 177V172H100V237Z" fill="#4F46F5" />
                </svg>


            </div>
        </Link>
    );
}
