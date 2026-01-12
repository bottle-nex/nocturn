import Navbar from '@/components/root/Navbar2';
import Footer from '@/components/root/Footer';
import NocturnFeatures from '@/components/test/NocturnFeatures';
import FeaturesSection from '@/components/test/FeaturesSection';
import UserTypeSection from '@/components/test/UserTypesSection';
import BigAnimatedText from '@/components/ui/BigAnimatedText';
import { LandingSectionTest } from '@/components/test/LandingSectionTest';

export default function Page() {
    return (
        <div className="min-h-screen overflow-x-hidden w-full bg-black relative">
            <Navbar />
            <LandingSectionTest />
            <div className="-mt-[100vh] relative z-20">
                <NocturnFeatures />
            </div>
            <FeaturesSection />
            <UserTypeSection />
            <BigAnimatedText />
            <Footer />
        </div>
    );
}
