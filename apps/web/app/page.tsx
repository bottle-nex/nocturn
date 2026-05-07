"use client";
import PremiumSubscriptionCards from '@/components/premium/PremiumSubscriptionCards';
import LandingCardsComponent from '@/components/refactor/LandingCardsComponent';
import LandingCollaborateComponent from '@/components/refactor/LandingCollaborateComponent';
import LandingFaqSection from '@/components/refactor/LandingFaqSection';
import LandingFeaturesComponent from '@/components/refactor/LandingFeaturesComponent';
import LandingFooter from '@/components/refactor/LandingFooter';
import LandingHeroSection from '@/components/refactor/LandingHeroSection';
import LandingNavbarComponent from '@/components/refactor/LandingNavbarComponent';
import LandingUsdcSection from '@/components/refactor/LandingUsdcSection';
import LandingUserType from '@/components/refactor/LandingUserType';
import LandingCTASection from '@/components/revamp/LandingCTASection';
import { Button } from '@/components/ui/button';
import SectionDivider from '@/components/utility/SectionDivider';
import { useEffect, useRef, useState } from 'react';













































export default function Page() {
    const [open, setOpen] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    function handleClick() {
        setOpen(!open);
    }

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (sectionRef.current) {
                // @ts-ignore
                if (!sectionRef.current.contains(e.target)) {
                    setOpen(false);
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
    }, [])

    return (
        <div className='h-screen w-screen flex items-center justify-center'>
            <Button onClick={handleClick}>
                click
            </Button>
            {
                open == true ? (
                    <section ref={sectionRef} className='h-80 w-80 bg-red-500'>
                        rishi
                    </section>
                ) : (null)
            }
        </div>
    );
}
