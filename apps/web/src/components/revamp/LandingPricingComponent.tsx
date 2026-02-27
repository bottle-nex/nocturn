'use client';
import { premium_features, BILLING_INTERVAL, SubscriptionTierDTO } from '@nocturn/types';
import { JSX, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
    LuUsers,
    LuCalendarCheck,
    LuLayers,
    LuActivity,
    LuPalette,
    LuPencil,
    LuMonitor,
} from 'react-icons/lu';
import { Button } from '../ui/button';
import { CREATE_CHECKOUT_URL, GET_TIERS_URL } from '../../../routes/api_routes';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { toast } from '@/lib/toast';
import axios from 'axios';
import InformationHeadingSection from './InformationHeadingSection';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Users: LuUsers,
    CalendarCheck: LuCalendarCheck,
    Layers: LuLayers,
    BarChart3: LuActivity,
    Palette: LuPalette,
    Users2: LuUsers,
    Edit3: LuPencil,
    MonitorPlay: LuMonitor,
};

interface PricingComponentProps {
    showHeading: boolean;
    className?: string;
}

export default function LandingPricingComponent({
    className,
    showHeading = true,
}: PricingComponentProps): JSX.Element {
    const [loadingTier, setLoadingTier] = useState<string | null>(null);
    const [tiers, setTiers] = useState<SubscriptionTierDTO[] | null>(null);
    const [_tiersLoading, setTiersLoading] = useState<boolean>(true);
    const { session, setOpenSigninModal } = useUserSessionStore();

    useEffect(() => {
        async function fetchTiers() {
            try {
                const response = await axios.get(GET_TIERS_URL);

                if (response.status === 200 && response.data.success) {
                    setTiers(response.data.data);
                } else {
                    toast.error('Failed to load pricing plans');
                }
            } catch (error) {
                console.error('Error fetching tiers:', error);
                toast.error('Failed to load pricing plans');
            } finally {
                setTiersLoading(false);
            }
        }

        fetchTiers();
    }, []);

    const getTierIdByName = (tierName: string): string | null => {
        const tier = tiers?.find((t) => t.name === tierName.toUpperCase());
        return tier?.id || null;
    };

    async function handleUpgrade(featureId: string, action: string | null) {
        if (!action) return;

        if (!session?.user) {
            toast.error('Please sign in to upgrade your plan');
            setOpenSigninModal(true);
            return;
        }

        if (!tiers) {
            toast.error('Pricing information not loaded. Please refresh.');
            return;
        }

        setLoadingTier(featureId);

        try {
            const tierId = getTierIdByName(featureId);

            if (!tierId) {
                toast.error(`Unable to find pricing for ${featureId} plan`);
                setLoadingTier(null);
                return;
            }

            const response = await axios.post(
                CREATE_CHECKOUT_URL,
                {
                    tierId: tierId,
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

    if (!tiers) {
        return (
            <main className="max-w-7xl mx-auto w-full px-6">
                <div className="text-center py-16">
                    <p className="text-dark-alpha/60">Failed to load pricing plans</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="mt-4 text-nprimary hover:underline"
                    >
                        Retry
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className={cn('max-w-6xl mx-auto w-full flex flex-col gap-y-10', className)}>
            {showHeading && (
                <InformationHeadingSection
                    topText="Nocturn Pricing"
                    topTextClassName="text-[#38b000]"
                    title="Choose your subscription."
                    description="Learning doesn't have to be hard. With jitter, learning becomes easy, and on top of that you can make money from your knowledge. Can't ask for more, can you.."
                    buttonTitle="Buy Premium"
                    buttonRedirectUrl="/home"
                    buttonClassName="bg-[#9ef01a] hover:bg-[#9ef01a] text-dark-base w-42 shadow-[inset_0px_2px_1.5px_rgba(0,0,0,0.07)]"
                />
            )}

            {/* free card */}
            <section className="w-full grid md:grid-cols-2 gap-8 mt-6">
                <div className="rounded-2xl ring-1 ring-black/10 shadow-xs shadow-black/5 bg-light-base/20 p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                        <span className="text-sm font-medium text-dark-base/70 tracking-wide">
                            Free Plan
                        </span>

                        <div className="flex items-baseline gap-2">
                            <h2 className="text-5xl font-semibold text-dark-base">$0</h2>
                            <span className="text-dark-base/60 text-lg">/ month</span>
                        </div>

                        <p className="text-dark-base/70 text-lg leading-relaxed">
                            Play smart, practice free, and build your winning edge.
                        </p>
                    </div>

                    <div className="mt-8 space-y-4">
                        {premium_features
                            .find((plan) => plan.id === 'free')
                            ?.features.map((feature, index) => {
                                const IconComponent = iconMap[feature.icon];

                                return (
                                    <div key={index} className="flex items-start gap-3">
                                        {IconComponent && (
                                            <IconComponent className="w-5 h-5 mt-1 text-neutral-500" />
                                        )}
                                        <span className="text-neutral-700">{feature.label}</span>
                                    </div>
                                );
                            })}
                    </div>

                    <Button
                        className={cn(
                            'mt-10 h-12 rounded-lg',
                            'bg-[#E8E8E8] text-dark-base shadow-xs shadow-black/5',
                            'ring-1 ring-black/10 ',
                            'hover:bg-light-base hover:-translate-y-0.5 hover:text-[14px]',
                            'transition-all transform duration-250',
                            'text-[14px] font-semibold',
                        )}
                    >
                        Get Started
                    </Button>
                </div>

                {/* premium card */}
                <div className="rounded-2xl ring-1 ring-alpha bg-[#EDEDF4] text-white p-8 flex flex-col justify-between shadow-xl relative">
                    <div className="absolute top-6 right-6">
                        <span className="text-xs font-medium bg-alpha px-3 py-1 rounded-full">
                            Most Popular
                        </span>
                    </div>

                    <div className="space-y-4">
                        <span className="text-sm font-medium text-dark-base/70 tracking-wide">
                            Premium Plan
                        </span>

                        <div className="flex items-baseline gap-2">
                            <h2 className="text-5xl font-semibold text-dark-base">$19</h2>
                            <span className="text-dark-base/60 text-lg">/ month</span>
                        </div>

                        <p className="text-dark-base/70 text-lg leading-relaxed">
                            Unlock premium battles and maximize your winnings.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="mt-8 space-y-4">
                        {premium_features
                            .find((plan) => plan.id === 'pro')
                            ?.features.map((feature, index) => {
                                const IconComponent = iconMap[feature.icon];

                                return (
                                    <div key={index} className="flex items-start gap-3">
                                        {IconComponent && (
                                            <IconComponent className="w-5 h-5 mt-1 text-alpha" />
                                        )}
                                        <span className="text-dark-base/90">{feature.label}</span>
                                    </div>
                                );
                            })}
                    </div>

                    {/* CTA */}
                    <Button
                        onClick={() => handleUpgrade('PRO', 'upgrade')}
                        disabled={loadingTier === 'PRO'}
                        className={cn(
                            'mt-10 h-12 rounded-lg',
                            'bg-alpha text-light-base shadow-[inset_0px_3px_1px_rgba(255,255,255,0.10)]',
                            'hover:bg-alpha hover:-translate-y-0.5 hover:text-[14px]',
                            'transition-all transform duration-250',
                            'text-[14px] font-semibold',
                        )}
                    >
                        {loadingTier === 'PRO' ? 'Processing...' : 'Upgrade to Premium'}
                    </Button>
                </div>
            </section>
        </main>
    );
}
