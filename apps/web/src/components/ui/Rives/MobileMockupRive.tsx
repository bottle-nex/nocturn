'use client';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

interface MobileMockupProps {
    useDevicePixelRatio?: boolean;
}

export default function MobileMockupRive({ useDevicePixelRatio = true }: MobileMockupProps) {
    const { RiveComponent } = useRive(
        {
            src: '/rive/aiBot.riv',
            stateMachines: 'State Machine 1',
            autoplay: true,
            layout: new Layout({
                fit: Fit.Contain,
                alignment: Alignment.Center,
            }),
        },
        {
            shouldResizeCanvasToContainer: true,
            useDevicePixelRatio,
        },
    );

    return <RiveComponent />;
}
