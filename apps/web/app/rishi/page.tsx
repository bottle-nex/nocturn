"use client";
import AppLogo from "@/components/app/AppLogo";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCannonConfetti } from "@/hooks/useCannonConfetti";

const names = [
    'John Doe', 'Alwin', 'Roopika', 'somya', 'Kathy',
    'John Thomas', 'Gokul P Jayan', 'Gokul Krishna', 'Santosh', 'Venkidesh',
    'Priya', 'Rahul', 'Ananya', 'Dev', 'Meera',
    'Arjun', 'Sneha', 'Vikram', 'Nisha', 'Aditya',
    'Kavya', 'Ravi', 'Pooja', 'Amit', 'Divya',
    'Suresh', 'Lakshmi', 'Kiran', 'Neha', 'Sanjay',
    'Deepa', 'Manoj', 'Swati', 'Rajesh', 'Anjali',
    'Harish', 'Rekha', 'Ganesh', 'Ishita', 'Pranav',
    'Shruti', 'Varun',
];

const data = [
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-4.jpg', position: 1, name: names[0]!, score: 18247 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-5.jpg', position: 2, name: names[1]!, score: 16706 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-6.jpg', position: 3, name: names[2]!, score: 16496 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-3.jpg', position: 4, name: names[3]!, score: 16293 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-4.jpg', position: 5, name: names[4]!, score: 16152 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-5.jpg', position: 6, name: names[5]!, score: 15784 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-6.jpg', position: 7, name: names[6]!, score: 15662 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-7.jpg', position: 8, name: names[7]!, score: 15574 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-8.jpg', position: 9, name: names[8]!, score: 15514 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-9.jpg', position: 10, name: names[9]!, score: 15499 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-10.jpg', position: 11, name: names[10]!, score: 15320 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-11.jpg', position: 12, name: names[11]!, score: 15105 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-12.jpg', position: 13, name: names[12]!, score: 14890 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-13.jpg', position: 14, name: names[13]!, score: 14650 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-14.jpg', position: 15, name: names[14]!, score: 14410 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-15.jpg', position: 16, name: names[15]!, score: 14200 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-16.jpg', position: 17, name: names[16]!, score: 13980 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-17.jpg', position: 18, name: names[17]!, score: 13750 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-1.jpg', position: 19, name: names[18]!, score: 13500 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-2.jpg', position: 20, name: names[19]!, score: 13280 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-3.jpg', position: 21, name: names[20]!, score: 13050 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-4.jpg', position: 22, name: names[21]!, score: 12800 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-5.jpg', position: 23, name: names[22]!, score: 12550 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-6.jpg', position: 24, name: names[23]!, score: 12300 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-7.jpg', position: 25, name: names[24]!, score: 12050 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-8.jpg', position: 26, name: names[25]!, score: 11800 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-9.jpg', position: 27, name: names[26]!, score: 11550 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-10.jpg', position: 28, name: names[27]!, score: 11300 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-11.jpg', position: 29, name: names[28]!, score: 11050 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-12.jpg', position: 30, name: names[29]!, score: 10800 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-13.jpg', position: 31, name: names[30]!, score: 10550 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-14.jpg', position: 32, name: names[31]!, score: 10300 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-15.jpg', position: 33, name: names[32]!, score: 10050 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-16.jpg', position: 34, name: names[33]!, score: 9800 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-17.jpg', position: 35, name: names[34]!, score: 9550 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-1.jpg', position: 36, name: names[35]!, score: 9300 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-1.jpg', position: 37, name: names[36]!, score: 9050 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-2.jpg', position: 38, name: names[37]!, score: 8800 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-3.jpg', position: 39, name: names[38]!, score: 8550 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-4.jpg', position: 40, name: names[39]!, score: 8300 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-5.jpg', position: 41, name: names[40]!, score: 8050 },
    { avatar: 'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-6.jpg', position: 42, name: names[41]!, score: 7800 },
];

const barColors = [
    '#841836', '#a4133c', '#c9184a', '#ff4d6d', '#ff758f', '#ff8fa3',
    '#1b035e', '#310e8a', '#5500b6', '#2100c7', '#7300d8', '#7248e4',
];

const topThree = data.filter(d => d.position <= 3);
const rest = data.filter(d => d.position > 3);
const maxScore = rest[0]?.score ?? 1;

export default function Rishi() {
    useCannonConfetti({ duration: 2500});

    return (
        <main className="flex items-center justify-center h-screen w-full select-none bg-yellow-500">
            <section className="max-w-7xl mx-auto max-h-[80dvh] w-full rounded-xl relative bg-white z-10 overflow-y-scroll custom-scrollbar" data-lenis-prevent>
                <div className="sticky top-0 left-0 z-10">
                    <AppLogo withText size={120} textColor="text-dark-base! dark:text-dark-base!" />
                </div>
                <div className="flex items-center justify-center gap-x-12 mt- pb-8">
                    {[...topThree].sort((a, b) => a.position % 2 - b.position % 2 || a.position - b.position).map((item) => (
                        <div key={item.position} className={cn("relative",
                            item.position === 1 && "-translate-y-6"
                        )}>
                            {item.position === 1 && (
                                <Image alt="crown" src={"/images/crown.png"} width={80} height={80} className="absolute -top-14 -rotate-20" />
                            )}
                            <Image src={item.avatar} alt={`Position ${item.position}`} width={120} height={120} className="rounded-full" />
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-full text-xs font-semibold text-neutral-800 aspect-square">
                                <span className="block text-center font-bold">#{item.position}</span>
                            </div>
                            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center text-xl! font-normal text-dark-faded">
                                <span className="block text-black">{item.name.split(" ")[0]}</span>
                                <span className="block text-sm text-dark-faded/80">{item.score}</span>
                            </div>
                       </div>
                    ))}
                </div>

                <div className="px-8 pb-8 flex flex-col gap-y-0 max-w-4xl mx-auto mt-12">
                    {rest.map((item) => {
                        const barWidthPercent = (item.score / maxScore) * 90;
                        return (
                            <div key={item.position} className="flex items-center gap-x-3">
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4, delay: (item.position - 4) * 0.04 + 0.6, ease: "easeOut" }}
                                    className="text-lg font-bold text-neutral-700 w-20 text-right shrink-0"
                                >
                                    {item.score.toLocaleString()} p
                                </motion.span>
                                <div className="flex-1 flex items-center min-w-0">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${barWidthPercent}%` }}
                                        transition={{ duration: 0.8, delay: (item.position - 4) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                                        className="h-10 rounded-r-full shrink-0"
                                        style={{
                                            backgroundColor: barColors[Math.floor(Math.random() * barColors.length)],
                                        }}
                                    />
                                    <div className="relative w-11 h-11 shrink-0 -translate-x-8 rounded-full bg-white border-2 border-white">
                                        <Image
                                            src={item.avatar}
                                            alt={item.name}
                                            fill
                                            className="rounded-full object-cover"
                                        />
                                    </div>
                                    <span className="text-lg font-semibold text-neutral-800 shrink-0 w-28 text-nowrap truncate">
                                        {item.name}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
