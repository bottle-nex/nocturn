'use client';
import React from 'react';
import type { JSX } from 'react';
import { IoMicOutline } from 'react-icons/io5';
import {
    CreateCardContent,
    LaunchCardContent,
    ManageCardContent,
    PublishCardContent,
} from './InstructionSectionCards';
import { GoPlus } from 'react-icons/go';

export default function App(): JSX.Element {
    return (
        <section className="relative min-h-screen w-full bg-light-base flex flex-col items-center justify-around px-6 font-sans text-dark-base overflow-x-hidden">
            <div className="flex flex-col gap-y-2">
                <div className="w-full flex justify-center text-base tracking-wide">
                    For everyone
                </div>
                <div className="w-full flex justify-center text-3xl tracking-wide">
                    GET TO KNOW NOCTURN
                </div>
            </div>

            <div className="relative w-full max-w-200 h-65 z-10 -top-30">
                <div className="absolute left-0 bottom-0 -rotate-2">
                    <CreateCardContent />
                </div>

                <div className="absolute left-48 bottom-0 rotate-2">
                    <PublishCardContent />
                </div>

                <div className="absolute right-52 bottom-0 -rotate-3">
                    <LaunchCardContent />
                </div>

                <div className="absolute right-0 bottom-0 rotate-3">
                    <ManageCardContent />
                </div>
            </div>

            <div className="absolute top-2/3">
                <div className="relative z-20 w-230 h-14 ring-1 ring-black/10 rounded-full bg-light-alpha flex justify-between items-center px-6 shadow-sm">
                    <div className="text-neutral-400/80 text-sm">Create a quiz for me....</div>

                    <div className="flex gap-x-2.5 mt-px">
                        <GoPlus className="size-5.5" />
                        <IoMicOutline className="size-5" />
                    </div>
                </div>
            </div>
        </section>
    );
}
