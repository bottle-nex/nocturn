'use client';
import WaitingLobbyAvatars from '../../../common/Avatars';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import JoinQuizCodeTicker from '@/components/quiz/new/JoinquizCodeTicker';
import JoinQuizCodesDropdown from '@/components/quiz/new/JoinQuizCodesDropdown';

export default function HostLobbyRenderer() {
    const { quiz } = useLiveQuizStore();
    const { participants } = useLiveParticipantsStore();
    return (
        <div className="w-full max-h-full flex flex-col relative">
            {/* <JoinQuizCodeTicker
                link={quiz?.spectatorLink}
                spectatorCode={quiz.spectatorCode}
                participantCode={quiz.participantCode}
            /> */}
            <JoinQuizCodesDropdown
                link={quiz?.spectatorLink}
                spectatorCode={quiz.spectatorCode}
                participantCode={quiz.participantCode}
            />
            <WaitingLobbyAvatars participants={participants} />
            <h1 className="absolute left-1/2 -translate-x-1/2 top-20 text-3xl font-extralight w-full text-center tracking-wider">
                {quiz?.title}
            </h1>
        </div>
    );
}
