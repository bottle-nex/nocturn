import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import { CgLoadbar } from "react-icons/cg";
import Image from "next/image";

export enum GROWTH {
    UP = "UP",
    DOWN = "DOWN",
    NEUTRAL = "NEUTRAL",
}

interface RankProps {
    growth: GROWTH;
    rank: number;
    image: string;
    name: string;
    streak?: number;
    points?: number;
}

export default function RankCard({ growth, rank, image, name, streak = 0, points = 0 }: RankProps) {

    function computeRank(rank: number): string {
        const lastDigit = rank % 10;
        switch (lastDigit) {
            case 1:
                return rank.toString() + 'st';
            case 2:
                return rank.toString() + 'nd';
            case 3:
                return rank.toString() + 'rd';
            default:
                return rank.toString() + 'th';
        }
    }

    return (
        <div className="h-16 bg-light-alpha text-dark-alpha flex justify-between items-center px-6 py-2 font-extralight text-sm tracking-wider ">
            <div className="flex justify-between items-center gap-x-8 ">
                <div className="flex justify-between items-center gap-x-4 ">
                    <GrowthSign growth={growth} />
                    <div className="w-10 ">
                        {computeRank(rank)}
                    </div>
                </div>
                <div className="flex justify-between items-center gap-x-3 ">
                    <Image
                        src={image}
                        alt={name}
                        height={32}
                        width={32}
                        unoptimized
                        className={"rounded-full"}
                    />
                    <div>
                        {name}
                    </div>
                </div>
            </div>
            <div className="w-10 flex justify-center items-center ">
                {streak}
            </div>
            <div>
                {points + " points"}
            </div>
        </div>
    );
}

function GrowthSign({ growth }: { growth: GROWTH }) {
    switch (growth) {
        case GROWTH.UP:
            return <TiArrowSortedUp color={'green'} />;
        case GROWTH.DOWN:
            return <TiArrowSortedDown color={'red'} />;
        case GROWTH.NEUTRAL:
            return <CgLoadbar color={'grey'} />;
    }
}