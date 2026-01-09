import { TbPlus } from 'react-icons/tb';
import HeadAndSubHead from '../content/HeadAndSubHead';
import UtilityCard from '../utility/UtilityCard';
import { HomeDashboardProps } from './HomeDashboard';
import { cn } from '@/lib/utils';

export default function HomeCreateQuiz({ style, className }: HomeDashboardProps) {
    return (
        <div className={cn('flex flex-col items-start justify-start', className)} style={style}>
            <HeadAndSubHead
                heading="Create Quiz"
                subHeading="Manage your quizzes, analytics, and more"
            />

            <div className="mt-4">
                <UtilityCard className="w-full aspectshadow-md border border-dashed transition-all duration-300 ease-in-out hover:shadow-lg relative overflow-hidden p-0 m-0 rounded-xl flex items-center justify-center min-w-[20rem] min-h-[10rem] max-h-[10rem] max-w-[20rem] hover:scale-105">
                    <div className="flex items-center justify-center gap-x-2">
                        <TbPlus />
                        <div className="text-xs dark:text-light-base text-dark-alpha tracking-wide">
                            create quiz
                        </div>
                    </div>
                </UtilityCard>
            </div>
        </div>
    );
}
