import { cn } from "@/lib/utils";
import RankCard, { GROWTH } from "./RankCard";

interface RankProps {
    className?: string;
}

export default function Rank({ className }: RankProps) {

    function randomGrowth(): GROWTH {
        const random = Math.random();
        if (random < 0.33) return GROWTH.NEUTRAL;
        else if (random < 0.66) return GROWTH.DOWN;
        else return GROWTH.UP;
    }

    return (
        <div
            className={cn(
                "relative w-full h-full flex flex-col overflow-hidden",
                className
            )}
        >
            <div
                className={cn(
                    "sticky top-0 z-20 w-full h-16",
                    "text-dark-alpha",
                    "flex justify-between items-center",
                    "px-6 py-2",
                    "font-extralight text-sm tracking-wider",
                    "shadow-sm rounded-t-beta"
                )}
            >
                <div className="flex items-center gap-x-8">
                    <div className="flex items-center gap-x-4">
                        <div className="w-30">Rank</div>
                    </div>

                    <div className="flex items-center gap-x-3">
                        <div>Participant</div>
                    </div>
                </div>

                <div className="w-30 flex justify-center items-center">
                    Current streak
                </div>

                <div>Total points</div>
            </div>

            <div
                data-lenis-prevent
                className="flex-1 overflow-y-auto"
            >
                {Array.from({ length: 40 }).map((_, i) => (
                    <RankCard
                        key={i}
                        growth={randomGrowth()}
                        rank={i + 1}
                        image={"/images/founders/anjan.jpg"}
                        name={"Anjan Suman"}
                    />
                ))}
            </div>
        </div>
    );
}
