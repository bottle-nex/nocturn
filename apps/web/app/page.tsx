import InstructionsSection from '@/components/test/InstructionsSection';
import PricingComponent from '@/components/revamp/PricingComponent';
import BigAnimatedText from '@/components/ui/BigAnimatedText';
import LandingSection from '@/components/test/LandingSection';
import LandingNavbar from '@/components/revamp/LandingNavbar';
import FeaturesSection from '@/components/test/FeaturesSection';
import WhyNocturn from '@/components/test/WhyNocturnComponent';
import LandingFooter from '@/components/test/LandingFooter';

export default function Page() {
    return (
        <div className="overflow-x-hidden w-full relative">
            <div className="min-h-screen w-full bg-white relative z-10 flex flex-col items-center mb-[60vh]">
                <LandingNavbar />
                <LandingSection />
                <InstructionsSection />
                <FeaturesSection />
                <WhyNocturn />
                <PricingComponent />
                <BigAnimatedText />
            </div>
            <footer className="fixed bottom-0 left-0 w-full z-0">
                <LandingFooter />
            </footer>
        </div>
    );
}
