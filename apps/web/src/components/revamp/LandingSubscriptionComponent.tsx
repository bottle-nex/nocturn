'use client';
import { CgTree, CgTrees } from 'react-icons/cg';
import { premium_features, BILLING_INTERVAL, SubscriptionTierDTO } from '@nocturn/types';
import { useState, useEffect, JSX } from 'react';
import {
    LuUsers,
    LuCalendarCheck,
    LuLayers,
    LuActivity,
    LuPalette,
    LuPencil,
    LuMonitor,
} from 'react-icons/lu';
import { CREATE_CHECKOUT_URL, GET_TIERS_URL } from '../../../routes/api_routes';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { toast } from '@/lib/toast';
import axios from 'axios';
import InformationHeadingSection from './InformationHeadingSection';

const ACCENT = '#4f46e5';
const ACCENT_RGB = '79,70,229';

const iconMap: Record<
    string,
    React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
    Users: LuUsers,
    CalendarCheck: LuCalendarCheck,
    Layers: LuLayers,
    BarChart3: LuActivity,
    Palette: LuPalette,
    Users2: LuUsers,
    Edit3: LuPencil,
    MonitorPlay: LuMonitor,
};

interface FreeFeatureRowProps {
    label: string;
    iconKey: string;
}

interface PremiumFeatureRowProps {
    label: string;
    iconKey: string;
    highlight: boolean;
}

function FreeFeatureRow({ label, iconKey }: FreeFeatureRowProps) {
    const IconComponent = iconMap[iconKey];
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-black/[0.04] last:border-0">
            <div className="flex items-center gap-x-2.5">
                <span className="w-[5px] h-[5px] rounded-full flex-shrink-0 bg-neutral-300" />
                <span className="text-[13px] tracking-[-0.01em] text-neutral-500">{label}</span>
            </div>
            {IconComponent && (
                <IconComponent className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
            )}
        </div>
    );
}

function PremiumFeatureRow({ label, iconKey, highlight }: PremiumFeatureRowProps) {
    const IconComponent = iconMap[iconKey];
    return (
        <div
            className="flex items-center justify-between py-2.5 border-b last:border-0"
            style={{ borderColor: `rgba(${ACCENT_RGB},0.06)` }}
        >
            <div className="flex items-center gap-x-2.5">
                <span
                    className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                    style={{
                        background: highlight ? ACCENT : `rgba(${ACCENT_RGB},0.25)`,
                    }}
                />
                <span
                    className="text-[13px] tracking-[-0.01em]"
                    style={{
                        color: highlight ? '#1a1a1a' : '#737373',
                        fontWeight: highlight ? 500 : 400,
                    }}
                >
                    {label}
                </span>
            </div>
            {IconComponent && (
                <IconComponent
                    className="w-3.5 h-3.5 flex-shrink-0"
                    style={{
                        color: highlight ? `rgba(${ACCENT_RGB},0.5)` : `rgba(${ACCENT_RGB},0.2)`,
                    }}
                />
            )}
        </div>
    );
}

const CARD_INNER = 'relative flex flex-col h-full min-h-[560px] rounded-xl p-8';

