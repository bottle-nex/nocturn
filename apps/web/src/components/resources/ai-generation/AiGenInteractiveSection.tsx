"use client";

import { JSX } from "react";
import RipplingPillStack from "./RipplingPillStack";

interface Ticker {
    index: number,
    title: string
}


export default function AiGenInteractiveSection(): JSX.Element {
    const tickerData: Ticker[] = [
        {
            index: 0,
            title: "AI Generation"
        },
        {
            index: 1,
            title: "AI Generation"
        },
        {
            index: 2,
            title: "AI Generation"
        },
    ]
    return (
        <main className="max-w-270 mx-auto min-h-0 relative w-full">
            <section className="w-full grid grid-cols-[55%_55%] gap-x-12 h-180">
                <RipplingPillStack />
                <section className="w-full ">
                    <div className="w-full flex items-center justify-evenly">
                        {
                            tickerData.map((ticker) => (
                                <div className="ring-2 ring-[#4f46e5]/30 bg-[#4f46e5]/10 backdrop-blur-sm px-2 py-1 rounded-lg cursor-pointer" key={ticker.index}>
                                    <h1 className="text-base font-normal text-[#4f46e5]">{ticker.title}</h1>
                                </div>
                            ))
                        }
                    </div>
                </section>
            </section>
        </main>
    )
}
