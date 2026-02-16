import { Iphone } from '@/components/ui/iphone';

export default function WhyNocturnCard1() {
    return (
        <div className="h-[60vh] w-full max-w-100 shadow-xs shadow-black/5 rounded-4xl bg-[#f2f1f3] flex flex-col py-15 px-12 gap-y-2 relative overflow-hidden">
            <div className="bg-dark-base text-light-base w-fit px-2.5 text-base py-px rounded-xs">
                Build with AI
            </div>
            <div className="text-dark-faded text-[15px] font-extralight tracking-wide">
                Stake-based quiz platform transforms learning into a competitive and rewarding
                experience. Users can create, play, and challenge others in quizzes where knowledge
                meets real stakes.
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-60 h-40 w-80">
                <Iphone src="/images/landing/mobile_template.png" />
            </div>
        </div>
    );
}
