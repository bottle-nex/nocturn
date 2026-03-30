import type { Metadata } from 'next';
import LandingNavbarComponent from '@/components/refactor/LandingNavbarComponent';
import LandingFooter from '@/components/refactor/LandingFooter';
import SectionDivider from '@/components/utility/SectionDivider';
import UsdcHeroSection from '@/components/resources/usdc-integration/UsdcHeroSection';
import UsdcHowItWorksSection from '@/components/resources/usdc-integration/UsdcHowItWorksSection';
import UsdcTrustSection from '@/components/resources/usdc-integration/UsdcTrustSection';
import UsdcDistributionSection from '@/components/resources/usdc-integration/UsdcDistributionSection';
import UsdcClaimSection from '@/components/resources/usdc-integration/UsdcClaimSection';
import UsdcFaqSection from '@/components/resources/usdc-integration/UsdcFaqSection';

export const metadata: Metadata = {
    title: 'USDC Integration | Nocturn',
    description:
        'Learn how Nocturn uses USDC on Solana for transparent, secure quiz prize pools.',
};

export default function UsdcIntegrationPage() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center gap-y-10 bg-light-alpha">
            <LandingNavbarComponent />
            <UsdcHeroSection />
            <SectionDivider />
            <UsdcHowItWorksSection />
            <SectionDivider />
            <UsdcTrustSection />
            <SectionDivider />
            <UsdcDistributionSection />
            <SectionDivider />
            <UsdcClaimSection />
            <SectionDivider />
            <UsdcFaqSection />
            <SectionDivider />
            <LandingFooter />
        </div>
    );
}
