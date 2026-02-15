'use client';
import { premium_features, BILLING_INTERVAL, SubscriptionTierDTO } from '@nocturn/types';
import { JSX, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { IoStar } from 'react-icons/io5';
import { RiServiceFill } from 'react-icons/ri';
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
import { CREATE_CHECKOUT_URL, GET_TIERS_URL } from '../../../routes/api_routes';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { toast } from 'sonner';
import axios from 'axios';
import SectionHeading from '../ui/SectionHeading';

export default function PricingComponent(): JSX.Element {
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
        <main className="max-w-7xl mx-auto w-full pt-25 flex flex-col justify-center items-center mt-10">
            <SectionHeading
                title="Choose Your Plan"
                description="Select the perfect plan for your needs. Unlock powerful features to create engaging live quizzes, collaborate with your team, and reach your audience. Flexible pricing designed to grow with you, from individuals to teams."
                icon={<RiServiceFill className="size-4" />}
                ticker="pricing plans"
            />

            <section className="w-full grid md:grid-cols-2 gap-8 py-20 max-w-3xl mx-auto items-end">
                {premium_features.map((feature) => {
                    const isLoading = loadingTier === feature.id;

                    return (
                        <div
                            key={feature.id}
                            className={cn(
                                'rounded-2xl relative hover:shadow-sm flex flex-col overflow-hidden transform-gpu',
                                feature.id === 'pro'
                                    ? 'border border-nprimary bg-nprimary/5 h-150'
                                    : 'border border-neutral-200 bg-white h-144',
                                tiersLoading && 'overflow-hidden',
                            )}
                        >
                            {tiersLoading ? (
                                <div />
                            ) : (
                                <>
                                    {feature.id === 'pro' && (
                                        <div className="text-white text-xs bg-nprimary px-4 py-2 font-medium tracking-wide flex items-center justify-center gap-x-2">
                                            <IoStar className="text-sm" />
                                            Recommended
                                        </div>
                                    )}

                                    <section className={cn('p-8', feature.id === 'pro' && 'pt-6')}>
                                        <div className="space-y-2 mb-4">
                                            <h3 className="text-dark-alpha text-xl font-medium">
                                                {feature.name}
                                            </h3>
                                            <p className="text-dark-alpha/60 text-xs min-h-10">
                                                {feature.description}
                                            </p>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex items-baseline gap-x-2">
                                                <span className="text-dark-alpha text-3xl font-semibold">
                                                    ${feature.price.amount}
                                                </span>
                                                <span className="text-dark-alpha/60 text-sm">
                                                    {/* {feature.price.currency} */}
                                                </span>
                                            </div>
                                            <p className="text-dark-alpha/50 text-xs mt-1">
                                                per {feature.price.interval}
                                                {feature.price.billed &&
                                                    ` • Billed ${feature.price.billed}`}
                                            </p>
                                        </div>

                                        <Button
                                            className={cn(
                                                'rounded-full w-full py-6 font-semibold text-sm transition-all my-8',
                                                feature.id === 'pro'
                                                    ? 'bg-nprimary text-white hover:bg-nprimary/90 shadow-md hover:shadow-lg'
                                                    : 'bg-neutral-200 text-dark-alpha hover:bg-neutral-300',
                                            )}
                                            disabled={feature.cta.disabled || isLoading}
                                            onClick={() =>
                                                handleUpgrade(feature.id, feature.cta.action)
                                            }
                                        >
                                            {isLoading ? 'Loading...' : feature.cta.label}
                                        </Button>

                                        <div className="space-y-4 flex-1">
                                            <h4 className="text-dark-alpha font-semibold text-xs uppercase tracking-wider mb-4">
                                                What&apos;s included
                                            </h4>
                                            <ul className="space-y-3">
                                                {feature.features.map((item, idx) => {
                                                    const IconComponent = iconMap[item.icon];
                                                    return (
                                                        <li
                                                            key={idx}
                                                            className="flex items-start gap-x-2"
                                                        >
                                                            {IconComponent && (
                                                                <IconComponent
                                                                    className={cn(
                                                                        'shrink-0 text-xs mt-1',
                                                                        feature.id === 'pro'
                                                                            ? 'text-nprimary'
                                                                            : 'text-neutral-500',
                                                                    )}
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="text-dark-alpha font-medium text-sm leading-snug">
                                                                    {item.label}
                                                                </p>
                                                                {item.subLabel && (
                                                                    <p className="text-dark-alpha/50 text-xs mt-0.5">
                                                                        {item.subLabel}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </section>
                                </>
                            )}
                        </div>
                    );
                })}
            </section>
        </main>
    );
}
