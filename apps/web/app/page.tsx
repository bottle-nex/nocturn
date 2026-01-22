import Navbar from '@/components/root/Navbar2';
import Footer from '@/components/root/Footer';
import NocturnPerksSection from '@/components/test/NocturnPerksSection';
import NocturnUsersSection from '@/components/test/NocturnUsersSection';
import NocturnFeaturesSection from '@/components/test/NocturnFeaturesSection';
import NocturnLandingSection from '@/components/test/NocturnLandingSection';
import BigAnimatedText from '@/components/ui/BigAnimatedText';

export default function Page() {
    return (
        <div className="min-h-screen overflow-x-hidden w-full bg-white relative flex flex-col items-center">
            <Navbar />
            <NocturnLandingSection />
            <NocturnPerksSection />
            <NocturnUsersSection />
            <NocturnFeaturesSection />
            <BigAnimatedText />
            <Footer />
        </div>
    );
}
