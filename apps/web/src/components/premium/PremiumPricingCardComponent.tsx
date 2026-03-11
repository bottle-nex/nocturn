"use client";

import { cn } from '@/lib/utils';
import AppLogo from '../app/AppLogo';
import {
    LuUsers,
    LuCalendarCheck,
    LuLayers,
    LuActivity,
    LuPalette,
    LuPencil,
    LuMonitor,
} from 'react-icons/lu';
import InformationHeadingSection from '../revamp/InformationHeadingSection';
import { FaCat } from 'react-icons/fa';
import { premium_features } from '@nocturn/types';
import Image from 'next/image';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

export default function PremiumPricingCardComponent() {

    const router = useRouter();

    return (
        <div className={cn('w-screen min-h-screen max-w-6xl mx-auto mb-30 flex flex-col gap-y-15')}>
            <InformationHeadingSection
                topText="Nocturn Features"
                topTextClassName={cn('text-alpha')}
                title="Choose your subscription."
                description="Learning doesn't have to be hard. With jitter, learning becomes easy, and on top of that you can make money from your knowledge. Can't ask for more, can you.."
                buttonTitle="Buy Premium"
                buttonRedirectUrl="/home"
                buttonClassName={cn(
                    'bg-alpha hover:bg-alpha text-light-base w-40 shadow-[inset_0px_1.5px_rgba(255,255,255,0.15)] shrink-0 ml-px',
                )}
            />

            <div className={cn('w-full h-140 flex gap-x-8')}>
                {/* left card */}
                <div
                    className={cn(
                        'w-[40%] h-full bg-light-base rounded-2xl flex flex-col justify-end relative p-8 shadow-xs shadow-black/5',
                    )}
                >
                    {/* floating cared */}
                    <div
                        className={cn(
                            'h-60 w-100 ring-1 ring-dark-base',
                            'shadow-sm shadow-black/10',
                            // 'shadow-[inset_0px_1.5px_2px_rgba(0,0,0,0.05)]',
                            'rounded-xl absolute top-3 -left-15 -rotate-12',
                            'bg-light-base flex items-center justify-center',
                        )}
                    >
                        <div
                            className={cn(
                                'relative flex items-center justify-center overflow-hidden h-full w-full',
                            )}
                        >
                            <Image
                                src={'/images/cardBG.png'}
                                alt=""
                                className="object-cover rounded-xl"
                                fill
                                unoptimized
                            />
                            <AppLogo size={300} />

                            <div
                                className={cn(
                                    'absolute bottom-4 right-3',
                                    'text-light-base/90 text-sm tracking-wide uppercase font-semibold',
                                    'bg-dark-alpha ring-2 ring-neutral-700 shadow-sm shadow-black/10',
                                    'px-2 py-0.5 rounded-sm',
                                )}
                            >
                                Premium club
                            </div>
                        </div>
                    </div>

                    <div className={cn('flex flex-col gap-y-5')}>
                        <div
                            className={cn(
                                'bg-dark-base w-fit text-light-base px-4 h-10 rounded-full',
                                'flex items-center gap-x-2 text-sm',
                                'shadow-[inset_0_1.5px_0_rgba(255,255,255,0.15)]',
                                "cursor-pointer",
                            )}
                            onClick={() => router.push('/premium')}
                        >
                            <FaCat />
                            <span>Get Premium</span>
                        </div>

                        <div className={cn('text-5xl text-dark-base font-semibold')}>
                            Join Nocturn
                        </div>
                    </div>
                </div>

                {/* second card */}
                <div
                    className={cn(
                        'bg-dark-base rounded-2xl flex-1 h-full',
                        'flex flex-col gap-y-10 p-10 relative',
                        'shadow-[inset_0px_3px_rgba(255,255,255,0.1)] overflow-hidden',
                        'ring-1 ring-dark-base',
                    )}
                >
                    <div className="absolute -bottom-8 -right-15 z-10 -rotate-12 group-hover:scale-105">
                        <Image
                            src={'/images/landing/happyCat.png'}
                            alt=""
                            width={250}
                            height={250}
                        />
                    </div>

                    <div className={cn('flex w-full justify-between items-center')}>
                        <div className={cn('text-light-base text-3xl')}>Monthly Club</div>

                        <span
                            className={cn(
                                'text-[13px] text-light-base/60 font-normal',
                                'ring-1 ring-light-base/10 px-3 py-1 rounded-xs',
                                'bg-light-base/5',
                            )}
                        >
                            Most Popular
                        </span>
                    </div>

                    <div className={cn('w-full ring-1 ring-light-alpha/10')} />

                    <div className={cn('text-light-base flex items-end gap-x-1')}>
                        <div className={cn('text-6xl')}>$19</div>

                        <div className={cn('text-base font-light pb-1 tracking-wide')}>/month</div>
                    </div>

                    {/* features card */}
                    <div
                        className={cn(
                            'h-40 w-full bg-linear-to-b from-neutral-800 via-neutral-800/80 to-neutral-800/80 rounded-[10px] relative shadow-[inset_0px_1.5px_2px_rgba(255,255,255,0.05)]',
                        )}
                    >
                        <div
                            className={cn(
                                'py-1 px-2 rounded-xs uppercase',
                                'text-light-base/50 text-[10px] font-light',
                                'shadow-[inset_0px_1.5px_2px_rgba(255,255,255,0.05)]',
                                'bg-linear-to-b from-dark-base via-dark-alpha to-dark-alpha w-fit ring-1 ring-light-base/10 tracking-wide',
                                'absolute -top-2.5 left-6',
                            )}
                        >
                            included
                        </div>

                        <div className={cn('p-7 h-full', 'columns-2 gap-x-10')}>
                            {premium_features
                                .find((plan) => plan.id === 'pro')
                                ?.features.map((feature, index) => {
                                    const IconComponent = iconMap[feature.icon];

                                    return (
                                        <div
                                            key={index}
                                            className={cn(
                                                'flex items-start gap-3 mb-3 break-inside-avoid',
                                            )}
                                        >
                                            {IconComponent && (
                                                <IconComponent className="w-4 h-4 mt-1 text-light-base/60" />
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-light-base/80">
                                                    {feature.label}
                                                </span>
                                                <span className="text-light-base/60 text-[13px]">
                                                    {feature.subLabel}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>

                    <Button
                        className="text-[20px] text-light-base bg-light-base/5 hover:bg-light-base/5 hover:-translate-y-0.5 shadow-[inset_0px_1.5px_2px_rgba(255,255,255,0.10)] h-15 w-42 rounded-[8px]! cursor-pointer"
                        onClick={() => router.push('/premium')}
                    >
                        Buy Premium
                    </Button>
                    {/* <div className='gap-x-3 h-full w-fit flex justify-between items-center px-8 rounded-md bg-light-base/5 shadow-[inset_0px_1.5px_2px_rgba(255,255,255,0.10)] overflow-hidden'>
                            <Image
                                src={'/images/cat.png'}
                                alt=''
                                className='object-contain mt-20'
                                width={100}
                                height={100}
                                unoptimized
                            />
                    </div> */}
                </div>
            </div>
        </div>
    );
}

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
