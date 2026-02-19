import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import { JSX } from 'react';

const container: Variants = {
    rest: {},
    hover: {
        transition: {
            staggerChildren: 0.09,
            delayChildren: 0.15,
        },
    },
};

const rowVariants: Variants = {
    rest: { opacity: 1 },
    hover: {
        opacity: 1,
        transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
    },
};

const barVariants: Variants = {
    rest: (value: number) => ({
        width: `${value}%`,
    }),
    hover: (value: number) => ({
        width: [`${value}%`, `${value + 3}%`, `${value}%`],
        transition: {
            duration: 1.4,
            ease: [0.22, 1, 0.36, 1],
        },
    }),
};

export function ManageCardContent(): JSX.Element {
    return (
        <motion.div
            variants={container}
            initial="rest"
            whileHover="hover"
            className="w-55 h-55 ring-2 ring-black/10 shadow-xs shadow-black/5 rounded-2xl bg-light-alpha flex flex-col justify-center gap-y-4 px-4 select-none"
        >
            <LeaderRow
                img="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-2.jpg"
                pts={280}
                value={100}
                active
            />

            <LeaderRow
                img="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-5.jpg"
                pts={75}
                value={75}
            />

            <LeaderRow
                img="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-3.jpg"
                pts={90}
                value={35}
            />

            <LeaderRow
                img="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-4.jpg"
                pts={90}
                value={35}
            />
        </motion.div>
    );
}

function LeaderRow({
    img,
    pts,
    value,
    active,
}: {
    img: string;
    pts: number;
    value: number;
    active?: boolean;
}): JSX.Element {
    return (
        <motion.div variants={rowVariants} className="flex items-center gap-3 w-full">
            <div className="h-9 w-9 ring-1 ring-black/10 shadow-xs rounded-full overflow-hidden relative shrink-0">
                <Image src={img} alt="" fill unoptimized className="object-cover" />
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between text-[11px]">
                    <span className="text-dark-base/80">{pts} pts</span>
                </div>

                <div className="w-full h-3 rounded-full bg-dark-base/10 overflow-hidden ring-1 ring-black/10">
                    <motion.div
                        variants={barVariants}
                        custom={value + Math.random()}
                        initial="rest"
                        animate="rest"
                        className={`h-full rounded-full ${
                            active ? 'bg-dark-base' : 'bg-dark-base/40'
                        }`}
                    />
                </div>
            </div>
        </motion.div>
    );
}
