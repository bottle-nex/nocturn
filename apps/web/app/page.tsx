import { Features } from '@/components/base/Features';
import Footer from '@/components/root/Footer';
import Navbar from '@/components/root/Navbar';
import LandingSectionTest from '@/components/test/LandingSectionTest';
import BigAnimatedText from '@/components/ui/BigAnimatedText';

export default function Page() {
    return (
        <main className="relative bg-[#f5f4f2] min-h-screen tracking-wider w-screen">
            <Navbar />
            {/* <LandingSection /> */}
            <LandingSectionTest />
            <Features />
            <BigAnimatedText />
            <Footer />
        </main>
    );
}
