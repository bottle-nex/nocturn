import SectionDivider from '@/components/utility/SectionDivider';
import AICreateCard from './HeroSectionCards/AICreateCard';
import BeginnerGuideCard from './HeroSectionCards/BeginnerGuideCard';
import DifficultyCard from './HeroSectionCards/DifficultyCard';
import ManualEditCard from './HeroSectionCards/ManualEditCard';
import LandingSectionHeader from '@/components/refactor/LandingSectionHeader';

export default function AIGenHeroSection() {
    return (
        <main className="">
            <div className="flex flex-row items-start justify-center w-full max-w-270 mt-32">
                <AICreateCard />
                <BeginnerGuideCard />
                <DifficultyCard />
                <ManualEditCard />
            </div>
            <SectionDivider className="my-24" />
            <section className="w-full">
                <LandingSectionHeader
                    heading="Your shortcut to host quick quizzes in less time"
                    subheading="Create quizzes manually or let Nocturn AI generate them instantly with all the tweaks you need."
                />
            </section>
        </main>
    );
}
