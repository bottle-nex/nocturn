import LandingNavbarComponent from '@/components/refactor/LandingNavbarComponent';
import LandingFooter from '@/components/refactor/LandingFooter';
import NotFoundHeroSection from '@/components/notFound/NotFoundHeroSection';
import NotFoundFeaturesSection from '@/components/notFound/NotFoundFeaturesSection';
import SectionDivider from '@/components/utility/SectionDivider';
import NotFoundCardsSection from '@/components/notFound/NotFoundCardsSection';

export default function NotFound() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center gap-y-10 bg-light-alpha">
            <LandingNavbarComponent />
            {/* <NotFoundHeroSection /> */}
            <NotFoundFeaturesSection />
            <SectionDivider />
            <NotFoundCardsSection />
            <SectionDivider />
            <LandingFooter />
        </div>
    );
}
