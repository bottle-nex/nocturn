import { cn } from '@/lib/utils';

interface SettingsHeaderComponentProps {
    title: string;
    description: string;
    className?: string;
}

export default function SettingsHeaderComponent({
    title,
    description,
    className,
}: SettingsHeaderComponentProps) {
    return (
        <div className={cn('flex flex-col px-8 -space-y-0.5', className)}>
            <h2 className="text-[17px] text-dark-base/80 dark:text-light-base/70">{title}</h2>
            <p className="text-[13px] text-dark-base/60 dark:text-white/35 tracking-wide">
                {description}
            </p>
        </div>
    );
}
