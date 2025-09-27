'use client';
import InvertedQuizCards from '../utility/InvertedQuizCards';

export default function HomeDashboard() {
    return (
        <div className="relative top-4 h-full w-full border rounded-xl overflow-hidden select-none flex gap-2 bg-neutral-950/50">
            <div className="w-[40rem] h-full flex flex-col relative">
                <InvertedQuizCards />
            </div>

            <div className="w-full h-full flex flex-col space-y-3 p-5 text-7xl relative pb-6">
                <div className="w-full h-full flex flex-col space-y-3 text-neutral-200">
                    <div className="flex w-full h-full space-x-3">
                        <div className="bg-[#211c14] hover:bg-[#271f11] h-full w-full flex flex-col rounded-xl p-6">
                            <div className="w-full flex flex-col gap-y-3 pt-4 px-3">
                                <span className="text-[30px] font-bold tracking-wider">
                                    Create_
                                </span>
                                <span className="text-[18px] font-medium leading-6 tracking-wide">
                                    The only quiz game where your knowledge isn&apos;t just power,{' '}
                                    <span className="text-[#ad7416] font-medium">
                                        it&apos;s profit
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="bg-[#141e1f] hover:bg-[#122122] h-full w-full flex flex-col gap-y-3 rounded-xl p-6">
                            <div className="w-full flex flex-col gap-y-3 pt-4 px-3">
                                <span className="text-[28px] font-medium tracking-wider">
                                    Stake.
                                </span>
                                <span className="text-[18px] font-normal leading-6 tracking-wide">
                                    The only quiz game where your knowledge isn&apos;t just power,{' '}
                                    <span className="text-[#0c919e] font-medium">
                                        it&apos;s profit
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex w-full h-full space-x-3">
                        <div className="bg-[#151920] hover:bg-[#151b26] h-full w-full flex flex-col gap-y-3 rounded-xl p-6">
                            <div className="w-full flex flex-col gap-y-3 pt-4 px-3">
                                <span className="text-[28px] font-medium tracking-wider">
                                    @Participate
                                </span>
                                <span className="text-[18px] font-normal leading-6 tracking-wide">
                                    The only quiz game where your knowledge isn&apos;t just power,{' '}
                                    <span className="text-[#105ada] font-medium">
                                        it&apos;s profit
                                    </span>
                                </span>
                            </div>
                        </div>

                        <div className="bg-[#1d2111] hover:bg-[#202510] h-full w-full flex flex-col gap-y-3 rounded-xl p-6">
                            <div className="w-full flex flex-col gap-y-3 pt-4 px-3">
                                <span className="text-[28px] font-medium tracking-wider">#Win</span>
                                <span className="text-[18px] font-normal leading-6 tracking-wide">
                                    The only quiz game where your knowledge isn&apos;t just power,{' '}
                                    <span className="text-[#81a710] font-medium">
                                        it&apos;s profit
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full h-full border-3 border-[#222222] rounded-2xl overflow-hidden">
                    <div className="h-[3rem] w-full text-[16px] text-neutral-300 tracking-wide flex justify-between items-center px-13 bg-[#222222]">
                        <span>STATUS</span>
                        <span>QUIZ TITLE</span>
                        <span>STAKE AMOUNT</span>
                    </div>

                    <div className="h-full w-full bg-neutral-900/40">
                        <div className="h-[3.5rem] w-full text-[18px] text-neutral-200 tracking-wide flex justify-between items-center px-8">
                            <div className="flex justify-center items-center gap-x-2">
                                {/* status */}
                                <span className="bg-[#10be03] h-2 w-2 rounded-full flex justify-center items-center" />
                                Disbursed
                            </div>

                            <div>
                                {/* quiz title */}
                                Web3 quiz on centralized experience and DeFis
                            </div>

                            <div>
                                {/* stake amount */}
                                $40
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
