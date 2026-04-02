import { MdSignalCellular1Bar, MdSignalCellular2Bar, MdSignalCellular4Bar } from 'react-icons/md';

export default function DifficultyCard() {
    return (
        <div className="h-65 w-65 ring-1 ring-black/10 rounded-xl flex flex-col overflow-hidden shadow-sm shadow-black/10 absolute rotate-6 bg-[#f9fcff] right-[23%] top-40 select-none">
            <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, black 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                }}
            />
            <div className="bg-[#008AFF] h-9 w-full text-light-base text-sm px-3.5 flex items-center shrink-0 z-10">
                Control the challenge
            </div>

            <div className="flex flex-col py-3 px-4 z-10">
                <div className="text-dark-base/60 text-base font-semibold">Set Difficulty</div>
                <div className="text-[13px] text-dark-base/60 leading-[1.1]">
                    Feel the quiz is easy, upgrade the difficulty
                </div>
            </div>

            <div className="w-full flex justify-between gap-x-2 px-3.5 mt-4 z-10">
                <div className="h-8 w-22 rounded-sm flex gap-x-1 px-2 items-center text-sm text-neutral-500 hover:bg-black/3 transition cursor-pointer">
                    <MdSignalCellular1Bar className="text-emerald-500" />
                    Easy
                </div>

                <div className="h-8 w-22 rounded-sm flex gap-x-1 px-2 items-center text-sm text-neutral-700 bg-white ring-1 ring-black/10 shadow-sm shadow-black/5 -translate-y-1 -rotate-3 cursor-pointer">
                    <MdSignalCellular2Bar className="text-amber-500" />
                    Medium
                </div>

                <div className="h-8 w-22 rounded-sm flex gap-x-1 px-2 items-center text-sm text-neutral-500 hover:bg-black/3 transition cursor-pointer">
                    <MdSignalCellular4Bar className="text-rose-500" />
                    Hard
                </div>
            </div>

            {/* very subtle bottom hint (no push effect) */}
            <div className="px-4 mt-3 text-[11px] text-dark-base/30 z-10">
                More difficulty → more reward
            </div>
        </div>
    );
}
