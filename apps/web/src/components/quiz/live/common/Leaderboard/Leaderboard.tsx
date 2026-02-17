import { cn } from "@/lib/utils";
import Tiers from "./Tiers";
import Graph from "./Graph";
import Rank from "./Rank";
import RankCard, { GROWTH } from "./RankCard";
import NotchCard from "@/components/ui/NotchCard";

type HostMode = {
    host: true;
    spectator?: never;
    participant?: never;
};

type SpectatorMode = {
    spectator: true;
    host?: never;
    participant?: never;
};

type ParticipantMode = {
    participant: true;
    host?: never;
    spectator?: never;
};

type LeaderboardMode = HostMode | SpectatorMode | ParticipantMode;

interface BaseProps {
    className?: string;
}

type LeaderboardProps = BaseProps & LeaderboardMode;

export default function Leaderboard({ className }: LeaderboardProps) {
    return (
        <div
            className={cn(
                "flex justify-end items-center p-2 text-dark-alpha h-full",
                className
            )}
        >
            <div
                className={cn(
                    "h-full w-210 border border-dark-base rounded-2xl bg-light-alpha/10 backdrop-blur-[2px] shadow-md",
                    "grid grid-cols-4 grid-rows-8",
                    "p-3 gap-3"
                )}
            >
                <Tiers className="col-span-2 row-span-3 border border-dark-base rounded-[10px]" />

                <NotchCard
                    className="col-span-2 row-span-2 border border-dark-base rounded-[10px] px-4 py-3 flex justify-center items-center font-extralight tracking-wide"
                    label={'explanation'}
                >
                    <div>
                        this is the question's explanation of how this is answer is correct.
                    </div>
                </NotchCard>

                <Graph
                    className="col-span-2 row-span-2 border border-dark-base rounded-[10px]"
                    points={[10, 25, 18, 40, 22, 55, 30]}
                />

                <NotchCard
                    className="col-span-2 row-span-1 border border-dark-alpha rounded-[10px] h-full min-h-0 "
                    label={"your response"}
                >
                    <RankCard
                        growth={GROWTH.UP}
                        rank={31}
                        image={'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-6.jpg'}
                        name={'John Doe'}
                        streak={1}
                        points={22}
                    />

                </NotchCard>

                <Rank className="col-span-4 row-span-4 border border-dark-base rounded-[10px] overflow-hidden" />
            </div>
        </div>
    );
}
