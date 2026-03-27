import LandingCardsComponent from '@/components/refactor/LandingCardsComponent';
import LandingFaqSection from '@/components/refactor/LandingFaqSection';
import LandingHeroSection from '@/components/refactor/LandingHeroSection';
import LandingNavbarComponent from '@/components/refactor/LandingNavbarComponent';

export default function Revamp() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center gap-y-10 bg-white">
            <LandingNavbarComponent />
            <LandingHeroSection />
            <LandingCardsComponent />
            <LandingFaqSection />
        </div>
    );
}
