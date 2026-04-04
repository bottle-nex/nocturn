import AboutFounderSection from "@/components/about/AboutFounderSection";
import AboutHeroSection from "@/components/about/AboutHeroSection";
import LandingFaqSection from "@/components/refactor/LandingFaqSection";
import LandingFooter from '@/components/refactor/LandingFooter';
import LandingNavbarComponent from "@/components/refactor/LandingNavbarComponent";
import SectionDivider from "@/components/utility/SectionDivider";

export default function ClaimRevampPage() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center gap-y-10 bg-light-alpha text-dark-base">
            <LandingNavbarComponent />
            <AboutHeroSection />
            <SectionDivider />
            <AboutFounderSection />
            <SectionDivider />
            <LandingFaqSection />
            <SectionDivider />
            <LandingFooter />
        </div>
    );
}