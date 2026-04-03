import LandingNavbarComponent from '@/components/refactor/LandingNavbarComponent';
import AIGenHeroSection from '@/components/resources/ai-generation/AIGenHeroSection';

export default function AiGenerationPage() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center gap-y-10 bg-light-alpha">
            <LandingNavbarComponent />
            <AIGenHeroSection />
        </div>
    );
}
