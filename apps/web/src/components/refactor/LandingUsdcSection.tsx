'use client';
import { JSX, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingSectionHeader from './LandingSectionHeader';
import { LeftCoinContent } from './UsdcSupportSection/LeftCoinContent';
import { LeftInputsContent } from './UsdcSupportSection/LeftInputsContent';
import RightLeaderboardsComponent from './UsdcSupportSection/RightLeaderboardsComponent';

export enum LeftRenderType {
    COIN = 'COIN',
    INPUTS = 'INPUTS',
}

export default function LandingUsdcSection(): JSX.Element {
    const [leftRenderType, setLeftRenderType] = useState<LeftRenderType>(LeftRenderType.COIN);

    return (
        <main className="max-w-270 mx-auto w-full py-15 px-6 xl:px-0">
            <LandingSectionHeader
                heading="USDC Support"
                subheading="Learn more about our USDC integration."
            />

            <div className="w-full h-auto lg:h-150 flex items-center justify-center rounded-2xl overflow-hidden mt-16">
                <section className="text-white flex flex-col lg:grid lg:grid-cols-[40%_60%] w-full h-full">
                    <main className="bg-dark-alpha w-full h-120 lg:h-full block relative overflow-hidden shrink-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={leftRenderType}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -14 }}
                                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                                className="w-full h-full"
                            >
                                {leftRenderType === LeftRenderType.COIN ? (
                                    <LeftCoinContent setLeftRenderType={setLeftRenderType} />
                                ) : (
                                    <LeftInputsContent setLeftRenderType={setLeftRenderType} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                    <RightLeaderboardsComponent />
                </section>
            </div>
        </main>
    );
}
