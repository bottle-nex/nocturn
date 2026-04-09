import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "framer-motion";

const users = [
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-1.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-2.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-3.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-4.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-5.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-6.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-7.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-8.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-9.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-10.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-11.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-12.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-13.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-14.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-15.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-16.jpg' },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-17.jpg' },
];

const names = [
    'John Doe',
    'Jane Smith',
    'Michael Johnson',
    'Emily Davis',
    'David Brown',
    'Sarah Wilson',
    'James Miller',
    'Olivia Taylor',
    'Daniel Anderson',
    'Sophia Thomas',
    'William Moore',
    'Isabella Jackson',
    'Alexander White',
    'Ava Harris',
    'Benjamin Martin',
    'Mia Thompson',
    'Christopher Garcia',
];

const barColors = [
    '#841836',
    '#a4133c',
    '#c9184a',
    '#ff4d6d',
    '#ff758f',
    '#ff8fa3',
    '#1b035e',
    '#310e8a',
    '#5500b6',
    '#2100c7',
    '#7300d8',
    '#7248e4',
];

const sorted = users.map((u, i) => ({
    avatar: u.avatar,
    position: i + 1,
    name: names[i] ?? `Player ${i + 1}`,
    score: Math.round(10000 - i * 480 + (i % 3) * 120),
}));

const topThree = sorted.filter((d) => d.position <= 3);
const rest = sorted.filter((d) => d.position > 3);
const maxScore = rest[0]?.score ?? 1;

export default function RightLeaderboardsComponent() {
    return (
        <main className="bg-dark-base w-full h-120 lg:h-full block overflow-y-auto custom-scrollbar p-6 lg:p-8 text-light-base">
            <h1 className="text-center text-2xl mb-12">Quiz Leaderboards</h1>
            <div className="flex items-center justify-center gap-x-8 pt-10 pb-6">
                {[...topThree]
                    .sort(
                        (a, b) =>
                            (a.position % 2) - (b.position % 2) ||
                            a.position - b.position,
                    )
                    .map((item) => (
                        <div
                            key={item.position}
                            className={cn(
                                'relative',
                                item.position === 1 && '-translate-y-4',
                            )}
                        >
                            {item.position === 1 && (
                                <Image
                                    alt="crown"
                                    src="/images/crown.png"
                                    width={56}
                                    height={56}
                                    className="absolute -top-10 -rotate-20"
                                />
                            )}
                            <Image
                                src={item.avatar}
                                alt={`Position ${item.position}`}
                                width={80}
                                height={80}
                                className="rounded-full"
                            />
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-neutral-800 aspect-square">
                                <span className="block text-center font-bold">
                                    #{item.position}
                                </span>
                            </div>
                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center text-base font-normal">
                                <span className="block text-black text-sm">
                                    {item.name.split(' ')[0]}
                                </span>
                                <span className="block text-xs">{item.score}</span>
                            </div>
                        </div>
                    ))}
            </div>

            <div className="px-4 pb-4 flex flex-col gap-y-0 max-w-2xl mx-auto mt-10">
                {rest.map((item) => {
                    const barWidthPercent = (item.score / maxScore) * 80;
                    return (
                        <div key={item.position} className="flex items-center gap-x-2">
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.4,
                                    delay: (item.position - 4) * 0.04 + 0.6,
                                    ease: 'easeOut',
                                }}
                                className="text-sm font-bold w-14 text-right shrink-0"
                            >
                                {item.score.toLocaleString()} p
                            </motion.span>
                            <div className="flex-1 flex items-center min-w-0">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${barWidthPercent}%` }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.8,
                                        delay: (item.position - 4) * 0.04,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="h-8 rounded-r-full shrink-0"
                                    style={{
                                        backgroundColor:
                                            barColors[
                                            (item.position - 1) % barColors.length
                                            ],
                                    }}
                                />
                                <div className="relative w-9 h-9 shrink-0 -translate-x-6 rounded-full bg-white border-2 border-white">
                                    <Image
                                        src={item.avatar}
                                        alt={item.name}
                                        fill
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <span className="text-sm font-semibold  shrink-0 w-24 text-nowrap truncate">
                                    {item.name}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}