import PremiumFeaturesComponent from '@/components/premium/PremiumFeatureComponent';
import PremiumSubscriptionCards from '@/components/premium/PremiumSubscriptionCards';
import LandingFooter from '@/components/refactor/LandingFooter';
import LandingNavbarComponent from '@/components/refactor/LandingNavbarComponent';
import LandingPenguinSection from '@/components/revamp/LandingPenguinSection';
import SectionDivider from '@/components/utility/SectionDivider';

export default function PremiumPage() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center gap-y-10 bg-light-alpha">
            <section className='max-w-270 mx-auto '>
                <LandingNavbarComponent />
                <LandingPenguinSection />
                <SectionDivider />
                <PremiumFeaturesComponent />
                <SectionDivider />
                <PremiumSubscriptionCards />
                <LandingFooter />
            </section>
        </div>
    );
}
