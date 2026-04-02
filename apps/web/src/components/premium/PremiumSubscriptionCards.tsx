import { premium_features } from '@nocturn/types';
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
    return (
        <div className="flex flex-col pt-15 pb-10">
            <LandingSectionHeader
                heading="Unlock Premium Features"
                subheading="Upgrade your experience with powerful tools and benefits."
            />
            <div className="flex gap-x-10 justify-between w-full max-w-5xl mt-15">
                {premium_features.map((tier) => {
                    const isDark = tier.id === 'pro';
                    const BadgeIcon = tier.badge ? iconMap[tier.badge.icon] : null;

                    const priceLabel =
                        tier.price.interval === 'forever'
                            ? `/${tier.price.interval}`
                            : `/${tier.price.interval}`;

                    const billedLabel =
                        'billed' in tier.price
                            ? `Billed ${tier.price.billed}`
                            : tier.id === 'free'
                              ? 'Get started for free'
                              : null;

                    return (
                        <div
                            key={tier.id}
                            className={`w-full h-65 rounded-xl flex overflow-hidden relative
              ${
                  isDark
                      ? 'bg-[#111110] border border-white/7 shadow-[0_6px_32px_rgba(0,0,0,0.32)]'
                      : 'bg-white/88 border border-black/9 shadow-[0_2px_12px_rgba(0,0,0,0.08)]'
              }`}
                        >
                            <div
                                className={`w-52 shrink-0 flex flex-col justify-between p-6
                ${isDark ? 'border-r border-white/7' : 'border-r border-black/7'}`}
                            >
                                <div className="flex flex-col">
                                    <span
                                        className={`text-[22px] font-bold tracking-tight leading-none ${isDark ? 'text-[#f0ede8]' : 'text-[#1a1a1a]'}`}
                                    >
                                        {tier.name}
                                    </span>
                                    <span
                                        className={`text-[13px] mt-0.5 ${isDark ? 'text-[#f0ede8]/45' : 'text-[#1a1a1a]'}`}
                                    >
                                        membership
                                    </span>
                                    {tier.badge && BadgeIcon && (
                                        <div className="mt-2 inline-flex items-center gap-1 bg-alpha/10 border border-alpha/40 text-[#7771e9] text-[10px] px-2 py-0.5 rounded-full w-fit">
                                            <BadgeIcon className="size-2.5" />
                                            {tier.badge.label}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div
                                        className={`flex items-end gap-1 ${isDark ? 'text-[#f0ede8]' : 'text-[#1a1a1a]'}`}
                                    >
                                        <span className="text-[32px] font-bold tracking-tight leading-none">
                                            {tier.price.currency === 'EUR' ? '€' : '$'}
                                            {tier.price.amount}
                                        </span>
                                        <span
                                            className={`text-xs pb-1 ${isDark ? 'text-[#f0ede8]/60' : ''}`}
                                        >
                                            {priceLabel}
                                        </span>
                                    </div>
                                    {billedLabel && (
                                        <div
                                            className={`text-[11px] mt-1 ${isDark ? 'text-[#f0ede8]/40' : 'text-[#1a1a1a]/45'}`}
                                        >
                                            {billedLabel}
                                        </div>
                                    )}
                                    <Button
                                        disabled={tier.cta.disabled}
                                        className={`mt-3 w-full py-2 text-[12px] font-medium tracking-wide transition-opacity
                    ${
                        isDark
                            ? 'bg-[#f0ede8] hover:bg-[#f0ede8] text-[#111110] hover:opacity-85'
                            : 'bg-black/7 text-[#1a1a1a]/50 cursor-default'
                    }`}
                                    >
                                        {tier.cta.label}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-center gap-2.5 px-5 py-6">
                                {tier.features.map((feature, i) => {
                                    const Icon = iconMap[feature.icon];
                                    return (
                                        <div key={i} className="flex items-center gap-2.5">
                                            <div
                                                className={`size-6.5 shrink-0 rounded-[7px] flex items-center justify-center
                        ${isDark ? 'bg-white/8' : 'bg-black/6'}`}
                                            >
                                                {Icon && (
                                                    <Icon
                                                        className={`size-[13px] ${isDark ? 'text-[#d6d2ca]' : 'text-[#1a1a1a]'}`}
                                                        strokeWidth={2}
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <div
                                                    className={`text-[11.5px] font-medium leading-tight ${isDark ? 'text-[#e8e4dc]' : 'text-[#1a1a1a]'}`}
                                                >
                                                    {feature.label}
                                                </div>
                                                {/* {"subLabel" in feature && feature.subLabel && (
                        <div className={`text-[10px] mt-0.5 ${isDark ? "text-[#e8e4dc]/40" : "text-[#1a1a1a]/45"}`}>
                          {feature.subLabel}
                        </div>
                      )} */}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
