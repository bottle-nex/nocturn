import { JSX } from 'react';
import ParticipantQuizResultScreenRenderer from './ParticipantQuizResultScreenRenderer';

export function ParticipantQuizResultScreen(): JSX.Element {
    return (
        <div className="h-full w-full relative flex items-center justify-center">
            <ParticipantQuizResultScreenRenderer />
        </div>
    );
}
