import { LandingLeftSection } from './LandingLeftSection';
import LandingRightSection from './LandingRightSection';

export default function LandingSectionTest() {
    return (
        <section className="relative min-h-screen w-full bg-[#fdfdfd] flex items-center justify-center p-4 overflow-hidden">
            <div className="max-w-[90rem] w-full grid grid-cols-1 lg:grid-cols-12 gap-20 items-center relative z-10">
                <LandingLeftSection />
                <LandingRightSection />
            </div>
        </section>
    );
}
