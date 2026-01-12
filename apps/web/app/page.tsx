import Footer from '@/components/root/Footer';
import Navbar from '@/components/root/Navbar2';
import FeaturesSection from '@/components/test/FeaturesSection';
import LandingSectionTest from '@/components/test/LandingSectionTest';
import UserTypeSection from '@/components/test/UserTypesSection';
import BigAnimatedText from '@/components/ui/BigAnimatedText';

export default function Page() {
    return (
        <main className="relative bg-black min-h-screen tracking-wider overflow-x-hidden">
            <Navbar />
            <div className="flex flex-col items-center">
                <LandingSectionTest />
                <FeaturesSection />
                <UserTypeSection />
                {/* <Features /> */}
                <BigAnimatedText />
                <Footer />
            </div>
        </main>
    );
}
