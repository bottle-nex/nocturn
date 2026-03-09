import LandingFooter from '@/components/test/LandingFooter';
import LandingHeroSection from '@/components/revamp/LandingHeroSection';
import LandingTestNav from '@/components/revamp/LandingTestNav';
import ChatBoxCardSection from '@/components/revamp/ChatBoxCardSection';
import LandingFeaturesSection from '@/components/revamp/LandingFeaturesSection';
import LandingCardsSection from '@/components/revamp/LandingCardsSection';
import LandingCTASection from '@/components/revamp/LandingCTASection';
import PremiumPricingCardComponent from '@/components/premium/PremiumPricingCardComponent';

export default function Page() {
    return (
        <div className="overflow-x-hidden w-full relative custom-scrollbar">
            <div className="min-h-screen w-full bg-light-alpha dark:bg-dark-alpha relative z-10 flex flex-col items-center mb-[60vh] gap-y-30 custom-scrollbar">
                {/* <LandingNavbar /> */}
                <LandingTestNav />
                <LandingHeroSection />
                <ChatBoxCardSection />
                <LandingFeaturesSection />
                <LandingCardsSection />
                {/* <LandingPricingComponent showHeading /> */}
                <PremiumPricingCardComponent />
                {/* <WhyNocturn /> */}
                {/* <PricingComponent
                    className="flex flex-col items-center justify-center pt-48"
                    showHeading
                /> */}
                {/* <BigAnimatedText /> */}
                <LandingCTASection />
            </div>
            <footer className="fixed bottom-0 left-0 w-full z-0">
                <LandingFooter />
            </footer>
        </div>
    );
}
