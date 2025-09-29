'use client';

export default function AnimatedSvgCircles() {
    return (
        <div className="w-full">
            <div className="max-w-xl w-full h-[12rem] relative">
                {/* Inner circle */}
                <div
                    className="rounded-full 
                        bg-neutral-100 dark:bg-[#1e1e1e] 
                        transition-colors duration-300
                        w-[18rem] h-[18rem] 
                        absolute -bottom-[110%] left-1/2 -translate-x-1/2 
                        animate-scalePulse delay-0 z-20"
                />
                {/* Middle circle */}
                <div
                    className="rounded-full 
                        bg-neutral-200 dark:bg-[#1e1e1e]/50 
                        transition-colors duration-300
                        w-[23rem] h-[23rem] 
                        absolute -bottom-[138%] left-1/2 -translate-x-1/2 
                        animate-scalePulse delay-700 z-10"
                />
                {/* Outer circle */}
                <div
                    className="rounded-full 
                        bg-neutral-300/80 dark:bg-[#1e1e1e]/30 
                        transition-colors duration-300
                        w-[27rem] h-[27rem] 
                        absolute -bottom-[157%] left-1/2 -translate-x-1/2 
                        animate-scalePulse delay-1400 z-0"
                />
            </div>
        </div>
    );
}
