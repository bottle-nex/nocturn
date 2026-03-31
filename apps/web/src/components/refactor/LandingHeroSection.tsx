import { IoCloseOutline } from 'react-icons/io5';
import { VscSymbolStructure } from 'react-icons/vsc';
import JoinQuizButton from '../test/JoinQuizButton';
import { cn } from '@/lib/utils';
import { audio } from '../test/LandingFooter';
import { GoPlus } from 'react-icons/go';
import { FiArrowUp } from 'react-icons/fi';
import { LuPuzzle } from 'react-icons/lu';
import { BsThreeDotsVertical } from 'react-icons/bs';

export default function LandingHeroSection() {
    return (
        <div className="h-screen w-full max-w-270 flex flex-col gap-y-3 pt-40 items-center">
            <div className="text-5xl font-semibold max-w-xl text-dark-base text-center">
                Knowledge that pays off
            </div>

            <div className="text-dark-base/60 w-full max-w-2xl text-2xl text-center">
                Nocturn is a real-time quiz app made for people who love learning and friendly
                competition.
            </div>

            <div className="mt-2">
                <JoinQuizButton />
            </div>

            <div className="h-full w-full relative mt-5">
                <div className="h-auto pb-4 w-60 z-1 flex flex-col gap-y-2 p-2 px-3 absolute bottom-0 left-2 scale-105 -rotate-6 bg-light-alpha rounded-xl ring-1 ring-black/10 shadow-xs shadow-black/5">
                    <div className="flex gap-x-1.5 px-1 py-px text-dark-base/80 items-center">
                        <LuPuzzle />
                        Nocturn
                    </div>

                    <div className="flex gap-x-2 items-center mt-4">
                        <div className="h-12 w-12 rounded-xl bg-light-base shrink-0" />
                        <div className="h-5 w-full rounded-md bg-light-base" />
                        <BsThreeDotsVertical className="text-dark-base/10 size-6" />
                    </div>

                    <div className="flex gap-x-2 items-center mt-2 bg-light-base rounded-xl p-1">
                        <div className="h-10 w-10 rounded-[10px] bg-light-base shrink-0 ring-1 ring-alpha" />
                        <div className="h-5 w-full rounded-md bg-light-base" />
                        <BsThreeDotsVertical className="text-dark-base/10 size-6" />
                    </div>

                    <div className="flex gap-x-2 items-center mt-3">
                        <div className="h-12 w-12 rounded-xl bg-light-base shrink-0" />
                        <div className="h-5 w-full rounded-md bg-light-base" />
                        <BsThreeDotsVertical className="text-dark-base/10 size-6" />
                    </div>
                </div>

                <div className="absolute shadow-xs shadow-black/5 h-full w-200 rounded-xl overflow-hidden ring-1 ring-black/10 left-1/2 -translate-x-1/2 top-0 flex flex-col">
                    <div className="h-12 w-full flex justify-between items-center">
                        <div className="h-12 w-full px-4 flex items-center gap-x-1.5">
                            <div className="h-3 w-3 rounded-full bg-[#FE3A30]" />
                            <div className="h-3 w-3 rounded-full bg-[#FFCC01]" />
                            <div className="h-3 w-3 rounded-full bg-[#66E035]" />

                            <div className="text-dark-base/80 ml-3 text-sm flex items-center gap-x-3 bg-light-base px-3 py-1 rounded-sm">
                                nocturn.app
                                <IoCloseOutline className="size-3.5" />
                            </div>
                        </div>

                        <div className="flex gap-x-2 pr-3">
                            <div className="h-7 w-7 rounded-full bg-alpha/10 flex justify-center items-center text-alpha">
                                <VscSymbolStructure />
                            </div>
                        </div>
                    </div>

                    <div className="h-full w-full flex gap-x-3 px-3 pb-3">
                        <div className="w-[60%] h-full flex flex-col gap-y-3">
                            <div className="h-50 w-full rounded-xl bg-light-base" />
                            <div className="h-10 w-full bg-light-base rounded-lg" />
                            <div className="h-4 w-full bg-light-base rounded-xl" />
                            <div className="h-4 w-full bg-light-base rounded-xl" />
                            <div className="h-10 w-full bg-light-base rounded-lg" />
                            {/* <div className='h-4 w-full bg-light-base rounded-xl'/> */}
                        </div>

                        <div className="w-[40%] h-full px-3 py-1.5 flex flex-col justify-between border border-dashed border-alpha rounded-xl">
                            {/* header and skeleton */}
                            <div className="flex flex-col h-30 justify-between">
                                <div
                                    className={cn(
                                        'h-20 w-full text-dark-base/60 font-semibold text-base',
                                        audio.className,
                                    )}
                                >
                                    nocturn
                                </div>

                                <div className="flex flex-col gap-y-3">
                                    <div className="h-5 w-full rounded-full bg-light-base/80" />
                                    <div className="h-2.5 w-[80%] rounded-full bg-light-base/80" />
                                    <div className="flex gap-x-2">
                                        <div className="h-5 w-6 bg-light-base/80 rounded-sm" />
                                        <div className="h-5 w-6 bg-light-base/80 rounded-sm" />
                                    </div>
                                </div>
                            </div>

                            {/* chat */}
                            <div className="h-20 w-full flex flex-col justify-between p-2 px-2.5 text-sm rounded-lg ring-1 ring-black/5 shadow-sm shadow-black/5 mb-2">
                                <div className="text-dark-base/80">Create a quiz around solana</div>

                                <div className="w-full flex justify-between pb-0.5">
                                    <div className="h-6 w-6 text-dark-base/70 ring-1 ring-black/5 rounded-full bg-light-base flex justify-center items-center">
                                        <GoPlus />
                                    </div>

                                    <div className="h-6 w-6 rounded-md bg-alpha text-light-base flex justify-center items-center">
                                        <FiArrowUp />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
