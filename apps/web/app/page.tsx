import Navbar from '@/components/root/Navbar2';
import Footer from '@/components/root/Footer';
import BigAnimatedText from '@/components/ui/BigAnimatedText';
import NocturnPerksSection from '@/components/test/NocturnPerksSection';
import NocturnUsersSection from '@/components/test/NocturnUsersSection';
import NocturnFeaturesSection from '@/components/test/NocturnFeaturesSection';
import NocturnLandingSection from '@/components/test/NocturnLandingSection';

export default function Page() {
    return (
        <div className="min-h-screen overflow-x-hidden w-full bg-black relative">
            <Navbar />

            <NocturnLandingSection />

            <div className="-mt-[100vh] relative z-20">
                <NocturnPerksSection />
            </div>
            <BigAnimatedText />
            <NocturnUsersSection />
            <NocturnFeaturesSection />
            <Footer />
        </div>
    );
}
