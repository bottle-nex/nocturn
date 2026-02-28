import { JSX } from 'react';
import SpectatorQuizResultScreenRenderer from './SpectatorQuizResultScreenRenderer';

export function SpectatorQuizResultScreen(): JSX.Element {
    return (
        <div className="h-full w-full relative flex items-center justify-center z-10">
            <SpectatorQuizResultScreenRenderer />
        </div>
    );
}
