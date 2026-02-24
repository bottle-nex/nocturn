'use client';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { cn } from '@/lib/utils';

interface InformationHeadingSectionProps {
    topText: string;
    topTextClassName: string;

    title: string;
    description: string;

    buttonTitle: string;
    buttonRedirectUrl: string;
    buttonClassName: string;

    className?: string;
}

export default function InformationHeadingCenterSection({
    className,
    topText,
    topTextClassName,
    title,
    description,
    buttonTitle,
    buttonRedirectUrl,
    buttonClassName,
}: InformationHeadingSectionProps) {
    const router = useRouter();
    const { session } = useUserSessionStore();

    return (
        <div className={cn('w-full flex flex-col items-center gap-y-6 z-10', className)}>
            <div className={cn('text-xl tracking-normal', topTextClassName)}>{topText}</div>

            <div className="text-6xl text-dark-base/90 font-semibold max-w-md">{title}</div>

            <div className="text-dark-base/50 text-[22px] max-w-xl leading-[1.3] text-center">
                {description}
            </div>

            <Button
                onClick={() => {
                    if (!session?.user.token) return;
                    router.push(`${buttonRedirectUrl}`);
                }}
                className={cn(
                    'text-dark-base/80',
                    'rounded-full',
                    'w-30 h-11',
                    'pt-1.5',
                    'text-xl font-normal',
                    'flex justify-center items-center',
                    'tracking-normal',
                    'active:scale-95',
                    'transition-all transform duration-250',
                    'hover:-translate-y-px',
                    buttonClassName,
                )}
            >
                {buttonTitle}
            </Button>
        </div>
    );
}
