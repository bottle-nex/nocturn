import { Dispatch, SetStateAction } from "react";
import { LeftRenderType } from "../LandingUsdcSection";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const rankColors = ['text-yellow-400', 'text-neutral-300', 'text-amber-600', 'text-neutral-400'];
const defaultPercentages = [50, 30, 20];
const demoPool = 250;

const staggerItem = (index: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] as const },
});

export function LeftInputsContent({
    setLeftRenderType,
}: {
    setLeftRenderType: Dispatch<SetStateAction<LeftRenderType>>;
}) {
    return (
        <div className="w-full h-full relative overflow-hidden text-white">
            <motion.div className="absolute top-8 left-8" {...staggerItem(0)}>
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-white/50 mb-1">
                    Configure
                </p>
                <p className="text-lg font-semibold text-white">Prize Pool</p>
            </motion.div>

            <div className="w-full h-full flex flex-col justify-between pt-24 px-8 pb-8 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col gap-y-5">
                    {/* Stake Amount */}
                    <motion.div className="space-y-2" {...staggerItem(1)}>
                        <span className="text-sm sm:text-base font-normal text-white/90">Stake Amount</span>
                        <p className="text-xs sm:text-sm text-white/40">
                            Minimum stake: 1 USDC · Maximum: 10,000 USDC
                        </p>
                        <div className="relative mt-2">
                            <Input
                                type="text"
                                readOnly
                                title="Stake amount"
                                value="250.00"
                                className="w-full h-10 sm:h-12 rounded-lg bg-white/[0.07] px-4 py-2 sm:py-3 text-sm sm:text-base font-mono text-white outline-none transition-colors border-none"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-white/40 font-medium">
                                USDC
                            </span>
                        </div>
                    </motion.div>

                    {/* Prize Distribution */}
                    <div className="space-y-3">
                        <motion.span
                            className="text-sm sm:text-base font-normal text-white/90 block"
                            {...staggerItem(2)}
                        >
                            Prize Distribution
                        </motion.span>

                        <motion.div className="flex items-center gap-x-2" {...staggerItem(3)}>
                            <label className="text-xs sm:text-sm text-white/40">Number of winners:</label>
                            <Input
                                type="text"
                                readOnly
                                title="Number of winners"
                                value="3"
                                className="w-16 h-8 sm:h-9 rounded-md bg-white/[0.07] px-3 py-1.5 sm:py-2 text-sm font-mono text-white outline-none border-none "
                            />
                        </motion.div>

                        <div className="space-y-1 sm:space-y-1.5">
                            {defaultPercentages.map((pct, i) => {
                                const rankLabel = i === 0 ? '1st' : i === 1 ? '2nd' : '3rd';
                                const amount = ((demoPool * pct) / 100).toFixed(2);
                                return (
                                    <motion.div
                                        key={i}
                                        className="flex items-center gap-x-2"
                                        {...staggerItem(4 + i)}
                                    >
                                        <span
                                            className={cn('text-xs sm:text-sm font-medium w-7', rankColors[i])}
                                        >
                                            {rankLabel}
                                        </span>
                                        <Input
                                            type="text"
                                            readOnly
                                            title={`${rankLabel} percentage`}
                                            value={pct}
                                            className="w-16 h-8 sm:h-9 rounded-md bg-white/[0.07] px-3 py-1.5 sm:py-2 text-sm font-mono text-white outline-none border-none "
                                        />
                                        <span className="text-xs sm:text-sm text-white/40">%</span>
                                        <span className="text-xs sm:text-sm text-white/30 ml-auto font-mono">
                                            {amount} USDC
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <motion.div
                            className="flex items-center justify-between pt-2 border-t border-white/10"
                            {...staggerItem(7)}
                        >
                            <span className="text-xs sm:text-sm font-medium text-green-400">
                                Total: 100.0%
                            </span>
                        </motion.div>
                    </div>
                </div>

                <motion.div {...staggerItem(8)}>
                    <Button
                        onClick={() => setLeftRenderType(LeftRenderType.COIN)}
                        className="w-full h-9 sm:h-10 rounded-lg text-light-base text-sm sm:text-base font-semibold flex items-center justify-center cursor-pointer transition-colors mt-3 sm:mt-6"
                    >
                        Stake USDC
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}