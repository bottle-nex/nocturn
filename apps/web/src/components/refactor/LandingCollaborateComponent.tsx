'use client';
import Image from 'next/image';
import LandingSectionHeader from './LandingSectionHeader';
import { PiChefHat } from 'react-icons/pi';
import PerspectiveCard from '../utility/PerspectiveCard';
import { cn } from '@/lib/utils';

export default function LandingCollaborateComponent() {
    return (
        <div className="h-screen w-full max-w-270 flex flex-col items-center mx-auto ring-1 ring-black/10 bg-light-alpha pt-25 gap-y-5 p-5">
            <LandingSectionHeader
                heading="Add collaborators and work seamlessly"
                subheading="Add collaborators, share ideas, and edit quizzes in real time. Keep everything aligned from creation to launch."
            />

            <div className="h-full flex items-center pt-15">
                <div className="h-120 w-full ring-1 ring-black/20 rounded-xl grid grid-cols-2 overflow-hidden bg-light-base">
                    <div className="col-span-1 flex flex-col justify-between p-10">
                        <div className="text-dark-base/90 text-5xl font-semibold">
                            Too many cooks? Perfect for the kitchen
                        </div>

                        <div className="text-dark-base/50 text-base">
                            Every great quiz needs more than one chef. Some bring the spice, some
                            bring the structure, and some just taste-test everything—but together,
                            you create something truly delicious.
                        </div>
                    </div>

                    <div className="col-span-1 flex gap-x-4 items-center">
                        {/* card 1 */}
                        <PerspectiveCard className="mt-15 h-90 w-70 ring-1 ring-black/10 rounded-2xl bg-dark-base flex flex-col justify-between p-6">
                            <div className="text-sm text-light-base/70 flex items-center gap-x-3">
                                <div
                                    className={cn(
                                        'h-9 w-9 -rotate-2 flex justify-center items-center shrink-0 rounded-sm',
                                        // 'bg-light-base/5 ring-1 ring-white/5 shadow-sm shadow-black/10',
                                        'prem-surface',
                                    )}
                                >
                                    <PiChefHat className="size-6 text-light-base/60" />
                                </div>
                                Cause every great quiz needs more than one chef.
                            </div>

                            <div className="w-full flex flex-col gap-y-3">
                                <div className="relative w-full rounded-lg bg-linear-to-b from-white/[0.07] to-white/3 ring-1 ring-white/8 shadow-[0_1px_1px_rgba(0,0,0,0.01),inset_0_1px_0_rgba(255,255,255,0.01)] backdrop-blur-sm">
                                    {/* <div className='absolute top-12 right-5'>
                                        <div className='h-6 w-6 relative rounded-xs'>
                                        <Image
                                            src={'/images/landing/gmail.png'}
                                            alt=''
                                            className='object-cover p-0.5'
                                            fill
                                            unoptimized
                                            loading='lazy'
                                        />
                                        </div>
                                    </div> */}

                                    {/* <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent" /> */}

                                    <div className="flex flex-col divide-y divide-white/6">
                                        <div className="flex items-center gap-x-3 px-4 py-2.5 group transition-colors duration-150">
                                            <span className="w-12 text-[11px] font-medium tracking-widest text-light-base/30 uppercase shrink-0">
                                                From
                                            </span>
                                            <div className="flex items-center gap-x-2">
                                                <div className="relative h-5 w-5 rounded-full overflow-hidden ring-1 ring-white/20 shadow-[0_0_0_2px_rgba(255,255,255,0.04)]">
                                                    <Image
                                                        src="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-2.jpg"
                                                        alt="Patrick Jane"
                                                        className="object-cover"
                                                        fill
                                                        unoptimized
                                                    />
                                                </div>
                                                <span className="text-[13px] font-medium text-light-base/75 tracking-tight">
                                                    Patrick Jane
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-x-3 px-4 py-2.5 transition-colors duration-150">
                                            <span className="w-12 text-[11px] font-medium tracking-widest text-light-base/30 uppercase shrink-0">
                                                To
                                            </span>
                                            <span className="text-[13px] text-light-base/60 tracking-tight">
                                                lisbon@gmail.com
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-x-3 px-4 py-2.5 transition-colors duration-150">
                                            <span className="w-12 text-[11px] font-medium tracking-widest text-light-base/30 uppercase shrink-0">
                                                Sub
                                            </span>
                                            <span className="text-[13px] font-semibold text-light-base/70 tracking-normal">
                                                Collab invitation
                                            </span>
                                        </div>
                                    </div>

                                    {/* <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent" /> */}
                                </div>

                                <div className="flex items-center gap-x-2 px-0.5">
                                    <button
                                        className={cn(
                                            'h-7 px-4 rounded-md text-[12px] font-semibold tracking-wide',
                                            'bg-neutral-200 text-neutral-900',
                                            'shadow-[0_1px_0_1px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.12)]',
                                            'active:scale-[0.97] active:shadow-none',
                                            'transition-all duration-100 ease-out',
                                        )}
                                    >
                                        Send
                                    </button>

                                    <button
                                        className={cn(
                                            'h-7 px-3 rounded-md text-[12px] font-medium tracking-wide',
                                            'text-light-base/60 bg-white/5',
                                            'hover:text-light-base/60 hover:bg-white/5',
                                            'ring-1 ring-white/10',
                                            'active:scale-[0.97]',
                                            'shadow-xs shadow-black',
                                            'transition-all duration-100 ease-out',
                                        )}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </PerspectiveCard>

                        {/* card 2 */}
                        <PerspectiveCard
                            delay={0.01}
                            className="mt-15 h-90 w-70 shrink-0 shadow-sm shadow-black/10 ring-1 ring-black/10 rounded-2xl bg-light-alpha flex flex-col justify-end p-6"
                        >
                            <div className="relative shrink-0 h-12 w-12 bg-light-base top-25 right-2 rounded-full overflow-hidden -rotate-10 ring-2 ring-white shadow-sm shadow-black">
                                <Image
                                    src={
                                        'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-4.jpg'
                                    }
                                    alt=""
                                    className="object-cover"
                                    fill
                                    unoptimized
                                />
                            </div>
                            <div className="relative shrink-0 h-22 w-22 bg-light-base top-4 -right-37 rounded-full overflow-hidden -rotate-15 -scale-x-[1] ring-2 ring-white shadow-sm shadow-black">
                                <Image
                                    src={
                                        'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-2.jpg'
                                    }
                                    alt=""
                                    className="object-cover"
                                    fill
                                    unoptimized
                                />
                            </div>
                            <div className="relative shrink-0 h-13 w-13 bg-light-base -top-25 -right-14 rounded-full overflow-hidden rotate-5 ring-2 ring-white shadow-sm shadow-black">
                                <Image
                                    src={
                                        'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-16.jpg'
                                    }
                                    alt=""
                                    className="object-cover"
                                    fill
                                    unoptimized
                                />
                            </div>

                            <div className="flex flex-col gap-y-2">
                                <div className="text-dark-base/60 tracking-wide text-[14px]">
                                    Eliminate the load
                                </div>

                                <div className="text-dark-base/80 tracking-wide text-[19px] leading-[1.1] font-semibold">
                                    Made specifically for people who value time
                                </div>

                                <div className="text-dark-base/60 flex items-center gap-x-3 leading-none text-[14px]">
                                    No hard flow, just invite people through emails, and quickly
                                    wrap up the quizzes.
                                </div>
                            </div>
                        </PerspectiveCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
