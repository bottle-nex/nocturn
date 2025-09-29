import { cn } from '@/lib/utils';
import HeadAndSubHead from '../content/HeadAndSubHead';
import { HomeDashboardProps } from './HomeDashboard';

export default function HomeLeaderboards({ style, className }: HomeDashboardProps) {
    return (
        <div className={cn('', className)} style={style}>
            <HeadAndSubHead heading="Leaderboards" subHeading="See the top quizzers and quizzees" />
        </div>
    );
}
