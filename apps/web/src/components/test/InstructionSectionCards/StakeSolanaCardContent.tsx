import { cn } from '@/lib/utils';
import { JSX } from 'react';
import { IoIosWifi } from 'react-icons/io';
import { IoBatteryHalf } from 'react-icons/io5';
import { MdNetworkCell } from 'react-icons/md';
import { SiSolana } from 'react-icons/si';

export default function StakeSolanaCardContent(): JSX.Element {
    return (
        <div className="w-60 h-60 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-2xl bg-light-alpha shrink-0 relative group overflow-hidden">
            <div className="group relative absolute h-15 w-15 bg-light-base ring-2 ring-light-alpha shadow-md shadow-black/10 rounded-xl z-10 top-30 left-1/2 -translate-x-1/2 flex justify-center items-center group-hover:-translate-y-1 transition-all transform duration-250 ease-in-out ">
                <svg width="0" height="0" className="absolute">
                    <defs>
                        <linearGradient id="solanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#9945FF" />
                            <stop offset="100%" stopColor="#14F195" />
                        </linearGradient>
                    </defs>
                </svg>

                <SiSolana
                    className={cn(
                        'absolute size-6.5',
                        'opacity-0 scale-90',
                        'transition-all duration-400 ease-out',
                        'group-hover:opacity-100 group-hover:scale-100',
                        'group-hover:drop-shadow-[0_0_14px_rgba(153,69,255,0.6)]',
                        '[&>path]:fill-[url(#solanaGradient)]',
                    )}
                />

                <SiSolana
                    className={cn(
                        'size-6.5 text-neutral-500',
                        'transition-all duration-400 ease-out',
                        'group-hover:opacity-0 group-hover:scale-110',
                    )}
                />
            </div>

            {/* iphone */}
            <div className="absolute h-70 w-40 ring-8 ring-dark-base/90 top-15 left-1/2 -translate-x-1/2 rounded-3xl flex flex-col py-1.5 px-2.75 group-hover:-translate-y-1 transition-all transform duration-250 ease-in-out shadow-xl shadow-neutral-600">
                <div className="bg-light-base mt-5 h-full w-full absolute left-0 rounded-t-2xl"></div>
                <div className="h-10 w-0.75 bg-neutral-700 absolute rounded-full -right-2.5 top-27" />

                <div className="h-4 w-0.75 bg-neutral-700 absolute rounded-full -left-2.25 top-17" />
                <div className="h-7 w-0.75 bg-neutral-700 absolute rounded-full -left-2.25 top-23" />
                <div className="h-7 w-0.75 bg-neutral-700 absolute rounded-full -left-2.25 top-31" />

                <div className="h-3.5 w-12 bg-dark-base/90 absolute left-1/2 -translate-x-1/2 rounded-full flex justify-end items-center px-2">
                    <div className="h-1 w-1 bg-neutral-600 rounded-full " />
                </div>
                <div className="w-full text-dark-base flex justify-between items-center text-[9px]">
                    <div className="tracking-tight text-[8px] font-semibold">12:00</div>

                    <div className="flex gap-x- items-center">
                        <IoIosWifi className="size-3" />
                        <MdNetworkCell className="mr-0.75 size-2.5 mb-px" />
                        <IoBatteryHalf className="size-3" />
                    </div>
                </div>
            </div>
        </div>
    );
}
