import LandingHeader from '@/components/refactor/LandingHeader';
import PerspectiveCard from '@/components/utility/PerspectiveCard';
import LandingHeaderComponent from '@/components/refactor/LandingCardsSectionComponents/LandingHeaderComponent';
import Link from 'next/link';

export default function NotFoundCardsSection() {
    return (
        <div className="py-32 w-full max-w-270 flex flex-col items-center mx-auto ring-1 ring-black/10 bg-light-base pt-25">
            <LandingHeader
                heading="Where to next?"
                subheading="We couldn't find your page, but there's plenty more to explore on Nocturn."
            />

            <div className="w-full justify-center flex px-6 gap-x-6 mt-5 pb-10">
                <PerspectiveCard className="relative mt-20 w-85 h-80 rounded-xl bg-[#c4b6ff] ring-1 ring-black/10 shadow-xs shadow-black/5 overflow-hidden p-6 hover:-translate-y-2 transition-transform duration-300 group">
                    <LandingHeaderComponent
                        title="Head Home"
                        description="Return to the main dashboard and start over."
                    />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-32 text-center flex flex-col justify-end items-center">
                        <Link
                            href="/"
                            className="px-6 py-2.5 bg-dark-base text-white rounded-full text-[15px] hover:scale-105 active:scale-95 transition-transform shadow-sm"
                        >
                            Go Home
                        </Link>
                    </div>
                </PerspectiveCard>

                <PerspectiveCard className="relative mt-20 w-85 h-80 rounded-xl bg-[#ffd1b6] ring-1 ring-black/10 shadow-xs shadow-black/5 overflow-hidden p-6 hover:-translate-y-2 transition-transform duration-300">
                    <LandingHeaderComponent
                        title="Browse Quizzes"
                        description="Find your next challenge in our community hub."
                    />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-32 text-center flex flex-col justify-end items-center">
                        <Link
                            href="/"
                            className="px-6 py-2.5 bg-dark-base text-white rounded-full text-[15px] hover:scale-105 active:scale-95 transition-transform shadow-sm"
                        >
                            Explore
                        </Link>
                    </div>
                </PerspectiveCard>

                <PerspectiveCard className="relative mt-20 w-85 h-80 rounded-xl bg-[#b6ffda] ring-1 ring-black/10 shadow-xs shadow-black/5 overflow-hidden p-6 hover:-translate-y-2 transition-transform duration-300">
                    <LandingHeaderComponent
                        title="Get Support"
                        description="Need help? Reach out to our support team."
                    />
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-32 text-center flex flex-col justify-end items-center">
                        <Link
                            href="/"
                            className="px-6 py-2.5 bg-dark-base text-white rounded-full text-[15px] hover:scale-105 active:scale-95 transition-transform shadow-sm"
                        >
                            Contact Us
                        </Link>
                    </div>
                </PerspectiveCard>
            </div>
        </div>
    );
}
