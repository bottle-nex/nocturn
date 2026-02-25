import RiveComponent from '@/components/ui/Rives/RIveComponent';
import { cn } from '@/lib/utils';

interface LandingRivCardProps {
    title: string;
    description: string;
    rivUrl: string;
    stateMachines?: string;
    rivClassName?: string;
    className?: string;
}

export default function LandingRivCard({
    title,
    description,
    rivUrl,
    stateMachines,
    rivClassName,
    className,
}: LandingRivCardProps) {
    return (
        <div
            className={cn(
                'h-105 w-full shadow-xs shadow-black/5 rounded-2xl bg-[#F6F6F7] flex justify-between items-center p-15 gap-y-2 relative overflow-hidden shrink-0',
                className,
            )}
        >
            <div className="flex flex-col max-w-xl gap-y-5 h-full justify-center">
                <div className="text-dark-base w-fit text-[3.5rem] rounded-xs font-semibold">
                    {title}
                </div>
                <div className="text-dark-base/70 text-[21px] font-extralight tracking-wide">
                    {description}
                </div>
            </div>
            <div
                className={cn(
                    'absolute top-1/2 -translate-y-1/2 right-15 h-80 w-80 ',
                    rivClassName,
                )}
            >
                <RiveComponent useDevicePixelRatio url={rivUrl} stateMachines={stateMachines} />
            </div>
        </div>
    );
}
