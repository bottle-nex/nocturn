import LaunchGameCard from './LaunchGameCardComponent';

export default function WorkflowCardComponent() {
    return (
        <div className="flex flex-col ring-1 ring-black/10 h-auto sm:h-75 w-full max-w-[440px] rounded-xl overflow-hidden">
            <div className="h-55 bg-[#9896FF] relative flex justify-center pt-7 shrink-0">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, color-mix(in srgb, var(--color-light-base, #fff) 50%, transparent) 1px, transparent 1px)',
                        backgroundSize: '6px 6px',
                        maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
                        WebkitMaskImage:
                            'radial-gradient(ellipse at center, black 30%, transparent 75%)',
                    }}
                />
                <LaunchGameCard />
            </div>
            <div className="h-fit sm:h-20 shrink-0 flex flex-col justify-center px-4 py-2 gap-y-1">
                <div className="text-dark-base/80 text-base">Workflow</div>
                <div className="text-dark-base/50 text-[13px] leading-[1.1]">
                    Not like any other mid quiz applications, nocturn is the one you choose when you
                    really want to prove that knowledge pays.
                </div>
            </div>
        </div>
    );
}
