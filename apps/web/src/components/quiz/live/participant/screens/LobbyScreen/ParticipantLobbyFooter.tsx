import Image from 'next/image';
import LiveQuizInteractionTicker from '../../../common/LiveQuizInteractionTicker';
import { useLiveParticipantsStore } from '@/store/live-quiz/useLiveParticipantsStore';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';

export default function ParticipantLobbyFooter() {
    const { participants } = useLiveParticipantsStore();
    const { quiz } = useLiveQuizStore();
    const theme = quiz.template;
    return (
        <div className="absolute bottom-4 left-4 z-100 flex items-center justify-start gap-x-4">
            <div
            className="flex items-center gap-x-2 px-5 py-3 z-20 rounded-full"
            style={{
                backgroundColor: theme.itemsColor ?? "#000000"
            }}
            >
                <span className="text-dark-alpha dark:text-light-base ml-3">Ready to begin ?</span>
                <div className="flex -space-x-2">
                    {participants.slice(0, 3).map((participant, idx) => (
                        <div
                            key={idx}
                            className="w-8 h-8 rounded-full border-2 border-white overflow-hidden"
                        >
                            {participant.avatar && (
                                <Image
                                    src={participant.avatar}
                                    alt={'rishi'}
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
            <LiveQuizInteractionTicker />
        </div>
    );
}
