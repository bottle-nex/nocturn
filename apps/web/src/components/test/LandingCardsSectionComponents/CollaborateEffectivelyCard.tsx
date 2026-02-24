import { Iphone } from '@/components/ui/iphone';

export default function BuildWithAICard() {
    return (
        <div className="h-105 w-full shadow-xs shadow-black/5 rounded-2xl bg-[#F6F6F7] flex justify-between items-center p-15 gap-y-2 relative overflow-hidden shrink-0">
            <div className="flex flex-col gap-y-5 h-full justify-center">
                <div className="text-dark-base w-full text-6xl rounded-xs font-semibold">
                    Collaboration
                </div>
                <div className="text-dark-base/70 text-[22px] font-extralight tracking-wide max-w-xl">
                    Turn quiz creation into a shared experience. Invite collaborators, brainstorm
                    together, and watch the quiz evolve live, fast and interactive, with ideas
                    flowing seamlessly as everyone builds it together
                </div>
            </div>
            <div className="top-60 h-40 w-80">
                <Iphone src="/images/landing/mobile_template.png" />
            </div>
        </div>
    );
}
