import { cn } from "@/lib/utils";
import Image from "next/image";

interface TiersProps {
    className?: string;
}

const rankers = [
    { rank: 2, image: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-10.jpg', name: 'Luffy', points: 157 },
    { rank: 1, image: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-17.jpg', name: 'Zoro', points: 201 },
    { rank: 3, image: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-7.jpg', name: 'Sanji', points: 123 },
]

export default function Tiers({ className }: TiersProps) {
    return (
        <div
            className={cn(
                'flex justify-center items-end text-dark-alpha ',
                'gap-x-1',
                className,
            )}
        >

            {rankers.map((r, i) => (
                <Bar
                    key={i}
                    rank={r.rank}
                    image={r.image}
                    name={r.name}
                    points={r.points}
                />
            ))}

        </div>
    );
}

interface BarProps {
    rank: number;
    image: string;
    name: string;
    points: number;
}

function Bar({ rank, image, name, points }: BarProps) {
    return (
        <div
            className={cn(
                "relative w-30 rounded-t-beta bg-blue-400 overflow-hidden text-dark-alpha ",
                rank === 1 ? "h-50" : rank === 2 ? "h-40" : "h-30",
            )}
        >
            <div className="absolute top-3 left-1/2 z-20 -translate-x-1/2 space-y-1 ">
                <Image
                    src={image}
                    alt={name}
                    width={48}
                    height={48}
                    unoptimized
                    className="rounded-full border-2 border-white shadow-md object-cover "
                />
                <div className="relative z-10 flex h-full items-end justify-center pb-2 font-extralight text-sm tracking-wide ">
                    {name.split(" ")[0]}
                </div>
            </div>

            <Image
                src={image}
                alt={name}
                fill
                unoptimized
                className="object-cover"
            />

            <div className="absolute inset-0 backdrop-blur-md bg-white/10" />

            <div className="relative z-10 flex h-full items-end justify-center pb-2 font-extralight text-sm tracking-wide ">
                {points}
            </div>
        </div>
    );
}
