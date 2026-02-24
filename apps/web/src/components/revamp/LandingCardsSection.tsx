'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import InformationHeadingSection from './InformationHeadingSection';
import BuildWithAICard from '../test/LandingCardsSectionComponents/BuildWithAiCard';
import CollaborateEffectivelyCard from '../test/LandingCardsSectionComponents/CollaborateEffectivelyCard';

gsap.registerPlugin(ScrollTrigger);

export default function LandingCardsSection() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-between relative max-w-6xl">
            <InformationHeadingSection
                topText="Nocturn Features"
                topTextClassName="text-[#00b4d8]"
                title="Quizzing made simpler."
                description="Learning doesn't have to be hard. With jitter, learning becomes easy, and on top of that you can make money from your knowledge. Can't ask for more, can you.."
                buttonTitle="Connect Wallet"
                buttonRedirectUrl="/home"
                buttonClassName="bg-[#90e0ef] hover:bg-[#90e0ef] text-dark-base w-45"
            />

            <div className="w-full flex flex-col items-center justify-between mt-15 gap-y-10">
                <BuildWithAICard />
                <CollaborateEffectivelyCard />
            </div>
        </div>
    );
}
