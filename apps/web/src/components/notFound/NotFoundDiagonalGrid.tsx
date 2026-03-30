'use client';
import { motion } from 'framer-motion';

const CARD_COLORS = [
    'bg-neutral-100',
    'bg-neutral-200/60',
    'bg-stone-100',
    'bg-zinc-100',
    'bg-slate-100',
    'bg-neutral-50',
    'bg-stone-200/50',
    'bg-zinc-200/40',
    'bg-neutral-100/80',
    'bg-stone-50',
];

const ROWS = 10;
const COLS = 12;

const SHADOW_REST = '4px 4px 0px 0px rgba(163,163,163,0.35)';
const SHADOW_ACTIVE = '6px 6px 0px 0px rgba(163,163,163,0.5)';

function getCardColor(row: number, col: number) {
    return CARD_COLORS[(row * 3 + col * 7) % CARD_COLORS.length]!;
}

function seededRandom(row: number, col: number) {
    const hash = Math.sin(row * 127.1 + col * 311.7) * 43758.5453;
    return hash - Math.floor(hash);
}

function shouldAnimate(row: number, col: number) {
    return seededRandom(row, col) < 0.4; // ~40% of cards animate
}

function getAnimationDelay(row: number, col: number) {
    return seededRandom(col, row) * 5;
}

export default function NotFoundDiagonalGrid() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
                className="absolute top-1/2 left-1/2"
                style={{
                    transform: 'translate(-50%, -50%) rotate(-12deg)',
                    width: '200%',
                    height: '200%',
                }}
            >
                <div className="w-full h-full flex flex-col items-center justify-center gap-3.5">
                    {Array.from({ length: ROWS }).map((_, row) => (
                        <div
                            key={row}
                            className="flex gap-3.5"
                            style={{
                                marginLeft: row % 2 === 0 ? 0 : 90,
                            }}
                        >
                            {Array.from({ length: COLS }).map((_, col) => {
                                const animated = shouldAnimate(row, col);
                                return (
                                    <motion.div
                                        key={col}
                                        className={`w-40 h-26 rounded-xl ${getCardColor(row, col)} border border-neutral-300/40`}
                                        style={animated ? { boxShadow: SHADOW_REST } : undefined}
                                        {...(animated && {
                                            animate: {
                                                boxShadow: [
                                                    SHADOW_REST,
                                                    SHADOW_ACTIVE,
                                                    SHADOW_REST,
                                                ],
                                                y: [0, -3, 0],
                                            },
                                            transition: {
                                                duration: 3.5,
                                                ease: 'easeInOut' as const,
                                                repeat: Infinity,
                                                delay: getAnimationDelay(row, col),
                                            },
                                        })}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Edge fades — all four sides blending into bg */}
            <div className="absolute inset-0 bg-linear-to-b from-light-alpha from-5% via-transparent via-50% to-light-alpha to-95%" />
            <div className="absolute inset-0 bg-linear-to-r from-light-alpha from-5% via-transparent via-50% to-light-alpha to-95%" />
        </div>
    );
}
