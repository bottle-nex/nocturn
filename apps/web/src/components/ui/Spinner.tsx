"use client";

import { motion } from "framer-motion";

interface Tick {
    color: string;
    index: number;
}

export default function Spinner() {
    const tick: Tick[] = [
        { color: "bg-red-500", index: 0 },
        { color: "bg-blue-500", index: 1 },
        { color: "bg-green-500", index: 2 },
        { color: "bg-yellow-500", index: 3 },
    ];

    return (
        <motion.div
            className="grid grid-cols-2 gap-0.75"
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            transition={{
                repeat: Infinity,
                duration: 0.8,
                times: [0, 0.25, 0.55, 0.8, 1],
                ease: "linear",
            }}
        >
            {tick.map((t) => (
                <div
                    key={t.index}
                    className={`w-1 h-1 rounded-full ${t.color}`}
                />
            ))}
        </motion.div>
    );
}
