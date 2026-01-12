import { LandingLeftSection } from './LandingLeftSection';
import LandingRightSection from './LandingRightSection';

export default function LandingSectionTest() {
    return (
        <section className="relative min-h-screen w-full bg-gamma flex items-center justify-center p-4 overflow-hidden">
            <div className="max-w-360 w-full grid grid-cols-1 lg:grid-cols-12 gap-20 items-center relative z-10 text-dark-base">
                <LandingLeftSection />
                <LandingRightSection />
            </div>
        </section>
    );
}
