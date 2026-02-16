import { cn } from "@/lib/utils";
import Tiers from "./Tiers";
import Explanation from "./Explanation";
import Graph from "./Graph";
import Rank from "./Rank";
import RankCard, { GROWTH } from "./RankCard";

export default function Leaderboard() {
    return (
        <div className="h-screen w-screen flex justify-end items-center bg-light-alpha p-2 text-dark-alpha ">
            <div
                className={cn(
                    "h-full w-210 border border-dark-base rounded-2xl bg-light-alpha shadow-md ",
                    'grid grid-cols-4 grid-rows-8 ',
                    'p-3 gap-3 '

                )}
            >
                <Tiers
                    className="col-span-2 row-span-3 border border-dark-base rounded-[10px] "
                />
                <Explanation
                    className="col-span-2 row-span-2 border border-dark-base rounded-[10px] "
                    explanation={"this is the question's explanation of how this is answer is correct."}
                />
                <Graph
                    className="col-span-2 row-span-2 border border-dark-base rounded-[10px] "
                    points={[10, 25, 18, 40, 22, 55, 30, 10, 25, 18, 40, 22, 55, 30, 10, 25, 18, 40, 22, 55, 30, 1]}
                />
                <div
                    className={cn(
                        "col-span-2 row-span-1 border border-dark-alpha rounded-[10px] ",
                        'relative flex justify-center items-center tracking-wide font-extralight ',
                    )}
                >

                    <div className="absolute -top-1.5 left-3 bg-light-alpha text-sm px-1 h-2 flex items-center justify-center">
                        your rank
                    </div>
                    <RankCard
                        growth={GROWTH.UP}
                        rank={31}
                        image={'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-6.jpg'}
                        name={'John Doe'}
                        streak={1}
                        points={22}
                    />
                </div>
                <Rank
                    className="col-span-4 row-span-4 border border-dark-base rounded-[10px] "
                />
            </div>
        </div>
    );
}