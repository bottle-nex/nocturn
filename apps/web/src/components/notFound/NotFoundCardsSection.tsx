'use client';
import Link from 'next/link';
import PerspectiveCard from '@/components/utility/PerspectiveCard';
import LandingSectionHeader from '@/components/refactor/LandingSectionHeader';

export default function NotFoundCardsSection() {
    return (
        <div className="w-full max-w-270 mx-auto py-15 flex flex-col items-center px-6">
            <LandingSectionHeader
                heading="Where to next?"
                subheading="We couldn't find your page, but there's plenty more to explore on Nocturn."
            />

            <div className="w-full flex justify-between gap-x-6 mt-5">
                <PerspectiveCard
                    sticky={false}
                    className="flex-1 h-64 rounded-xl bg-[#c4b6ff] ring-1 ring-black/10 p-7 flex flex-col justify-between"
                >
                    <div>
                        <div className="text-[17px] font-semibold text-dark-base/90">Home</div>
                        <div className="text-[14px] text-dark-base/50 mt-1 leading-snug">
                            Back to the main page and start fresh.
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="self-start bg-dark-base text-light-base text-[14px] h-9 px-6 flex items-center justify-center rounded-full shadow-xs transition-transform duration-200 hover:scale-105 active:scale-95 inset-shadow-xs inset-shadow-white/30"
                    >
                        Go Home
                    </Link>
                </PerspectiveCard>

                <PerspectiveCard
                    sticky={false}
                    className="flex-1 h-64 rounded-xl bg-[#ffd1b6] ring-1 ring-black/10 p-7 flex flex-col justify-between"
                >
                    <div>
                        <div className="text-[17px] font-semibold text-dark-base/90">
                            Explore Quizzes
                        </div>
                        <div className="text-[14px] text-dark-base/50 mt-1 leading-snug">
                            Find your next challenge in the community.
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="self-start bg-dark-base text-light-base text-[14px] h-9 px-6 flex items-center justify-center rounded-full shadow-xs transition-transform duration-200 hover:scale-105 active:scale-95 inset-shadow-xs inset-shadow-white/30"
                    >
                        Explore
                    </Link>
                </PerspectiveCard>

                <PerspectiveCard
                    sticky={false}
                    className="flex-1 h-64 rounded-xl bg-[#b6ffda] ring-1 ring-black/10 p-7 flex flex-col justify-between"
                >
                    <div>
                        <div className="text-[17px] font-semibold text-dark-base/90">Support</div>
                        <div className="text-[14px] text-dark-base/50 mt-1 leading-snug">
                            Reach out if you need help with anything.
                        </div>
                    </div>
                    <Link
                        href="/"
                        className="self-start bg-dark-base text-light-base text-[14px] h-9 px-6 flex items-center justify-center rounded-full shadow-xs transition-transform duration-200 hover:scale-105 active:scale-95 inset-shadow-xs inset-shadow-white/30"
                    >
                        Contact
                    </Link>
                </PerspectiveCard>
            </div>
        </div>
    );
}
