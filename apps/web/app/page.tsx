import LandingFooter from '@/components/test/LandingFooter';
import LandingHeroSection from '@/components/revamp/LandingHeroSection';
import LandingTestNav from '@/components/revamp/LandingTestNav';
import ChatBoxCardSection from '@/components/revamp/ChatBoxCardSection';
import LandingFeaturesSection from '@/components/revamp/LandingFeaturesSection';
import LandingCardsSection from '@/components/revamp/LandingCardsSection';
import LandingCTASection from '@/components/revamp/LandingCTASection';
import LandingPricingComponent from '@/components/revamp/LandingPricingComponent';

export default function Page() {
    return (
        <div className="overflow-x-hidden w-full relative">
            <div className="min-h-screen w-full bg-white relative z-10 flex flex-col items-center mb-[60vh] gap-y-30">
                {/* <LandingNavbar /> */}
                <LandingTestNav />
                {/* <LandingSection /> */}
                <LandingHeroSection />
                <ChatBoxCardSection />
                <LandingFeaturesSection />
                <LandingCardsSection />
                <LandingPricingComponent showHeading />
                {/* <InstructionsSection /> */}
                {/* <FeaturesSection /> */}
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
