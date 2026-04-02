import { CiPlay1 } from 'react-icons/ci';

export default function AICreateCard() {
    return (
        <div className="h-65 w-65 ring-1 ring-black/10 rounded-xl flex flex-col overflow-hidden shadow-sm shadow-black/10 bg-[#f9fcff] shrink-0 absolute -rotate-6 top-40 select-none">
            <div className="bg-[#00498A] h-9 w-full text-light-base text-sm px-3.5 flex items-center shrink-0">
                Create efficiently with AI
            </div>
            <div className="flex flex-col py-3 px-4">
                <div className="text-dark-base/60 text-base font-semibold">AI powered quiz</div>
                <div className="text-[13px] text-dark-base/60">
                    Use voice chat or type in the prompt.
                </div>
            </div>
            <div className="h-12 bg-light-alpha flex w-[80%] ml-auto rounded-full p-1 gap-x-4 mr-2 mt-1 ring-1 ring-black/5">
                <div className="h-10 w-10 rounded-full bg-dark-base flex justify-center items-center">
                    <CiPlay1 className="size-5 text-light-base" />
                </div>
                <div className="flex gap-x-1 items-center">
                    {[
                        4, 22, 10, 15, 5, 20, 7, 9, 4, 18, 5, 10, 12, 6, 18, 25, 8, 15, 5, 10, 6, 5,
                    ].map((h, i) => (
                        <div
                            key={i}
                            className="w-0.5 bg-dark-base rounded-full"
                            style={{ height: `${h}px` }}
                        />
                    ))}
                </div>
            </div>
            <div className="bg-light-alpha text-[13px] p-2.5 rounded-lg rounded-tl-none mt-3 mr-15 ml-2 ring-1 ring-black/5">
                Sure thing! Creating a quiz based on blockchain technology
            </div>
        </div>
    );
}
