'use client';
import { JSX } from 'react';
import { IoArrowForward } from 'react-icons/io5';

const CARD_COLORS = [
    'bg-neutral-800/5',
    'bg-neutral-700/40',
    'bg-stone-800/60',
    'bg-zinc-800/50',
    'bg-neutral-800/80',
    'bg-stone-700/30',
    'bg-zinc-700/25',
    'bg-neutral-800/5',
];

const ROWS = 8;
const COLS = 14;

function getCardColor(row: number, col: number) {
    return CARD_COLORS[(row * 3 + col * 7) % CARD_COLORS.length]!;
}

export default function LandingCTASection(): JSX.Element {
    return (
        <section className="relative flex w-full max-w-270 items-center justify-center overflow-hidden px-6">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className="absolute top-1/2 left-1/2"
                    style={{
                        transform: 'translate(-50%, -50%) rotate(-12deg)',
                        width: '200%',
                        height: '200%',
                    }}
                >
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                        {Array.from({ length: ROWS }).map((_, row) => (
                            <div
                                key={row}
                                className="flex gap-3"
                                style={{
                                    marginLeft: row % 2 === 0 ? 0 : 80,
                                }}
                            >
                                {Array.from({ length: COLS }).map((_, col) => (
                                    <div
                                        key={col}
                                        className={`h-20 w-36 rounded-xl border border-neutral-700/25 ${getCardColor(row, col)}`}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="absolute inset-0 bg-linear-to-b from-dark-alpha from-5% via-transparent via-50% to-dark-alpha to-95%" />
                <div className="absolute inset-0 bg-linear-to-r from-dark-alpha from-5% via-transparent via-50% to-dark-alpha to-95%" />
            </div>

            <div className="relative z-10 flex flex-col items-center py-14">
                <div
                    className="mb-6 flex items-center gap-x-1.5 rounded-full px-3.5 py-1 ring-1 ring-alpha/15"
                    style={{
                        background: 'rgba(79, 70, 229, 0.06)',
                        color: 'rgba(79, 70, 229, 0.7)',
                    }}
                >
                    <span className="text-xs font-medium tracking-wide">
                        Mom was right, Knowledge pays
                    </span>
                </div>

                <h2
                    className="text-center text-4xl font-bold leading-[1.1] tracking-tight text-light-base md:text-5xl"
                    style={{ letterSpacing: '-0.025em' }}
                >
                    Start playing
                    <br />
                    <span style={{ color: 'rgba(245, 245, 245, 0.75)' }}>something great</span>
                </h2>

                <p
                    className="mt-5 max-w-sm text-center text-[15px] leading-relaxed"
                    style={{ color: 'rgba(245, 245, 245, 0.45)' }}
                >
                    Simple, focused quiz to make learning more fun.
                    <br className="hidden sm:inline" />
                    Get started in seconds, no setup needed.
                </p>

                <div className="mt-9">
                    <a
                        href="#"
                        className="group relative inline-flex cursor-pointer items-center gap-x-2 overflow-hidden rounded-xl px-7 py-3 text-sm font-medium text-white transition-all duration-200 ease-out hover:scale-[1.02] inset-shadow-xs inset-shadow-white/50"
                        style={{
                            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
                        }}
                    >
                        <span
                            className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                            style={{
                                background:
                                    'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                            }}
                        />

                        <span className="relative z-10">Get started</span>
                        <IoArrowForward className="relative z-10 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </a>
                </div>
            </div>
        </section>
    );
}
