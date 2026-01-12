"use client";

import { Button } from "../ui/button";
import OpacityBackground from "../utility/OpacityBackground";
import UtilityCard from "../utility/UtilityCard";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Dispatch, JSX, SetStateAction } from "react";
import { AnimatePresence } from "motion/react";

interface StartWithAiProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

export default function StartWithAi({ open, setOpen }: StartWithAiProps): JSX.Element {
    return (
        <AnimatePresence>
            {open && (
                <OpacityBackground className="bg-black/10 dark:bg-white/10" onBackgroundClick={() => { }}>
                    <UtilityCard className="max-w-[90vw] mx-auto w-full h-[90vh] rounded-md bg-white dark:bg-dark-base border-none p-0 overflow-hidden">
                        <div className="w-full h-full grid grid-cols-[28%_72%]">
                            <section className="border-r w-full">

                            </section>
                            <section className="w-full">
                                <div className="float-right flex items-center gap-x-3 p-3">
                                    <Button variant={'ghost'} onClick={() => setOpen(false)} className="rounded-full bg-none! text-black dark:bg-none! dark:text-white dark:hover:bg-dark-base hover:bg-white">Cancel</Button>
                                    <Button disabled={true} className="rounded-full dark:bg-white/90 text-white bg-black/80 dark:text-black">Continue</Button>
                                </div>
                                <div className="flex items-center justify-center h-full ml-32">
                                    <div className="w-160 aspect-auto">
                                        <DotLottieReact
                                            src="https://lottie.host/b1959678-dc96-46e0-91b3-97570b7dd364/fVioi2YmSv.lottie"
                                            loop
                                            autoplay
                                        />
                                        <span className="text-center w-full block mt-6 text-black/60 dark:text-white/60">Your preview will appear here</span>
                                    </div>
                                </div>

                            </section>
                        </div>
                    </UtilityCard>
                </OpacityBackground>
            )}
        </AnimatePresence>
    )
}

