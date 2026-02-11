import { cn } from '@/lib/utils';
import { IoIosArrowDown } from 'react-icons/io';

export default function LandingSection() {
    return (
        <div className="h-screen w-screen bg-light-alpha flex flex-col pt-30 px-25">
            <div
                style={{
                    fontWeight: 900,
                }}
                className={cn(
                    'flex flex-col text-alpha text-[1.7rem] leading-none font-extrabold tracking-normal font-sans',
                )}
            >
                <div>THE ULTIMATE</div>
                <div>STAKE QUIZ</div>
            </div>

            <div
                style={{
                    fontWeight: 900,
                }}
                className={cn(
                    'flex flex-col text-[8rem] leading-[0.95] text-dark-base tracking-tight font-sans pt-8',
                )}
            >
                <div>RISK & REWARD</div>
                <div>TEST YOUR</div>
                <div>KNOWLEDGE</div>
            </div>

            <div className="flex w-full h-full py-10">
                <div className="w-1/2 h-full" />

                <div className="w-2/3 h-full flex flex-col text-dark-alpha justify-end text-[1.2rem] max-w-md gap-y-0.5">
                    <div style={{ fontWeight: 800 }} className="font-sans uppercase flex gap-x-1">
                        Are you ready to <div className="italic text-alpha"> stake your SOL?</div>
                    </div>
                    <div className="leading-[1.3]">
                        Join our stake-based quiz experience and challenge your knowledge while
                        competing for real rewards. Test your skills, make your moves, and see if
                        you can top the leaderboard.
                    </div>
                </div>

                <div className="w-1/3 h-full flex items-end justify-end">
                    <div className="h-12 w-33 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-full bg-alpha flex justify-between items-center px-2">
                        <div className="bg-light-base h-8 w-8 rounded-full flex justify-center items-center">
                            <IoIosArrowDown className="text-dark-base/70 animate-bounce stroke-1 duration-300" />
                        </div>
                        <div className="flex justify-center items-center pr-2.5">Join Quiz</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
