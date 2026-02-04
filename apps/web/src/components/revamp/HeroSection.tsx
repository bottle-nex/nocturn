'use client';
import { IoIosArrowForward, IoIosSearch } from 'react-icons/io';
import { useRouter } from 'next/navigation';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { MdArrowOutward } from 'react-icons/md';
import { Button } from '../ui/button';
import { FcAlarmClock, FcPortraitMode } from 'react-icons/fc';

export default function HeroSection() {
    const router = useRouter();
    const { session } = useUserSessionStore();

    return (
        <div className="h-screen w-full max-w-screen bg-dark-base grid grid-cols-7 px-15 pt-25 relative">
            {/* absolute text */}
            <div className="absolute bottom-10 left-15 flex flex-col gap-y-4 max-w-4xl">
                <h1 className="text-7xl font-bold text-light-base leading-tight">
                    Bet on yourself
                </h1>
                <div className="flex items-center gap-x-8 text-sm text-light-base/60">
                    <div className="flex items-center gap-x-3 max-w-55">
                        <div className="h-10 w-10 rounded-full bg-pink-400/80 flex items-center justify-center text-xl shrink-0">
                            <FcAlarmClock />
                        </div>
                        <span className="text-base">
                            It’s all fun and games until you’re wrong.
                        </span>
                    </div>

                    <span className="text-light-base/40">/</span>

                    <div className="flex items-center gap-x-3 max-w-76">
                        <div className="h-10 w-10 rounded-full bg-pink-400/80 flex items-center justify-center text-[22px] shrink-0">
                            <FcPortraitMode />
                        </div>
                        <span className="text-base">
                            Knowledge is power. Overconfidence is entertainment.
                        </span>
                    </div>
                </div>

                <h2 className="text-7xl font-bold text-light-base leading-tight">
                    without a doubt
                </h2>
            </div>

            {/* first div */}
            <div className="h-150 col-span-1 mt-10 fade-border">
                <div className=" h-60 rounded-3xl border-b-0 flex flex-col p-3.5 fade-border">
                    <div className="flex gap-x-3 items-center">
                        <div className="h-9 w-9 shrink-0 border border-light-base rounded-full flex justify-center items-center">
                            <IoIosSearch className="stroke-2 size-5" />
                        </div>
                        <div className="w-full h-4 border border-light-base rounded-full mr-3" />
                    </div>

                    <div className="w-20 h-3 bg-neutral-800/60 rounded-full border border-neutral-800 mt-5" />
                    <div className="w-[90%] h-2.5 bg-neutral-800/20 rounded-full mt-2" />

                    <div className="w-20 h-3 bg-neutral-800/60 rounded-full border border-neutral-800 mt-5" />
                    <div className="w-[90%] h-2.5 bg-neutral-800/20 rounded-full mt-2" />
                </div>
            </div>

            {/* second div */}
            <div className="h-90 col-span-1 mt-50">
                <div className="fade-border h-full rounded-3xl border-b-0 flex flex-col p-3.5"></div>
            </div>

            {/* third div */}
            <div className="h-140 col-span-3 div-fade-bottom">
                <div className="fade-border h-full rounded-3xl border-b-0 flex flex-col p-5">
                    <div className="flex justify-start gap-x-2">
                        <div className="h-3 w-3 rounded-full border border-light-base" />
                        <div className="h-3 w-3 rounded-full border border-light-base" />
                        <div className="h-3 w-3 rounded-full border border-light-base" />
                    </div>

                    <div className="w-full h-70 mt-6 grid grid-cols-11 gap-x-5">
                        <div className="col-span-3 h-full flex flex-col gap-y-2">
                            <div className="h-4 w-full rounded-full bg-neutral-800/60" />
                            <div className="h-4 w-full gap-x-2 flex items-center">
                                <div>
                                    <IoIosArrowForward />
                                </div>

                                <div className="h-4 w-full rounded-full bg-[#FFF591]" />
                            </div>
                            <div className="h-4 w-full rounded-full bg-neutral-800/60" />
                        </div>

                        <div className="col-span-8 flex flex-col gap-y-2">
                            <div className="w-full h-20 rounded-2xl border border-light-base/90 shrink-0 p-3 font-semibold text-xl text-light-base/90">
                                Get started with non-stop fun
                            </div>
                            <div className="w-full h-full rounded-2xl border border-light-base/90" />
                        </div>
                    </div>
                </div>
            </div>

            {/* fourht div */}
            <div className="h-full col-span-1 mt-25">
                <div className="mid-fade-border h-130 rounded-3xl flex flex-col p-5"></div>
            </div>

            {/* fifth div */}
            <div className="h-full col-span-1 mt-5 flex flex-col">
                <div className="fade-border h-40 rounded-3xl border-b-0 flex flex-col p-5"></div>
                <div className="mid-fade-border h-100 rounded-3xl flex flex-col p-3 py-4 justify-end">
                    <Button
                        onClick={() => {
                            if (!session?.user.token) return;
                            router.push('/home');
                        }}
                        className="flex items-center font-semibold h-12 rounded-full w-full bg-[#FFF591] hover:bg-[#FFF591] relative hover:scale-[1.02] hover:-translate-y-0.5 transition-all transform duration-200 cursor-pointer"
                    >
                        <div>DIVE IN</div>
                        <MdArrowOutward className="mb-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
