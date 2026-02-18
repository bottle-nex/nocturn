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
        <div className="min-h-screen overflow-x-hidden w-full bg-white relative flex flex-col items-center">
            <LandingNavbar />
            <LandingSection />
            <InstructionsSection />
            <FeaturesSection />
            <WhyNocturn />
            <PricingComponent />
            <BigAnimatedText />
            <LandingFooter />
            {/* <Footer /> */}
        </div>
    );
}
