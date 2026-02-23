'use client';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

interface CatRiveProps {
    useDevicePixelRatio?: boolean;
}

export default function CatRive({ useDevicePixelRatio = true }: CatRiveProps) {
    const { RiveComponent } = useRive(
        {
            src: '/rive/cat.riv',
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
