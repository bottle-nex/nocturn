import { Button } from '@/components/ui/button';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import Image from 'next/image';
import LiveQuizInteractionTicker from '../../../common/LiveQuizInteractionTicker';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { HostScreenEnum } from '@/types/prisma-types';

export default function HostLobbyFooter() {
    const { updateGameSession } = useLiveQuizStore();
    const { participants } = useLiveParticipantsStore();
    const { handleHostQuestionPreviewPageChange } = useWebSocket();

    function handleOnClick() {
        handleHostQuestionPreviewPageChange(HostScreenEnum.QUESTION_PREVIEW);
        updateGameSession?.({ hostScreen: HostScreenEnum.QUESTION_PREVIEW });
    }

    return (
        <div className="absolute bottom-4 left-4 z-100 flex items-center justify-start gap-x-4 w-fit">
            <div className="flex items-center gap-x-2 px-5 py-3 z-[20] bg-light-base dark:bg-dark-base rounded-full">
                <span className="text-dark-primary dark:text-light-base ml-3">
                    Ready to begin ?
                </span>
                <div className="flex -space-x-2">
                    {participants.slice(0, 3).map((participant, idx) => (
                        <div
                            key={idx}
                            className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                        >
                            {participant.avatar && (
                                <Image
                                    src={participant.avatar}
                                    alt={'participant'}
                                    width={32}
                                    height={32}
                                    className="object-cover w-full h-full"
                                />
                            )}
                        </div>
                    ))}
                    {participants.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                            +{participants.length - 3}
                        </div>
                    )}
                </div>
            </div>

            <Button
                className="dark:bg-dark-base dark:text-neutral-100 bg-neutral-300 text-black dark:hover:-translate-y-0.5 z-20 cursor-pointer"
                onClick={handleOnClick}
            >
                Get Started
            </Button>
            <LiveQuizInteractionTicker className="" />
        </div>
    );
}
