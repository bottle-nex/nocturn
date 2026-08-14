import { Button } from '@/components/ui/button';
import OpacityBackground from '@/components/utility/OpacityBackground';
import UtilityCard from '@/components/utility/UtilityCard';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface FullScreenWarningPanelProps {
    accept: () => void;
    deny: () => void;
}

const points = [
    'Do not exit full-screen mode during the session.',
    'Avoid using the TAB or ESC keys.',
    'You are allowed a maximum of three attempts; further violations will restrict access.',
];

export default function FullScreenWarningPanel({ accept, deny }: FullScreenWarningPanelProps) {
    return (
        <OpacityBackground className="dark:bg-neutral-900/30 backdrop-blur-[1px]">
            <UtilityCard
                className={cn(
                    'bg-neutral-900 border border-neutral-700 shadow-2xl',
                    'rounded-2xl p-8 max-w-2xl w-full mx-auto',
                    'flex flex-col items-start gap-y-6',
                )}
            >
                <div className="flex items-center gap-x-3 w-full">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-neutral-100">
                            Full-Screen Required
                        </h2>
                        <p className="text-sm text-neutral-400 mt-1">
                            Please review these important guidelines
                        </p>
                    </div>
                </div>

                <div className="w-full">
                    <div className="space-y-3">
                        {points.map((point, index) => (
                            <div key={index} className="flex items-start gap-x-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 mt-2 flex-shrink-0" />
                                <p className="text-neutral-300 text-sm leading-relaxed">{point}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full flex justify-end items-center gap-x-3 pt-2">
                    <Button
                        variant="outline"
                        className="bg-red-500 border-neutral-600 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 px-6"
                        onClick={deny}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-red-500 text-neutral-900 hover:bg-neutral-200 px-6 font-medium"
                        onClick={accept}
                    >
                        I Understand
                    </Button>
                </div>
            </UtilityCard>
        </OpacityBackground>
    );
}
