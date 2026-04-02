function EditWidget() {
    return (
        <div className="flex flex-col gap-y-2 px-3 mt-3">
            <div className="bg-light-alpha ring-1 ring-black/5 rounded-lg p-2.5 flex flex-col gap-y-1.5">
                <div className="text-[10px] font-semibold text-dark-base/70">
                    Q3. What is a blockchain?
                </div>
                <div className="flex items-center gap-x-1.5">
                    <div className="h-3 w-3 rounded-full ring-1 ring-black/20 shrink-0" />
                    <div className="h-1.5 flex-1 bg-dark-base/10 rounded-full" />
                </div>
                <div className="flex items-center gap-x-1.5">
                    <div className="h-3 w-3 rounded-full bg-dark-base shrink-0 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <div className="h-1.5 w-[55%] bg-dark-base/20 rounded-full" />
                </div>
                <div className="flex items-center gap-x-1.5">
                    <div className="h-3 w-3 rounded-full ring-1 ring-black/20 shrink-0" />
                    <div className="h-1.5 w-[40%] bg-dark-base/10 rounded-full" />
                </div>
            </div>
            <div className="bg-light-alpha ring-1 ring-black/5 rounded-lg p-2.5 flex flex-col gap-y-1.5">
                <div className="text-[10px] font-semibold text-dark-base/70">
                    Q3. Which is best quiz platform?
                </div>
                <div className="flex items-center gap-x-1.5">
                    <div className="h-3 w-3 rounded-full ring-1 ring-black/20 shrink-0" />
                    <div className="h-1.5 flex-1 bg-dark-base/10 rounded-full" />
                </div>
                <div className="flex items-center gap-x-1.5">
                    <div className="h-3 w-3 rounded-full bg-dark-base shrink-0 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                    <div className="h-1.5 w-[55%] bg-dark-base/20 rounded-full" />
                </div>
                <div className="flex items-center gap-x-1.5">
                    <div className="h-3 w-3 rounded-full ring-1 ring-black/20 shrink-0" />
                    <div className="h-1.5 w-[40%] bg-dark-base/10 rounded-full" />
                </div>
            </div>
            {/* <div className="flex items-center gap-x-1.5 bg-light-alpha rounded-lg px-2.5 py-1.5 ring-1 ring-black/5">
                <PenLine className="size-3 text-dark-base/50 shrink-0" />
                <span className="text-[10px] text-dark-base/50">Click any field to edit inline</span>
            </div> */}
        </div>
    );
}

export default function ManualEditCard() {
    return (
        <div className="h-65 w-65 ring-1 ring-black/10 rounded-xl flex flex-col overflow-hidden shadow-sm shadow-black/10 absolute bg-[#fffaf9] -right-4 -rotate-4 select-none">
            <div className="bg-[#FF3200] h-9 w-full text-light-base text-sm px-3.5 flex items-center shrink-0">
                Fine-tune your quiz
            </div>
            <div className="flex flex-col py-3 px-4">
                <div className="text-dark-base/60 text-base font-semibold">Manual Edit</div>
                <div className="text-[13px] text-dark-base/60">
                    Tweak questions after AI generates them
                </div>
            </div>
            <EditWidget />
        </div>
    );
}
