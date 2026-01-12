import { ReactLenis } from 'lenis/react';

interface LenisProviderProps {
    children: React.ReactNode;
}

export default function LenisProvider({ children }: LenisProviderProps) {
    return (
        <ReactLenis
            root
            options={{
                lerp: 0.075,
                duration: 1.3,
                smoothWheel: true,
                wheelMultiplier: 1.15,
                touchMultiplier: 1.4,
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                autoRaf: true,
            }}
        >
            {children}
        </ReactLenis>
    );
}
