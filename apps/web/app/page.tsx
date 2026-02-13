import InstructionsSection from '@/components/test/InstructionsSection';
import PricingComponent from '@/components/revamp/PricingComponent';
import BigAnimatedText from '@/components/ui/BigAnimatedText';
import Footer from '@/components/root/Footer';
import LandingSection from '@/components/test/LandingSection';
import LandingNavbar from '@/components/revamp/LandingNavbar';

export default function Page() {
    return (
        <div className="min-h-screen overflow-x-hidden w-full bg-white relative flex flex-col items-center">
            {/* <Navbar />
            <Footer /> */}
            {/* <NavbarTest /> */}
            {/* <NocturnPerksSection /> */}
            <LandingNavbar />
            <LandingSection />
            <InstructionsSection />
            {/* <RevampSection /> */}
            {/* <FeaturesSection /> */}
            {/* <LandingCardComponent /> */}
            {/* <HeroSection /> */}
            <PricingComponent />
            <BigAnimatedText />
            {/* <LandingHeroSection /> */}
            {/* <Footer /> */}
            {/* <NocturnFeaturesSection /> */}
            <Footer />
        </div>
    );
}
