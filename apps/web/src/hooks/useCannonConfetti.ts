import { useEffect } from "react";
import confetti from "canvas-confetti";

interface UseCannonConfettiOptions {
    duration?: number;
    colors?: string[];
    particleCount?: number;
    spread?: number;
    startVelocity?: number;
}

export function useCannonConfetti({
    duration = 5000,
    colors = ["#ff0505", "#ffe100", "#22ff00", "#0011ff"],
    particleCount = 4,
    spread = 55,
    startVelocity = 60,
}: UseCannonConfettiOptions = {}) {
    useEffect(() => {
        const end = Date.now() + duration;
        const frame = () => {
            if (Date.now() > end) return;
            confetti({
                particleCount,
                angle: 60,
                spread,
                startVelocity,
                origin: { x: 0, y: 0.5 },
                colors,
            });
            confetti({
                particleCount,
                angle: 120,
                spread,
                startVelocity,
                origin: { x: 1, y: 0.5 },
                colors,
            });
            requestAnimationFrame(frame);
        };
        frame();
    }, [duration, colors, particleCount, spread, startVelocity]);
}