export default function LandingSubscriptionComponent(): JSX.Element {
    const [loadingTier, setLoadingTier] = useState<string | null>(null);
    const [tiers, setTiers] = useState<SubscriptionTierDTO[] | null>(null);
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
                { tierId, billingInterval: BILLING_INTERVAL.MONTH },
                {
                    headers: { Authorization: `Bearer ${session.user.token}` },
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

    const freePlan = premium_features.find((plan) => plan.id === 'free');
    const proPlan = premium_features.find((plan) => plan.id === 'pro');

    const proPriceTier = tiers?.find((t) => t.name === 'PRO');
    const priceDisplay = proPriceTier ? `₹${proPriceTier.priceMonthly ?? 299}` : '₹299';

    return (
        <div className="w-full flex flex-col items-center max-w-7xl mx-auto px-4 gap-y-15 mt-30">
            <InformationHeadingSection
                topText="Nocturn Pricing"
                topTextClassName="text-[#4f46ec]"
                title="Choose your subscription."
                description="Learning doesn't have to be hard. With jitter, learning becomes easy, and on top of that you can make money from your knowledge. Can't ask for more, can you.."
                buttonTitle="Buy Premium"
                buttonRedirectUrl="/home"
                buttonClassName="bg-[#4f46ec] hover:bg-[#4f46ec] text-light-base w-42 shadow-[inset_0px_2px_1.5px_rgba(0,0,0,0.07)]"
            />

            <div className="w-full max-w-[60rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* ── FREE CARD ── */}
                <section className="group p-[1px] rounded-xl bg-neutral-200/60 hover:-translate-y-0.5 transition-transform duration-300 ease-out">
                    <div className={`${CARD_INNER} bg-[#fafafa]`}>
                        <div className="flex flex-col gap-y-5">
                            <div className="flex items-start justify-between">
                                <div className="w-11 h-11 rounded-xl bg-white ring-1 ring-black/[0.07] shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex items-center justify-center">
                                    <CgTree className="size-5 text-neutral-400" />
                                </div>
                                <span className="text-[11px] text-neutral-400 font-medium tracking-widest uppercase mt-1">
                                    Starter
                                </span>
                            </div>

                            <div>
                                <h3 className="text-[15px] font-semibold text-neutral-900 tracking-tight">
                                    Free Plan
                                </h3>
                                <p className="text-[13px] text-neutral-400 mt-1 leading-relaxed">
                                    Play smart, practice free, and build your winning edge.
                                </p>
                            </div>

                            <div className="pt-1 pb-5 border-b border-black/[0.05]">
                                <div className="flex items-end gap-x-1.5">
                                    <span className="text-[44px] font-bold text-neutral-900 tracking-[-0.04em] leading-none">
                                        ₹0
                                    </span>
                                    <span className="text-[13px] text-neutral-400 mb-1.5 font-medium">
                                        / month
                                    </span>
                                </div>
                                <p className="text-[12px] text-neutral-400 mt-1.5">
                                    No credit card required
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 mt-5 flex flex-col">
                            <p className="text-[11px] uppercase tracking-[0.1em] text-neutral-400 font-medium mb-1">
                                Includes
                            </p>
                            <div className="flex-1">
                                {freePlan?.features.map((feature, i) => (
                                    <FreeFeatureRow
                                        key={i}
                                        label={feature.label}
                                        iconKey={feature.icon}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-7">
                            <button className="w-full h-10 rounded-xl text-[13px] font-medium text-neutral-600 ring-1 ring-neutral-200 bg-white hover:bg-neutral-50 hover:ring-neutral-300 hover:text-neutral-800 transition-all duration-200 cursor-pointer tracking-tight">
                                Get started free
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── PREMIUM CARD ── */}
                <section
                    className="group relative p-[1px] rounded-xl hover:-translate-y-0.5 transition-transform duration-300 ease-out"
                    style={{
                        boxShadow: `0 0 0 1px rgba(${ACCENT_RGB},0.1), 0 8px 40px rgba(${ACCENT_RGB},0.12), 0 2px 8px rgba(${ACCENT_RGB},0.08)`,
                    }}
                >
                    <div
                        className="pointer-events-none absolute inset-0 rounded-xl"
                        style={{
                            background: `radial-gradient(ellipse 70% 45% at 50% 0%, rgba(${ACCENT_RGB},0.13) 0%, transparent 70%)`,
                        }}
                    />

                    <div
                        className={`${CARD_INNER} overflow-hidden`}
                        style={{
                            background:
                                'linear-gradient(160deg, #fdfcff 0%, #faf9ff 35%, rgba(79,70,229,0.04) 100%)',
                        }}
                    >
                        {/* Noise texture */}
                        <div
                            className="pointer-events-none absolute inset-0 rounded-xl opacity-[0.022]"
                            style={{
                                // backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                                backgroundSize: '128px 128px',
                            }}
                        />
                        {/* Top inset highlight */}
                        <div
                            className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-xl"
                            style={{
                                background: `linear-gradient(90deg, transparent, rgba(${ACCENT_RGB},0.5), transparent)`,
                            }}
                        />

                        <div className="relative flex flex-col gap-y-5">
                            <div className="flex items-start justify-between">
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center bg-alpha/5"
                                    style={{
                                        border: `1px solid rgba(${ACCENT_RGB},0.18)`,
                                        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.9), 0 1px 3px rgba(${ACCENT_RGB},0.12)`,
                                    }}
                                >
                                    <CgTrees className="size-5" style={{ color: ACCENT }} />
                                </div>

                                {/* Badge */}
                                <div
                                    className="flex items-center gap-x-1.5 px-2.5 py-1 rounded-xl"
                                    style={{
                                        background: ACCENT,
                                        boxShadow: `0 1px 0 rgba(255,255,255,0.15) inset, 0 2px 8px rgba(${ACCENT_RGB},0.3)`,
                                    }}
                                >
                                    <span className="relative flex h-1.5 w-1.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50" />
                                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                                    </span>
                                    <span className="text-[11px] font-semibold text-white tracking-wide">
                                        Most Popular
                                    </span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-[15px] font-semibold text-neutral-900 tracking-tight">
                                    Premium Plan
                                </h3>
                                <p className="text-[13px] text-neutral-500 mt-1 leading-relaxed">
                                    Unlock premium battles and maximize your winnings.
                                </p>
                            </div>

                            <div
                                className="pt-1 pb-5 border-b"
                                style={{ borderColor: `rgba(${ACCENT_RGB},0.1)` }}
                            >
                                <div className="flex items-end gap-x-1.5">
                                    <span className="text-[44px] font-bold text-neutral-900 tracking-[-0.04em] leading-none">
                                        {priceDisplay}
                                    </span>
                                    <span className="text-[13px] text-neutral-400 mb-1.5 font-medium">
                                        / month
                                    </span>
                                </div>
                                <p
                                    className="text-[12px] font-medium mt-1.5"
                                    style={{ color: `rgba(${ACCENT_RGB},0.65)` }}
                                >
                                    Cancel anytime — no lock-in
                                </p>
                            </div>
                        </div>

                        <div className="relative flex-1 mt-5 flex flex-col">
                            <p
                                className="text-[11px] uppercase tracking-[0.1em] font-medium mb-1"
                                style={{ color: `rgba(${ACCENT_RGB},0.55)` }}
                            >
                                Everything in Free, plus
                            </p>
                            <div className="flex-1">
                                {proPlan?.features.map((feature, i) => (
                                    <PremiumFeatureRow
                                        key={i}
                                        label={feature.label}
                                        iconKey={feature.icon}
                                        highlight={i === 0 || i === 3}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="relative mt-7">
                            <button
                                onClick={() => handleUpgrade('PRO', 'upgrade')}
                                disabled={loadingTier === 'PRO'}
                                className="w-full h-10 rounded-xl text-[13px] font-semibold text-white tracking-tight transition-all duration-200 cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{
                                    background: `linear-gradient(135deg, ${ACCENT} 0%, #6360ee 100%)`,
                                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 16px rgba(${ACCENT_RGB},0.38), 0 1px 4px rgba(${ACCENT_RGB},0.2)`,
                                }}
                                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    if (loadingTier === 'PRO') return;
                                    e.currentTarget.style.background = `linear-gradient(135deg, #4338ca 0%, ${ACCENT} 100%)`;
                                    e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.15), 0 6px 24px rgba(${ACCENT_RGB},0.48), 0 2px 6px rgba(${ACCENT_RGB},0.25)`;
                                }}
                                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.currentTarget.style.background = `linear-gradient(135deg, ${ACCENT} 0%, #6360ee 100%)`;
                                    e.currentTarget.style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 16px rgba(${ACCENT_RGB},0.38), 0 1px 4px rgba(${ACCENT_RGB},0.2)`;
                                }}
                            >
                                {loadingTier === 'PRO' ? 'Processing...' : 'Upgrade to Premium'}
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
