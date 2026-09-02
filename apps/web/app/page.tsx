import PremiumSubscriptionCards from '@/components/premium/PremiumSubscriptionCards';
import LandingCardsComponent from '@/components/refactor/LandingCardsComponent';
import LandingCollaborateComponent from '@/components/refactor/LandingCollaborateComponent';
import LandingFaqSection from '@/components/refactor/LandingFaqSection';
import LandingFeaturesComponent from '@/components/refactor/LandingFeaturesComponent';
import LandingFooter from '@/components/refactor/LandingFooter';
import LandingHeroSection from '@/components/refactor/LandingHeroSection';
import LandingNavbarComponent from '@/components/refactor/LandingNavbarComponent';
import LandingUsdcSection from '@/components/refactor/LandingUsdcSection';
import LandingUserType from '@/components/refactor/LandingUserType';
import LandingCTASection from '@/components/revamp/LandingCTASection';
import SectionDivider from '@/components/utility/SectionDivider';

export default function Page() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center gap-y-10 bg-dark-alpha overflow-x-hidden">
            <LandingNavbarComponent />
            <LandingHeroSection />
            <SectionDivider />
            <LandingFeaturesComponent />
            <SectionDivider />
            <LandingCardsComponent />
            <SectionDivider />
            <LandingCollaborateComponent />
            <SectionDivider />
            <LandingUsdcSection />
            <SectionDivider />
            <LandingUserType />
            <PremiumSubscriptionCards />
            <SectionDivider />
            <LandingFaqSection />
            <SectionDivider />
            <LandingCTASection />
            <SectionDivider />
            <LandingFooter />
        </div>
    );
}
