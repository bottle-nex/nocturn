'use client';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

interface CatRiveProps {
    size?: number;
    useDevicePixelRatio?: boolean;
}

export default function CatRive({ size = 32, useDevicePixelRatio = true }: CatRiveProps) {
    const { RiveComponent } = useRive(
        {
            src: '/rive/logo.riv',
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

    const scale = size / 300;

    return (
        <div className='mt-8 -ml-2' style={{ width: size, height: size, overflow: 'hidden' }}>
            <div
                style={{
                    width: 300,
                    height: 300,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                }}
            >
                <RiveComponent />
            </div>
        </div>
    );
}
