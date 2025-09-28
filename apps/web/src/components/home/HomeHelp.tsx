import { cn } from '@/lib/utils';
import HeadAndSubHead from '../content/HeadAndSubHead';
import { HomeDashboardProps } from './HomeDashboard';

export default function HomeHelp({ style, className }: HomeDashboardProps) {
    return (
        <div className={cn('', className)} style={style}>
            <HeadAndSubHead
                heading="Help & Support"
                subHeading="Manage your quizzes, analytics, and more"
            />
        </div>
    );
}
