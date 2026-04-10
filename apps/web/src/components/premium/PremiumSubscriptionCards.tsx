'use client';
import { BILLING_INTERVAL, SubscriptionTierDTO } from '@nocturn/types';
import { useState, useEffect } from 'react';
import {
    Users,
    CalendarCheck,
    Layers,
    BarChart3,
    Palette,
    Users2,
    Edit3,
    MonitorPlay,
    Star,
    LucideIcon,
} from 'lucide-react';
import LandingSectionHeader from '../refactor/LandingSectionHeader';
import { Button } from '../ui/button';
import PerspectiveCard from '../utility/PerspectiveCard';
import { CREATE_CHECKOUT_URL, GET_TIERS_URL } from '../../../routes/api_routes';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { toast } from '@/lib/toast';
import axios from 'axios';

const iconMap: Record<string, LucideIcon> = {
    Users,
    CalendarCheck,
    Layers,
    BarChart3,
    Palette,
    Users2,
    Edit3,
    MonitorPlay,
    Star,
};

export default function PremiumSubscriptionCards() {
    const [loadingTier, setLoadingTier] = useState<string | null>(null);
    const [tiers, setTiers] = useState<SubscriptionTierDTO[] | null>(null);
    const [tiersLoading, setTiersLoading] = useState<boolean>(true);
    const { session, setOpenSigninModal } = useUserSessionStore();

    useEffect(() => {
        async function fetchTiers() {
            try {
                const response = await axios.get(GET_TIERS_URL);

                if (response.status === 200 && response.data.success) {
                    setTiers(response.data.data);
                } else {
                    setTiers(null);
                }
            } catch (error) {
                console.error('Error fetching tiers:', error);
                setTiers(null);
            } finally {
                setTiersLoading(false);
            }
        }

        fetchTiers();
    }, []);

    if (tiersLoading || !tiers || tiers.length === 0) return null;

    async function handleUpgrade(tierId: string) {
        if (!session?.user) {
            toast.error('Please sign in to upgrade your plan');
            setOpenSigninModal(true);
            return;
        }

        setLoadingTier(tierId);

        try {
            const response = await axios.post(
                CREATE_CHECKOUT_URL,
                {
                    tierId,
                    billingInterval: BILLING_INTERVAL.MONTH,
                },
                {
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                    },
                    withCredentials: true,
                },
            );

            const data = response.data;

            if (response.status === 200 && data.data?.checkoutUrl) {
                window.location.href = data.data.checkoutUrl;
            } else {
                toast.error(data.message || 'Failed to create checkout session');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoadingTier(null);
        }
    }

    return (
        <div className="flex flex-col pt-15 pb-10 items-center w-full">
            <LandingSectionHeader
                heading="Unlock Premium Features"
                subheading="Upgrade your experience with powerful tools and benefits."
            />
            {/* Increased max-width to 7xl for a wider layout */}
            <div className="flex flex-col lg:flex-row gap-y-10 lg:gap-x-10 justify-center w-full max-w-270 mt-15 px-6 xl:px-0">
                {tiers.map((tier) => {
                    const isDark = tier.name === 'PRO';
                    const isLoading = loadingTier === tier.id;
                    const isFree = tier.name === 'FREE';

                    const price = tier.priceMonthly;
                    const priceLabel = isFree ? '/forever' : '/month';
                    const billedLabel = isFree ? 'Get started for free' : 'Billed monthly';

                    const displayedFeatures = [
                        {
                            icon: 'CalendarCheck',
                            label: `${tier.maxQuizzesPerMonth} quizzes/month`,
                        },
                        { icon: 'Layers', label: `${tier.maxActiveQuizzes} active quizzes` },
                        {
                            icon: 'Users',
                            label: `${tier.maxCollaborators} collaborator${tier.maxCollaborators !== 1 ? 's' : ''}`,
                        },
                        {
                            icon: 'BarChart3',
                            label: `${tier.maxAiGenerationsPerMonth} AI generations/month`,
                        },
                        ...(tier.advancedAnalytics
                            ? [{ icon: 'BarChart3', label: 'Advanced analytics' }]
                            : []),
                        ...(tier.advancedTemplates
                            ? [{ icon: 'Layers', label: 'Advanced templates' }]
                            : []),
                        ...(tier.customBranding
                            ? [{ icon: 'Palette', label: 'Custom branding' }]
                            : []),
                        ...(tier.prioritySupport
                            ? [{ icon: 'Users2', label: 'Priority support' }]
                            : []),
                    ].slice(0, 6);

                    return (
                        <PerspectiveCard
                            key={tier.id}
                            /* Increased height to h-72 to match the wider look */
                            className={`w-full h-auto md:h-72 rounded-2xl flex flex-col md:flex-row overflow-hidden relative
                            ${
                                isDark
                                    ? 'bg-[#111110] border border-white/7 shadow-[0_8px_40px_rgba(0,0,0,0.4)]'
                                    : 'bg-white/88 border border-black/9 shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
                            }`}
                        >
                            {/* Increased sidebar width from w-52 to w-64 */}
                            <div
                                className={`w-full md:w-64 shrink-0 flex flex-col justify-between p-8 gap-y-4 md:gap-y-0
                                ${isDark ? 'border-b md:border-b-0 md:border-r border-white/7' : 'border-b md:border-b-0 md:border-r border-black/7'}`}
                            >
                                <div className="flex flex-col">
                                    <span
                                        className={`text-[24px] font-bold tracking-tight leading-none ${isDark ? 'text-[#f0ede8]' : 'text-[#1a1a1a]'}`}
                                    >
                                        {tier.displayName}
                                    </span>
                                    <span
                                        className={`text-[14px] mt-1 ${isDark ? 'text-[#f0ede8]/45' : 'text-[#1a1a1a]/60'}`}
                                    >
                                        membership
                                    </span>
                                </div>

                                <div>
                                    <div
                                        className={`flex items-end gap-1 ${isDark ? 'text-[#f0ede8]' : 'text-[#1a1a1a]'}`}
                                    >
                                        <span className="text-[36px] font-bold tracking-tight leading-none">
                                            {tier.currency === 'INR'
                                                ? '₹'
                                                : tier.currency === 'EUR'
                                                  ? '€'
                                                  : '$'}
                                            {price}
                                        </span>
                                        <span
                                            className={`text-sm pb-1 ${isDark ? 'text-[#f0ede8]/60' : ''}`}
                                        >
                                            {priceLabel}
                                        </span>
                                    </div>
                                    <div
                                        className={`text-[12px] mt-1 ${isDark ? 'text-[#f0ede8]/40' : 'text-[#1a1a1a]/45'}`}
                                    >
                                        {billedLabel}
                                    </div>
                                    <Button
                                        disabled={isFree || isLoading}
                                        onClick={() => !isFree && handleUpgrade(tier.id)}
                                        className={`mt-4 w-full py-2.5 text-[13px] font-semibold tracking-wide transition-all
                                        ${
                                            isDark
                                                ? 'bg-[#f0ede8] hover:bg-white text-[#111110] shadow-sm'
                                                : 'bg-black/7 text-[#1a1a1a]/50 cursor-default'
                                        }`}
                                    >
                                        {isLoading
                                            ? 'Loading...'
                                            : isFree
                                              ? 'Current Plan'
                                              : 'Upgrade Now'}
                                    </Button>
                                </div>
                            </div>

                            {/* Increased horizontal padding for the features list */}
                            <div className="flex-1 flex flex-col justify-center gap-3 px-10 py-6">
                                {displayedFeatures.map((feature, i) => {
                                    const Icon = iconMap[feature.icon];
                                    return (
                                        <div key={i} className="flex items-center gap-3.5">
                                            <div
                                                className={`size-7 shrink-0 rounded-lg flex items-center justify-center
                                                ${isDark ? 'bg-white/8' : 'bg-black/6'}`}
                                            >
                                                {Icon && (
                                                    <Icon
                                                        className={`size-[14px] ${isDark ? 'text-[#d6d2ca]' : 'text-[#1a1a1a]'}`}
                                                        strokeWidth={2}
                                                    />
                                                )}
                                            </div>
                                            <div
                                                className={`text-[13px] font-medium leading-tight ${isDark ? 'text-[#e8e4dc]' : 'text-[#1a1a1a]'}`}
                                            >
                                                {feature.label}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </PerspectiveCard>
                    );
                })}
            </div>
        </div>
    );
}
