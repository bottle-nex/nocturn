import { motion, Variants, animate, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { JSX, useEffect, useRef, useState, createContext, useContext } from 'react';

const HoverContext = createContext(false);

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

function generateKeyframes(base: number, count = 20): { frames: number[]; times: number[] } {
    const frames: number[] = [base];
    for (let i = 1; i < count; i++) {
        const swing = 6 + Math.random() * 16;
        const direction = Math.random() > 0.5 ? 1 : -1;
        const next = Math.min(98, Math.max(5, frames[frames.length - 1] + direction * swing));
        frames.push(next);
        frames.push(next);
    }
    frames.push(base);
    frames.push(base);

    const total = frames.length;
    const pairs = total / 2;
    const times: number[] = [];
    for (let i = 0; i < pairs; i++) {
        const t = i / pairs;
        times.push(t);
        times.push(t + 0.88 / pairs);
    }

    return { frames, times: times.slice(0, total) };
}

export function ManageCardContent(): JSX.Element {
    const [isHovering, setIsHovering] = useState<boolean>(false);

    return (
        <HoverContext.Provider value={isHovering}>
            <motion.div
                variants={container}
                initial="rest"
                whileHover="hover"
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
                className="w-55 h-55 ring-2 ring-black/10  shadow-xs shadow-black/5 rounded-2xl bg-light-alpha flex flex-col justify-center gap-y-4 px-4 select-none"
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
        </HoverContext.Provider>
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
    const isHovering = useContext(HoverContext);
    const width = useMotionValue(value);
    const widthPercent = useTransform(width, (v) => `${v}%`);
    const displayPts = useTransform(width, (v) => `${Math.round((v / 100) * pts)} pts`);
    const animationRef = useRef<ReturnType<typeof animate> | null>(null);

    const startLoop = () => {
        const { frames, times } = generateKeyframes(value);
        animationRef.current = animate(width, frames, {
            duration: (frames.length / 2) * 1.8,
            ease: 'easeOut',
            times,
            repeat: Infinity,
            repeatType: 'loop',
        });
    };

    const stopLoop = () => {
        if (animationRef.current) {
            animationRef.current.stop();
            animationRef.current = null;
        }
        animationRef.current = animate(width, value, {
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
        });
    };

    useEffect(() => {
        if (isHovering) {
            const delay = Math.random() * 250;
            const t = setTimeout(startLoop, delay);
            return () => clearTimeout(t);
        } else {
            stopLoop();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHovering]);

    useEffect(() => {
        return () => {
            if (animationRef.current) animationRef.current.stop();
        };
    }, []);

    return (
        <motion.div variants={rowVariants} className="flex items-center gap-3 w-full">
            <div className="h-9 w-9 ring-1 ring-black/10 shadow-xs rounded-full overflow-hidden relative shrink-0">
                <Image src={img} alt="" fill unoptimized className="object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between text-[11px]">
                    <motion.span className="text-dark-base/80 ">{displayPts}</motion.span>
                </div>
                <div className="w-full h-3 rounded-full bg-dark-base/10 overflow-hidden ring-1 ring-black/10 ">
                    <motion.div
                        style={{ width: widthPercent }}
                        className={`h-full rounded-full ${
                            active ? 'bg-dark-base' : 'bg-dark-base/40'
                        }`}
                    />
                </div>
            </div>
        </motion.div>
    );
}
