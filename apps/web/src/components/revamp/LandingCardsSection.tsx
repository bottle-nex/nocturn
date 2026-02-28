'use client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import InformationHeadingSection from './InformationHeadingSection';
import LandingRivCard from '../test/LandingCardsSectionComponents/LandingRivCard';

gsap.registerPlugin(ScrollTrigger);

export default function LandingCardsSection() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-between relative max-w-6xl">
            <InformationHeadingSection
                topText="Nocturn Features"
                topTextClassName="text-[#5d97dd]"
                title="Quizzing made simpler."
                description="Learning doesn't have to be hard. With jitter, learning becomes easy, and on top of that you can make money from your knowledge. Can't ask for more, can you.."
                buttonTitle="Connect Wallet"
                buttonRedirectUrl="/home"
                buttonClassName="bg-[#B2D4FF] hover:bg-[#B2D4FF] text-dark-base w-45 shadow-[inset_0px_2px_1.5px_rgba(0,0,0,0.10)]"
            />

            <div className="w-full flex flex-col items-center justify-between mt-15 gap-y-10">
                {landingRivCardValues.map((riv) => (
                    <LandingRivCard
                        key={riv.title}
                        title={riv.title}
                        description={riv.description}
                        rivUrl={riv.rivUrl}
                        rivClassName={riv.rivClassName}
                        stateMachines={riv.stateMachines}
                        className={riv.className}
                    />
                ))}
            </div>
        </div>
    );
}

const landingRivCardValues = [
    {
        title: 'Build With AI',
        description:
            'Stake-based quiz platform transforms learning into a competitive and rewarding experience. Users can create, play, and challenge others in quizzes where knowledge meets real stakes.',
        rivUrl: '/rive/aiBot.riv',
        rivClassName: 'h-80 w-80',
        className: 'bg-[#b2d4ff]',
    },
    {
        title: 'Collaborate',
        description:
            ' Turn quiz creation into a shared experience. Invite collaborators, brainstorm together, and watch the quiz evolve live, fast and interactive, with ideas                   flowing seamlessly as everyone builds it together.',
        rivUrl: '/rive/people.riv',
        rivClassName: 'h-100 w-100',
        className: 'bg-[#ffef7c]',
    },
    {
        title: 'Add prize pool',
        description:
            ' Turn quiz creation into a shared experience. Invite collaborators, brainstorm together, and watch the quiz evolve live, fast and interactive, with ideas                   flowing seamlessly as everyone builds it together.',
        rivUrl: '/rive/mobile.riv',
        rivClassName: 'h-125 w-125 -right-8',
        stateMachines: 'social media state machine',
        className: 'bg-[#d5bcff]',
    },
];
