"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import LandingSectionHeader from "../refactor/LandingSectionHeader";

interface Card {
    title: string;
    description: string;
    skeleton: React.ReactNode;
    className: string;
    config: {
        y: number;
        zIndex: number;
    };
};

const cards = [
    {
        title: "Main Character Energy",
        description:
            "That one selfie you take when the deploy actually works on the first try. Rare moment. Had to capture it.",
        skeleton: <div className="h-48 w-full rounded-xl relative">
            <Image
                src={"/images/founders/gallery-1.JPG"}
                alt={"image-1"}
                layout="fill"
                objectFit="cover"
                className="object-cover rounded-lg"
            />
        </div>,
        className: "bg-[#00498A] [&_h2]:text-white",
        config: {
            y: -20,
            x: 0,
            rotate: -5,
            zIndex: 2,
        },
    },

    {
        title: "The Squad",
        description:
            "Three devs, one dream, and a shared hatred for merge conflicts. We clean up better than our git history, clearly.",
        skeleton: <div className="h-48 w-full rounded-xl relative">
            <Image
                src={"/images/founders/gallery-4.JPG"}
                alt={"image-2"}
                layout="fill"
                objectFit="cover"
                className="object-cover rounded-lg"
            />
        </div>,
        className: "bg-[#004D40] [&_h2]:text-white",
        config: {
            y: 20,
            x: 180,
            rotate: 8,
            zIndex: 3,
        },
    },
    {
        title: "Touch Grass Mode",
        description:
            "Beach, bros, and zero lines of code. Arms on shoulders because we carry each other,in life and in production.",
        skeleton: <div className="h-48 w-full rounded-xl relative">
            <Image
                src={"/images/founders/gallery-2.JPG"}
                alt={"image-3"}
                layout="fill"
                className="object-cover rounded-lg"
            />
        </div>,
        className: "bg-dark-alpha [&_h2]:text-white",
        config: {
            y: -40,
            x: 500,
            rotate: -5,
            zIndex: 4,
        },
    },
    {
        title: "Caffeine & Chaos",
        description:
            "One laptop, three opinions, and somehow it all ships. This is what 'collaborative coding' actually looks like,pure, beautiful chaos.",
        skeleton: <div className="h-48 w-full rounded-xl relative">
            <Image
                src={"/images/founders/gallery-3.JPG"}
                alt={"image-4"}
                layout="fill"
                objectFit="cover"
                className="object-cover rounded-lg"
            />
        </div>,
        className: "bg-[#C2410C] [&_h2]:text-white",
        config: {
            y: 20,
            x: 740,
            rotate: 6,
            zIndex: 5,
        },
    },

];

export default function GooeyGallery() {
    const [active, setActive] = useState<Card | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setActive(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    function isAnyCardActive() {
        return active?.title;
    }

    function isCurrentActive(card: Card) {
        return active?.title === card.title;
    };


    return (
        <section className="max-w-270 mx-auto w-full">
            <LandingSectionHeader
                heading="Founders Gallery"
                subheading="The faces behind the 3 AM commits, the broken builds, and the 'it works on my machine' moments that somehow shipped to production."
            />
            <motion.div ref={ref} className="w-full h-160 relative mt-40">

                {cards.map((card) => (
                    <motion.div className="shadow-[0_35px_70px_rgba(0,73,138,0.2)]" key={card.title}>
                        <motion.button
                            initial={{
                                y: 400,
                                x: 0,
                                scale: 0,
                            }}
                            onClick={() => {
                                setActive(card);
                            }}
                            animate={{
                                y: isCurrentActive(card) ? 0 : (isAnyCardActive() ? 400 : card.config.y),
                                x: isCurrentActive(card) ? 320 : (isAnyCardActive() ? card.config.x * 0.4 + 244 : card.config.x),
                                rotate: isCurrentActive(card) ? 0 : (isAnyCardActive() ? 0.2 * card.config.rotate : card.config.rotate),
                                scale: isCurrentActive(card) ? 1 : (isAnyCardActive() ? 0.7 : 1),
                                width: isCurrentActive(card) ? 400 : 320,
                                height: isCurrentActive(card) ? 500 : 400,
                            }}
                            whileHover={{
                                scale: isCurrentActive(card) ? 1 : (isAnyCardActive() ? 0.7 : 1.05),
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 100,
                                damping: 15,
                            }}
                            style={{
                                zIndex: active?.config.zIndex,
                            }}
                            className={cn(
                                "w-60 p-6 absolute inset-0 items-start cursor-pointer  rounded-2xl flex flex-col justify-between overflow-hidden",
                                "shadow-[0_35px_70px_rgba(0,73,138,0.2)]",
                                card.className
                            )}
                        >

                            {card.skeleton}
                            <div>
                                <motion.h2 layoutId={card.title + "title"} className="font-signika max-w-40 text-3xl text-left font-regular ">
                                    {card.title}
                                </motion.h2>
                                <AnimatePresence mode="popLayout">
                                    {active?.title === card.title && (
                                        <motion.p
                                            layoutId={card.title + "description"}
                                            initial={{ opacity: 0, x: 20, y: 20, height: 0 }}
                                            animate={{ opacity: 1, x: 0, y: 0, height: 100 }}
                                            exit={{ opacity: 0, x: 40, y: 40, }}
                                            transition={{ duration: 0.3, delay: 0.1, }}
                                            className="text-white/80 text-lg mt-3 text-left"
                                        >
                                            {card.description}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.button>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};