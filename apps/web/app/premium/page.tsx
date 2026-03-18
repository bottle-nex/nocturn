import PremiumComponent from '@/components/premium/PremiumComponent';
import PremiumPageMain from '@/components/premium/PremiumPageMain';
import PremiumPricingCardComponent from '@/components/premium/PremiumPricingCardComponent';
import LandingCTASection from '@/components/revamp/LandingCTASection';
import LandingTestNav from '@/components/revamp/LandingTestNav';
import PricingComponent from '@/components/revamp/PricingComponent';
import LandingFooter from '@/components/test/LandingFooter';
import { Metadata } from 'next';
import { JSX } from 'react';

export const metadata: Metadata = {
    title: 'Premium | Nocturn',
    description:
        'Unlock premium quizzes and exclusive experiences with Nocturn Premium. AI-powered quiz generation, unlimited participants, advanced analytics, and Solana prize pools.',
};

export default function PremiumPage(): JSX.Element {
    return (
        <div className="overflow-x-hidden w-full relative">
            <main className="min-h-screen w-full bg-light-base dark:bg-dark-alpha text-dark-base dark:text-light-base relative z-10 mb-[60vh] flex flex-col gap-y-15">
                <LandingTestNav />
                <PremiumPageMain />
                <PremiumComponent />
                <PremiumPricingCardComponent />
                <PricingComponent className="pb-32" showHeading={false} />
                <LandingCTASection />
            </main>
            <footer className="fixed bottom-0 left-0 w-full z-0">
                <LandingFooter />
            </footer>
        </div>
    );
}
