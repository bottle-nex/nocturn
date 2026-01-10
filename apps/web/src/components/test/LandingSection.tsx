'use client';

import Image from 'next/image';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MdHomeFilled, MdChevronRight } from 'react-icons/md';
import { FaLocationArrow } from 'react-icons/fa6';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';

export default function LandingSection() {
    const { session, setOpenSigninModal } = useUserSessionStore();
    const router = useRouter();

    function getStartedHandler() {
        if (session?.user.id) {
            router.push('/home');
        } else {
            setOpenSigninModal(true);
        }
    }

    return (
        <main className="w-full relative min-h-screen bg-[#eceadd] flex flex-col items-center justify-center border-b border-black overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0 dot-bg" />

            <div className="absolute top-160 left-80 w-8 h-8 border-t-2 border-l-2 border-black/40 z-0" />
            <div className="absolute top-160 right-80 w-8 h-8 border-t-2 border-r-2 border-black/40 z-0" />
            <div className="absolute bottom-27.5 left-80 w-8 h-8 border-b-2 border-l-2 border-black/40 z-0" />
            <div className="absolute bottom-27.5 right-80 w-8 h-8 border-b-2 border-r-2 border-black/40 z-0" />

            <div className="neo-shadow absolute top-44 right-[15.5%] text-white font-semibold bg-[#2F73DC] px-4 py-1.5 text-lg z-10">
                Yo, I just won 5 SOL
            </div>

            <div className="absolute top-54 right-[26%] text-3xl text-[#2F73DC] -rotate-180 z-10">
                <FaLocationArrow />
            </div>

            {/* <FloatingStickers/> */}

            <section className="max-w-3xl text-center mt-60 relative z-10">
                <Button
                    onClick={getStartedHandler}
                    className="text-xl text-black rounded-none px-6 py-5 border-2 border-black shadow-custom cursor-pointer bg-white hover:bg-white active:scale-98"
                >
                    {session?.user.id ? (
                        <span className="flex items-center gap-x-2">
                            <MdHomeFilled style={{ fontSize: 40 }} /> Home
                        </span>
                    ) : (
                        <span className="flex items-center gap-x-2">
                            Get Started <MdChevronRight className="h-20 w-20" />
                        </span>
                    )}
                </Button>

                <div className="relative">
                    <div className="absolute -top-20 -right-40 z-0">
                        <Image alt="cat" width={280} height={280} src="/illustrations/cat.png" />
                    </div>
                    <h1 className="text-8xl text-black mt-8 relative z-10">
                        Put Your Money on Your Mind.
                    </h1>
                </div>

                <p className="text-2xl mt-4 text-black">
                    A high-stakes quiz arena where knowledge isn&apos;t just tested — it&apos;s
                    wagered. Create or join competitive quizzes, stake real value, survive
                    elimination rounds, and let skill decide the payout.
                </p>
            </section>

            <section className="max-w-6xl mx-auto border-4 border-black h-[40vh] w-full mb-40 mt-20 bg-[#FF3F7F] relative overflow-hidden z-10">
                <div className="absolute inset-0 flex items-center justify-between px-16">
                    <motion.div
                        className="flex flex-col gap-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="text-xs font-bold tracking-[0.3em] text-black uppercase mb-1">
                            LIVE NOW
                        </span>
                        <h2 className="text-7xl font-black text-black tracking-tighter leading-[0.85] mb-3">
                            THE
                            <br />
                            <span className="text-white">ARENA</span>
                        </h2>
                        <p className="text-base font-medium text-black/70 max-w-xs leading-tight">
                            High-stakes trivia where speed meets strategy. Winner takes all.
                        </p>
                    </motion.div>

                    <motion.div
                        className="flex flex-col items-center gap-8"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <div className="relative">
                            <motion.div
                                className="w-24 h-24 border-4 border-black bg-[#FFC400] flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            >
                                <span className="text-4xl font-black">?</span>
                            </motion.div>
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-black rounded-full border-2 border-white" />
                        </div>

                        <div className="flex gap-10 text-center">
                            <div>
                                <span className="text-4xl font-black text-black block leading-none">
                                    10s
                                </span>
                                <span className="text-[10px] font-bold text-black/60 uppercase tracking-[0.2em] mt-1 block">
                                    Answer Time
                                </span>
                            </div>
                            <div className="w-0.5 bg-black/30" />
                            <div>
                                <span className="text-4xl font-black text-black block leading-none">
                                    5x
                                </span>
                                <span className="text-[10px] font-bold text-black/60 uppercase tracking-[0.2em] mt-1 block">
                                    Multiplier
                                </span>
                            </div>
                            <div className="w-0.5 bg-black/30" />
                            <div>
                                <span className="text-4xl font-black text-white block leading-none">
                                    247
                                </span>
                                <span className="text-[10px] font-bold text-black/60 uppercase tracking-[0.2em] mt-1 block">
                                    Players Live
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="flex flex-col items-end gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="text-right space-y-3">
                            <div className="bg-black text-[#FFC400] px-3 py-1 inline-block">
                                <span className="text-xs font-black tracking-wider">
                                    PRIZE POOL
                                </span>
                            </div>
                            <p className="text-5xl font-black text-black leading-none">
                                12.5 <span className="text-2xl">SOL</span>
                            </p>
                        </div>

                        <button
                            type="button"
                            className="text-white px-10 py-5 font-black text-sm uppercase tracking-[0.2em] border-2 border-black bg-[#22a094] shadow-custom active:scale-99"
                        >
                            Enter Arena →
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#22a094] rounded-full animate-pulse" />
                            <span className="text-[10px] text-black/50 uppercase tracking-[0.15em] font-bold">
                                Powered by Solana
                            </span>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
