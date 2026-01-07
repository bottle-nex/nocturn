import { Features } from '@/components/base/Features';
import Footer from '@/components/test/Footer';
import LandingSection from '@/components/test/LandingSection';
import Navbar from '@/components/test/Navbar';
import BigAnimatedText from '@/components/ui/BigAnimatedText';

export default function Page() {
    return (
        <main className="relative bg-[#f5f4f2] min-h-screen tracking-wider w-screen">
            <Navbar />
            <LandingSection />
            <Features />
            <BigAnimatedText />
            <Footer />
        </main>
    );
}