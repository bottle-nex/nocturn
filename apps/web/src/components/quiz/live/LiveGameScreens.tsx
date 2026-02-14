import { JSX } from 'react';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { LivePage, useSocketActionStore } from '@/store/socket.actions/useSocketActionStore';
import CanvasAccents from '@/components/utility/CanvasAccents';
import LiveUserRendererScreens from './LiveUserRendererScreens';

export default function LiveGameScreens(): JSX.Element {
    const { state } = useSocketActionStore();
    const { quiz } = useLiveQuizStore();
    function renderScreens() {
        switch (state) {
            case LivePage.SPECTATOR_LIMIT_REACHED:
                return (
                    <div className="h-full w-full flex items-center justify-center">
                        <h1 className="text-2xl font-bold">
                            Spectator limit reached. Please try again later.
                        </h1>
                    </div>
                );

            case LivePage.LIVE:
                return <LiveUserRendererScreens />;

            default:
                return <div>Unknown state</div>;
        }
    }
    return (
        <main className="h-screen w-screen relative">
            <CanvasAccents
                design={quiz.template?.accentType}
                accentColor={quiz.template?.accentColor}
            />
            {renderScreens()}
        </main>
    );
}
