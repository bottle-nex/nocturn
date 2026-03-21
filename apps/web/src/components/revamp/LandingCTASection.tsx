'use client';
import { Button } from '../ui/button';
import RiveComponent from '../ui/Rives/RIveComponent';
import { FiArrowUpRight } from 'react-icons/fi';

export default function LandingCTASection() {
    return (
        <section className="h-130 w-full relative mt-30">
            <div className="relative h-full overflow-hidden flex justify-between p-8 gap-8 ring-1 ring-black/10 shadow-xs shadow-black/5 bg-[#FFD400]">
                <div className="h-full w-full bg-[#FFD400] p-10 flex justify-between rounded-[10px]">
                    <article className="w-[60%] h-full flex flex-col justify-between">
                        <div className="flex flex-col gap-y-5">
                            <h2 className="text-7xl font-bold text-dark-alpha leading-none tracking-tight">
                                Ready to create
                                <br />
                                your first quiz?
                            </h2>
                            <p className="text-dark-base/60 text-xl max-w-sm leading-relaxed">
                                Build engaging quizzes in minutes, share with anyone, and watch the
                                scores roll in. No setup needed.
                            </p>
                        </div>
                        <Button className="w-50 h-15 text-xl rounded-full flex items-center gap-x-2 bg-light-alpha hover:bg-light-alpha hover:-translate-y-0.5 active:scale-95 text-dark-base transition-all transform duration-200">
                            Start for free
                            <FiArrowUpRight className="size-5" />
                        </Button>
                    </article>
                    <aside className="relative h-full w-[50%] flex flex-col p-10 gap-y-3">
                        <div className="absolute -bottom-110 left-1/2 -translate-x-1/2 h-300 w-300">
                            <RiveComponent
                                url="/rive/meeples.riv"
                                animationName={['Clouds', 'Meeples']}
                            />
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}