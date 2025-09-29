import { cleanWebSocketClient } from '@/lib/singleton-socket';
import { useLiveParticipantStore } from '@/store/live-quiz/useLiveQuizUserStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useParticipantWarning = () => {
    const { participantData, removeParticipantData } = useLiveParticipantStore();
    const router = useRouter();

    useEffect(() => {
        if (participantData?.isKicked) {
            router.back();
            cleanWebSocketClient();
            toast.error("You've been kicked!");
            removeParticipantData();
        }
    }, [router, participantData?.isKicked, removeParticipantData]);
};
