'use client';
import Image from 'next/image';
import LandingHeader from './LandingHeader';
import { Button } from '../ui/button';
import { PiChefHat } from 'react-icons/pi';
import PerspectiveCard from '../utility/PerspectiveCard';

export default function LandingCollaborateComponent() {
    return (
        <div className="h-screen w-full max-w-270 flex flex-col items-center mx-auto ring-1 ring-black/10 bg-light-alpha pt-25 gap-y-5 p-5">
            <LandingHeader
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
                        <PerspectiveCard className="mt-15 h-90 w-70 shadow-md shadow-black/10 ring-1 ring-black/10 rounded-2xl bg-dark-base flex flex-col justify-between p-6">
                            <div className="text-sm text-light-base/70 flex items-center gap-x-3">
                                <div className="h-9 w-9 -rotate-2 ring-1 ring-white/15 flex justify-center items-center shrink-0 rounded-sm bg-neutral-700/10 inset-shadow-xs inset-shadow-white/10 shadow-2xl shadow-black/20">
                                    <PiChefHat className="size-6" />
                                </div>
                                Cause every great quiz needs more than one chef.
                            </div>

                            <div className="w-full h-40 flex flex-col">
                                <div className="bg-neutral-700/70 h-30 w-full rounded-xl flex flex-col justify-between p-3 px-4 text-sm inset-shadow-xs inset-shadow-black/10">
                                    <div className="flex text-dark-base gap-x-8 items-center">
                                        <div className="text-light-base/70">From:</div>

                                        <div className="flex gap-x-1 items-center rounded-sm px-1.5 py-0.5">
                                            <div className="h-5 w-5 rounded-full overflow-hidden relative">
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
                                            <div className="font-semibold text-light-base/80">
                                                Patrick Jane
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex text-dark-base gap-x-12 items-center ">
                                        <div className="text-light-base/70">To:</div>

                                        <div className="flex gap-x-1 items-center rounded-sm px-1.5 py-0.5">
                                            <div className="font-semibold text-light-base/80">
                                                lisbon@gmail.com
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex  gap-x-4 items-center">
                                        <div className="text-light-base/70">Subject:</div>

                                        <div className="flex gap-x-1 items-center text-light-base/80 rounded-sm px-1.5 py-0.5">
                                            <div className="font-semibold">Collab invitation</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-x-1.5 mt-3">
                                    <Button className="h-8 w-16 text-light-base hover:bg-alpha rounded-full">
                                        Send
                                    </Button>

                                    <Button className="h-8 w-18 text-light-base rounded-full bg-neutral-700/70 hover:bg-neutral-700/70">
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </PerspectiveCard>

                        {/* card 2 */}
                        <PerspectiveCard
                            delay={10}
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

                                <div className="text-dark-base/60 flex items-center gap-x-3 leading-[1] text-[14px]">
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
