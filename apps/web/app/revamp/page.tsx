import LandingCardsComponent from '@/components/refactor/LandingCardsComponent';
import LandingCollaborateComponent from '@/components/refactor/LandingCollaborateComponent';
import LandingFaqSection from '@/components/refactor/LandingFaqSection';
import LandingFooter from '@/components/refactor/LandingFooter';
import LandingHeroSection from '@/components/refactor/LandingHeroSection';
import LandingNavbarComponent from '@/components/refactor/LandingNavbarComponent';
import LandingUsdcSection from '@/components/refactor/LandingUsdcSection';
import SectionDivider from '@/components/utility/SectionDivider';

export default function Revamp() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center gap-y-10 bg-light-alpha">
            <LandingNavbarComponent />
            <LandingHeroSection />
            <LandingCardsComponent />
            <SectionDivider />
            <LandingCollaborateComponent />
            <LandingUsdcSection />
            <SectionDivider />
            <LandingFaqSection />
            <SectionDivider />
            <LandingFooter />
        </div>
    );
}
