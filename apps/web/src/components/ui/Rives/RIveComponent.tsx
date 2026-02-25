'use client';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

interface RiveComponentProps {
    useDevicePixelRatio?: boolean;
    url: string;
    stateMachines?: string;
    animationName?: string[];
}

export default function RiveComponent({
    useDevicePixelRatio = true,
    url,
    stateMachines,
    animationName,
}: RiveComponentProps) {
    const { RiveComponent } = useRive(
        {
            src: url,
            stateMachines: stateMachines,
            animations: animationName,
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
