import HeadAndSubHead from '../content/HeadAndSubHead';
import AllQuizComponent from '../base/AllQuizComponent';
import { HomeDashboardProps } from './HomeDashboard';
import { cn } from '@/lib/utils';

export default function HomeMyQuiz({ style, className }: HomeDashboardProps) {
    return (
        <div className={cn('flex flex-col', className)} style={style}>
            <HeadAndSubHead
                heading="My Quizzes"
                subHeading="Manage your quizzes, analytics, and more"
            />
            <AllQuizComponent />
        </div>
    );
}
