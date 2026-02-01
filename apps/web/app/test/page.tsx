'use client';

import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

export default function TestPage() {
    const { rive, RiveComponent } = useRive({
        src: '/rive/cat.riv',
        autoplay: true,
        stateMachines: 'State Machine 1',
    });

    const hoverInput = useStateMachineInput(rive, 'State Machine 1', 'isHover');

    const handleMouseEnter = () => {
        if (hoverInput) {
            hoverInput.value = true;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-purple-50 to-blue-50 dark:from-neutral-950 dark:to-neutral-900 p-8">
            <div className="w-200 h-150" onClick={handleMouseEnter}>
                <RiveComponent />
            </div>
        </div>
    );
}
