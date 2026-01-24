import Footer from '@/components/root/Footer';
// import NocturnPerksSection from '@/components/test/NocturnPerksSection';
// import NocturnUsersSection from '@/components/test/NocturnUsersSection';
// import NocturnFeaturesSection from '@/components/test/NocturnFeaturesSection';
// import NocturnLandingSection from '@/components/test/NocturnLandingSection';
// import BigAnimatedText from '@/components/ui/BigAnimatedText';
import NavbarTest from '@/components/root/NavbarTest';
import LandingHeroSection from '@/components/revamp/LandingHeroSection';

export default function Page() {
    return (
        <div className="min-h-screen overflow-x-hidden w-full bg-white relative flex flex-col items-center">
            {/* <Navbar />
            <NocturnLandingSection />
            <NocturnPerksSection />
            <BigAnimatedText />
            <NocturnFeaturesSection />
            <Footer /> */}
            <NavbarTest />
            <LandingHeroSection />
            {/* <NocturnUsersSection /> */}
            <Footer />
            {/* <NocturnFeaturesSection /> */}
        </div>
    );
}
