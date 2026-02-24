'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import WhyNocturnCard1 from '../test/WhyNocturnCards/WhyNocturnCard1';
import WhyNocturnCard2 from '../test/WhyNocturnCards/WhyNocturnCard2';
import WhyNocturnCard3 from '../test/WhyNocturnCards/WhyNocturnCard3';
import InformationHeadingSection from './InformationHeadingSection';

gsap.registerPlugin(ScrollTrigger);

export default function LandingCardsSection() {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-between relative max-w-6xl">
            <InformationHeadingSection
                topText="Nocturn Features"
                topTextClassName="text-[#cda542]"
                title="Quizzing made simpler."
                description="Learning doesn't have to be hard. With jitter, learning becomes easy, and on top of that you can make money from your knowledge. Can't ask for more, can you.."
                buttonTitle="Connect Wallet"
                buttonRedirectUrl="/home"
                buttonClassName="bg-[#fff1ce] hover:bg-[#dd2d4a] text-dark-base w-45"
            />

            <div className="w-full flex items-center justify-between mt-10">
                <WhyNocturnCard1 />
                <WhyNocturnCard2 />
                <WhyNocturnCard3 />
            </div>
        </div>
    );
}
