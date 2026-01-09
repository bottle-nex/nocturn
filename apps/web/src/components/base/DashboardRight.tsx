import { useHomeRendererStore } from '@/store/home/useHomeRendererStore';
import { HomeRendererEnum } from '@/types/homeRendererTypes';
import { motion } from 'framer-motion';
import { JSX } from 'react';
import HomeDashboard from '../home/HomeDashboard';
import HomeMyQuiz from '../home/HomeMyQuiz';
import HomeCreateQuiz from '../home/HomeCreateQuiz';
import HomeAnalytics from '../home/HomeAnalytics';
import HomeWallet from '../home/HomeWallet';
import HomeLeaderboards from '../home/HomeLeaderboards';
import HomeHistory from '../home/HomeHistory';
import HomeSettings from '../home/HomeSettings';
import HomeHelp from '../home/HomeHelp';
import ReviewBackground from '../utility/ReviewBackground';

export default function DashboardRight(): JSX.Element {
    const { value } = useHomeRendererStore();

    function renderDashboard() {
        // Pass the available height to each component
        const containerProps = {
            style: { height: '100%' },
            className: 'h-full',
        };

        switch (value) {
            case HomeRendererEnum.DASHBOARD:
                return <HomeDashboard {...containerProps} />;
            case HomeRendererEnum.MY_QUIZ:
                return <HomeMyQuiz {...containerProps} />;
            case HomeRendererEnum.CREATE_QUIZ:
                return <HomeCreateQuiz {...containerProps} />;
            case HomeRendererEnum.ANALYTICS:
                return <HomeAnalytics {...containerProps} />;
            case HomeRendererEnum.WALLET:
                return <HomeWallet {...containerProps} />;
            case HomeRendererEnum.LEADERBOARD:
                return <HomeLeaderboards {...containerProps} />;
            case HomeRendererEnum.HISTORY:
                return <HomeHistory {...containerProps} />;
            case HomeRendererEnum.SETTINGS:
                return <HomeSettings {...containerProps} />;
            case HomeRendererEnum.HELP:
                return <HomeHelp {...containerProps} />;
            case HomeRendererEnum.REVIEW:
                return <ReviewBackground />;
            default:
                return <div className="h-full">Dashboard</div>;
        }
    }

    return (
        <motion.div
            className="h-screen bg-light-base dark:bg-dark-alpha/30 rounded-tl-xl flex flex-col w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="h-[5rem] flex-shrink-0" />
            <div className="flex-1 dark:bg-dark-alpha/90 bg-neutral-200 border-l-[1px] border-t-[1px] dark:border-neutral-800 border-neutral-300 rounded-tl-xl min-h-0 overflow-hidden">
                {renderDashboard()}
            </div>
        </motion.div>
    );
}
