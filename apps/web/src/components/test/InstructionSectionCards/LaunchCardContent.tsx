import { JSX } from 'react';
import { FiZap } from 'react-icons/fi';

export default function LaunchCardContent(): JSX.Element {
    return (
        <div className="w-60 h-60 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-2xl bg-light-alpha shrink-0 relative group">
            <div className="absolute top-3.5 left-3.5 bg-light-base flex justify-center items-center cursor-pointer hover:bg-neutral-200/70 transition-colors transform duration-200 text-neutral-500 px-2 py-0.5 text-xs rounded-sm ring-1 ring-neutral-200">
                Stake SOL
            </div>
            <div className="p-6 h-full flex gap-5 relative rounded-sm">
                <div className="flex-1 flex flex-col justify-end gap-3 pb-2 relative z-2">
                    <div className="h-2.5 bg-dark-faded/70 rounded-full" />
                    <div className="h-2 bg-dark-faded rounded-full w-full" />
                    <div className="h-2 bg-dark-faded/70 rounded-full w-3/4" />
                </div>
                <div className="flex flex-col items-center justify-end gap-5 relative z-2">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all transform duration-300">
                        <FiZap className="text-white" />
                    </div>
                    <div className="text-[9px] font-black px-4 py-2 bg-slate-900 text-white rounded-md">
                        Wallet
                    </div>
                </div>
            </div>
        </div>
    );
}
