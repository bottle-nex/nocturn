import { LivePage, useSocketActionStore } from '@/store/socket.actions/useSocketActionStore';
import { socket_codes } from '@nocturn/types';
import { useLiveParticipantStore } from '@/store/live-quiz/useLiveQuizUserStore';

export default class WebSocketEvents {
    static handle_incoming_socket_code_event(code: number) {
        switch (code) {
            case socket_codes.SPECTATOR_LIMIT_REACHED:
                this.handle_spectator_limit_reached();
                break;
            case socket_codes.KICKED:
                this.handle_participant_kicked();
                break;
            default:
                break;
        }
    }

    static handle_spectator_limit_reached() {
        const socketActionStore = useSocketActionStore.getState();
        socketActionStore.setState(LivePage.SPECTATOR_LIMIT_REACHED);
    }

    static handle_participant_kicked() {
        const { participantData, updateParticipantData } = useLiveParticipantStore.getState();
        if (participantData && !participantData.isKicked) {
            updateParticipantData({ id: participantData.id, isKicked: true });
        }
    }
}
