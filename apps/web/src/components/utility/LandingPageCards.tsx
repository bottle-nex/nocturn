import Image from 'next/image';
import UtilityCard from './UtilityCard';
import { MdChevronRight } from 'react-icons/md';
import { DiCoda } from 'react-icons/di';
import UnclickableTicker from '../tickers/UnClickableTicker';

export default function LandingPageCards() {
    return (
        <div className="flex flex-col items-start justify-start relative border-t dark:border-neutral-700 border-neutral-200 px-12">
            <UnclickableTicker className="absolute -top-3 left-[60%]">features</UnclickableTicker>
            <div className="grid grid-cols-2 gap-8 mt-4 w-full pt-20">
                <UtilityCard className="min-w-[20rem] min-h-[18rem] max-h-[18rem] shadow-md border border-dashed transition-all duration-300 ease-in-out hover:shadow-lg relative overflow-hidden p-0 rounded-xl">
                    <div className="absolute inset-0">
                        <Image
                            src="/images/card-1.jpg"
                            alt="test"
                            className="object-cover scale-110"
                            fill
                            unoptimized
                        />
                    </div>
                    <div className="absolute bg-alpha inset-0 w-[85%] rounded-tr-[4rem] z-10">
                        <div className="relative flex flex-col items-start justify-center px-12 gap-y-6 text-light-base dark:text-dark-alpha h-full -mt-4">
                            <MdChevronRight
                                size={44}
                                className="absolute top-10 right-8 dark:text-dark-alpha text-light-base -rotate-45 bg-neutral-400/30 rounded-full p-1 cursor-pointer"
                            />
                            <div className="relative z-50 text-3xl font-bold">Quiz Builder</div>
                            <div className="relative z-50 text-sm font-light">
                                Design interactive quizzes using our intuitive builder. Add
                                questions, set timers, assign scores, and more — all in one place.
                            </div>
                        </div>
                    </div>
                </UtilityCard>

                <UtilityCard className="min-w-[20rem] min-h-[18rem] max-h-[18rem] shadow-md border border-dashed transition-all duration-300 ease-in-out hover:shadow-lg grid-cols-1 relative overflow-hidden rounded-xl">
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                        <Image
                            src="/images/card-3.jpg"
                            alt="test"
                            className="object-cover scale-110"
                            fill
                            unoptimized
                        />
                    </div>
                    <div className="absolute bg-orange-500 inset-0 w-[85%] rounded-tr-[4rem] z-10">
                        <div className="relative flex flex-col items-start justify-center px-12 gap-y-6 text-light-base dark:text-dark-alpha h-full -mt-4">
                            <DiCoda
                                size={32}
                                className="absolute top-10 right-10 dark:text-dark-alpha text-light-base"
                            />
                            <div className="relative z-50 text-3xl font-bold">
                                Performance Insights
                            </div>
                            <div className="relative z-50 text-sm font-light">
                                Track how your quizzes are performing in real-time. See completion
                                rates, average scores, and detailed user stats.
                            </div>
                        </div>
                    </div>
                </UtilityCard>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-4 w-full">
                <UtilityCard className="min-w-[20rem] min-h-[18rem] max-h-[18rem] shadow-md border border-dashed transition-all duration-300 ease-in-out hover:shadow-lg relative overflow-hidden p-0 rounded-xl">
                    <div className="absolute inset-0">
                        <Image
                            src="/images/card-2.jpg"
                            alt="test"
                            className="object-cover scale-110"
                            fill
                            unoptimized
                        />
                    </div>
                    <div className="absolute dark:bg-neutral-300 bg-neutral-800 inset-0 w-[85%] rounded-tr-[4rem] z-10">
                        <div className="relative flex flex-col items-start justify-center px-12 gap-y-6 text-light-base dark:text-dark-alpha h-full -mt-4">
                            <MdChevronRight
                                size={44}
                                className="absolute top-10 right-8 dark:text-dark-alpha text-light-base -rotate-45 bg-neutral-400/30 rounded-full p-1 cursor-pointer"
                            />
                            <div className="relative z-50 text-3xl font-bold">Quiz Builder</div>
                            <div className="relative z-50 text-sm font-light">
                                Design interactive quizzes using our intuitive builder. Add
                                questions, set timers, assign scores, and more — all in one place.
                            </div>
                        </div>
                    </div>
                </UtilityCard>

                <UtilityCard className="min-w-[20rem] min-h-[18rem] max-h-[18rem] shadow-md border border-dashed transition-all duration-300 ease-in-out hover:shadow-lg grid-cols-1 relative overflow-hidden rounded-xl">
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                        <Image
                            src="/images/card-1.jpg"
                            alt="test"
                            className="object-cover scale-110"
                            fill
                            unoptimized
                        />
                    </div>
                    <div className="absolute bg-emerald-500 inset-0 w-[85%] rounded-tr-[4rem] z-10">
                        <div className="relative flex flex-col items-start justify-center px-12 gap-y-6 text-light-base dark:text-dark-alpha h-full -mt-4">
                            <DiCoda
                                size={32}
                                className="absolute top-10 right-10 dark:text-dark-alpha text-light-base"
                            />
                            <div className="relative z-50 text-3xl font-bold">
                                Performance Insights
                            </div>
                            <div className="relative z-50 text-sm font-light">
                                Track how your quizzes are performing in real-time. See completion
                                rates, average scores, and detailed user stats.
                            </div>
                        </div>
                    </div>
                </UtilityCard>
                <UtilityCard className="min-w-[20rem] min-h-[18rem] max-h-[18rem] shadow-md border border-dashed transition-all duration-300 ease-in-out hover:shadow-lg grid-cols-1 relative overflow-hidden rounded-xl">
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                        <Image
                            src="/images/card-2.jpg"
                            alt="test"
                            className="object-cover scale-110"
                            fill
                            unoptimized
                        />
                    </div>
                    <div className="absolute bg-blue-500 inset-0 w-[85%] rounded-tr-[4rem] z-10">
                        <div className="relative flex flex-col items-start justify-center px-12 gap-y-6 text-light-base dark:text-dark-alpha h-full -mt-4">
                            <DiCoda
                                size={32}
                                className="absolute top-10 right-10 dark:text-dark-alpha text-light-base"
                            />
                            <div className="relative z-50 text-3xl font-bold">
                                Performance Insights
                            </div>
                            <div className="relative z-50 text-sm font-light">
                                Track how your quizzes are performing in real-time. See completion
                                rates, average scores, and detailed user stats.
                            </div>
                        </div>
                    </div>
                </UtilityCard>
            </div>
        </div>
    );
}
