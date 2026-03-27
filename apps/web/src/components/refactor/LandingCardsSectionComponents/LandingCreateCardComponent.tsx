import { cn } from '@/lib/utils';
import { BsStars } from 'react-icons/bs';

export default function LandingCreateCardComponent() {
    return (
        <div className="ring-1 ring-black/10 w-full h-100 rounded-lg bg-light-alpha shadow-xs shadow-black/5 relative flex flex-col p-6 gap-y-1 overflow-hidden ">
            <div className="text-dark-base/90 text-[17px] font-semibold">Create quiz</div>
            <div className="text-dark-base/50 text-[14px] leading-[1.2]">
                Either create the quiz manually or use AI to build the quiz end-to-end.
            </div>

            <div className="absolute -bottom-10 w-70 h-86 flex items-end justify-center perspective:1400px">
                <div
                    className={cn(
                        'bg-light-base w-full h-full rounded-t-xl p-2 flex flex-col items-center -rotate-10 ml-5 hover:ml-0',
                        'transform-3d',
                        'rotate-x-20 hover:rotate-x-0 rotate-y-20 hover:rotate-0',
                        'shadow-2xl transition-all duration-500 scale-105',
                    )}
                >
                    <div className="text-dark-base/40 text-[13px] flex items-center gap-x-0.5 pl-1 w-full justify-start">
                        <BsStars />
                        Start with AI
                    </div>

                    <div className="w-60 h-full bg-linear-to-b from-white via-light-alpha/80 to-light-base mt-1 rounded-[10px] flex flex-col ring-1 ring-neutral-100 shadow-xs shadow-black/5">
                        <div className="text-dark-base/40 text-[10px] flex items-center gap-x-0.5 pl-3 pt-1.5 w-full justify-start">
                            Create a quiz around SOLANA
                        </div>

                        <div className="h-20 shrink-0 w-full rounded-md max-w-[90%] mx-auto mt-1 shadow-xs shadow-black/5 bg-light-base p-1.5">
                            <div className="bg-light-alpha w-full h-full rounded-[4px] ring-1 ring-neutral-300 shadow-md shadow-black/10 flex flex-col justify-between p-2 px-2.5 leading-[1.2]">
                                <div className="text-dark-base/70 text-[10px]">
                                    <div>Quiz Title: </div>
                                    <div>Solana and the future of blockchain</div>
                                </div>

                                <div className="flex justify-between w-full">
                                    <div className="flex flex-col text-[7px] text-dark-base gap-y-0.5">
                                        <div className="text-dark-base/70">Theme</div>
                                        <div className="bg-[#f5d4df] text-[#6e374a] h-3 px-1 flex justify-center items-center text-[7px] rounded-xs tracking-wide font-semibold w-fit">
                                            MODERN
                                        </div>
                                    </div>

                                    <div className="flex flex-col text-[7px] text-dark-base gap-y-0.5">
                                        <div className="text-dark-base/70">Tags and difficulty</div>
                                        <div className="flex gap-x-2">
                                            <div className="bg-[#F1DEFD] text-[#6d4d7f] h-3 px-1 flex justify-center items-center text-[7px] rounded-xs tracking-wide font-semibold">
                                                Intermediate
                                            </div>
                                            <div className="bg-[#D6E3F1] text-[#4a6481] h-3 px-1 flex justify-center items-center text-[7px] rounded-xs tracking-wide font-semibold">
                                                Solana
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col w-full max-w-[90%] mx-auto gap-y-1 mt-3 leading-none bg-white ring-1 ring-neutral-200 shadow-xs shadow-black/5 rounded-[4px] p-2 px-2.5">
                            <div className="text-dark-base/80 text-[12px]">
                                Q 1. When was solana launched?
                            </div>
                            <div className="flex flex-col w-full text-dark-base/50 text-[11px] mt-1">
                                <div className="flex justify-between">
                                    <div>A. 1992</div>
                                    <div>B. 2020</div>
                                </div>

                                <div className="flex justify-between">
                                    <div>C. 1992</div>
                                    <div>D. 2020</div>
                                </div>
                            </div>
                            <div className="text-dark-base/80 text-[11px] mt-0.5">Answer: 2020</div>
                        </div>

                        <div className="flex flex-col w-full max-w-[90%] mx-auto gap-y-1 mt-3 leading-none bg-white ring-1 ring-neutral-200 shadow-xs shadow-black/5 rounded-[4px] p-2 px-2.5">
                            <div className="text-dark-base/80 text-[12px]">
                                Q 1. When was solana launched?
                            </div>
                            <div className="flex flex-col w-full text-dark-base/50 text-[11px] mt-1">
                                <div className="flex justify-between">
                                    <div>A. 1992</div>
                                    <div>B. 2020</div>
                                </div>

                                <div className="flex justify-between">
                                    <div>C. 1992</div>
                                    <div>D. 2020</div>
                                </div>
                            </div>
                            <div className="text-dark-base/80 text-[11px] mt-0.5">Answer: 2020</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
