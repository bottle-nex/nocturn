// import NocturnPerksSection from '@/components/test/NocturnPerksSection';
// import NocturnUsersSection from '@/components/test/NocturnUsersSection';
// import NocturnFeaturesSection from '@/components/test/NocturnFeaturesSection';
// import NocturnLandingSection from '@/components/test/NocturnLandingSection';
// import BigAnimatedText from '@/components/ui/BigAnimatedText';
import LandingNavbar from '@/components/revamp/LandingNavbar';
import RevampSection from '@/components/revamp/RevampSection';
import FeaturesSection from '@/components/test/FeaturesSection';
import InstructionsSection from '@/components/test/InstructionsSection';
import PricingComponent from '@/components/revamp/PricingComponent';
import BigAnimatedText from '@/components/ui/BigAnimatedText';
import Footer from '@/components/root/Footer';
import HeroSection from '@/components/revamp/HeroSection';
import LandingSection from '@/components/test/LandingSection';

export default function Page() {
    return (
        <div className="min-h-screen overflow-x-hidden w-full bg-white relative flex flex-col items-center">
            {/* <Navbar />
            <NocturnLandingSection />
            <NocturnPerksSection />
            <NocturnFeaturesSection />
            <Footer /> */}
            {/* <NavbarTest /> */}
            <LandingNavbar />
            <LandingSection />
            <RevampSection />
            <FeaturesSection />
            <InstructionsSection />
            {/* <LandingCardComponent /> */}
            <HeroSection />
            <PricingComponent />
            <BigAnimatedText />
            {/* <LandingHeroSection /> */}
            {/* <Footer /> */}
            {/* <NocturnFeaturesSection /> */}
            <Footer />
        </div>
    );
}
