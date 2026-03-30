import LandingNavbarComponent from '@/components/refactor/LandingNavbarComponent';
import LandingFooter from '@/components/refactor/LandingFooter';
import NotFoundFeaturesSection from '@/components/notFound/NotFoundFeaturesSection';
import SectionDivider from '@/components/utility/SectionDivider';
import NotFoundCardsSection from '@/components/notFound/NotFoundCardsSection';
import NotFoundDiagonalGrid from '@/components/notFound/NotFoundDiagonalGrid';

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center bg-light-alpha">
            <LandingNavbarComponent />

            {/* Hero with diagonal grid background */}
            <div className="relative w-full max-w-270 mx-auto overflow-hidden">
                <NotFoundDiagonalGrid />
                <div className="relative z-10">
                    <NotFoundFeaturesSection />
                </div>
            </div>

            <SectionDivider />
            <NotFoundCardsSection />
            <SectionDivider />
            <LandingFooter />
        </div>
    );
}
