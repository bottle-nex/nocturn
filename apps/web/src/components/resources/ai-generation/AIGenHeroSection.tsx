import AICreateCard from './HeroSectionCards/AICreateCard';
import BeginnerGuideCard from './HeroSectionCards/BeginnerGuideCard';
import DifficultyCard from './HeroSectionCards/DifficultyCard';
import ManualEditCard from './HeroSectionCards/ManualEditCard';

export default function AIGenHeroSection() {
    return (
        <div className="min-h-screen flex w-full max-w-5xl relative pt-30">
            <AICreateCard />
            <BeginnerGuideCard />
            <DifficultyCard />
            <ManualEditCard />
            <div className="absolute bottom-8 left-0 text-7xl text-dark-base flex flex-col gap-y-6">
                <div className="max-w-200 font-semibold">
                    Your shortcut to host quick quizzes in less time
                </div>
                <div className="text-[18px] text-dark-base/60 max-w-xl leading-[1.2]">
                    In nocturn you can create quizzes either manually, or use Nocturn AI to create
                    instant quizzes and serve you on your table with all the tweaks that you need.
                    This thing is addictive.
                </div>
            </div>
        </div>
    );
}
