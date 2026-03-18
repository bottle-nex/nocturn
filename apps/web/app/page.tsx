import LandingFooter from '@/components/test/LandingFooter';
import LandingHeroSection from '@/components/revamp/LandingHeroSection';
import LandingTestNav from '@/components/revamp/LandingTestNav';
import ChatBoxCardSection from '@/components/revamp/ChatBoxCardSection';
import LandingCTASection from '@/components/revamp/LandingCTASection';
import LandingPenguinSection from '@/components/revamp/LandingPenguinSection';
import LandingFeaturesSection from '@/components/revamp/LandingFeaturesSection';

export default function Page() {
    return (
        <div className="overflow-x-hidden w-full relative custom-scrollbar">
            <div className="min-h-screen w-full bg-light-alpha relative z-10 flex flex-col items-center mb-[60vh] custom-scrollbar">
                {/* <LandingNavbar /> */}
                <LandingTestNav />
                <LandingHeroSection />
                <ChatBoxCardSection />
                <LandingPenguinSection />
                {/* <LandingCardsSection /> */}
                {/* <LandingPricingComponent showHeading /> */}
                {/* <PremiumPricingCardComponent /> */}
                {/* <SolanaPrizePool /> */}
                <LandingFeaturesSection />
                <LandingCTASection />
            </div>
            <footer className="fixed bottom-0 left-0 w-full z-1">
                <LandingFooter />
            </footer>
        </div>
    );
}
