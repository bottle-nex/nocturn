'use client';
import Image from 'next/image';
import { JSX, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import UtilityCard from '../utility/UtilityCard';
import HomeFeatureSkeleton from '../skeletons/HomeFeaturesSkeleton';
import { useEscape } from '@/hooks/useKeyPress';

interface HomeFeaturesCard {
    id: number;
    image: string;
    title: string;
    color: string;
}

const feature_array: HomeFeaturesCard[] = [
    {
        id: 1,
        image: '/icons/know-us/know-1.png',
        title: 'Create and Share',
        color: 'bg-[#66baff30]',
    },
    {
        id: 2,
        image: '/icons/know-us/know-2.png',
        title: 'Multiple Themes',
        color: 'bg-[#ffb24630]',
    },
    {
        id: 3,
        image: '/icons/know-us/know-4.png',
        title: 'Winners get prizes',
        color: 'bg-[#36ff7930]',
    },
    {
        id: 4,
        image: '/icons/know-us/know-5.png',
        title: 'Infinite Users',
        color: 'bg-[#ff20202f]',
    },
    {
        id: 5,
        image: '/icons/know-us/know-3.png',
        title: 'Live leaderboards',
        color: 'bg-[#F0E9FF]',
    },
];

export default function HomeFeatures(): JSX.Element {
    const [openCard, setOpenCard] = useState<number | null>(null);
    const [loadedIds, setLoadedIds] = useState<Set<number>>(new Set());
    const selectedFeature = feature_array.find((f) => f.id === openCard);

    useEscape(() => setOpenCard(null), !!openCard);

    function handleImageLoad(id: number) {
        setLoadedIds((prev) => new Set(prev).add(id));
    }

    return (
        <section className="w-full ml-1">
            <div className="flex items-center justify-start gap-x-3">
                <h3 className="text-base tracking-wide">Features</h3>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {feature_array.map((feature) => {
                    const isLoaded = loadedIds.has(feature.id);

                    return (
                        <div key={feature.id} className="relative">
                            <AnimatePresence>
                                {!isLoaded && (
                                    <motion.div
                                        key="skeleton"
                                        className="absolute inset-0"
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <HomeFeatureSkeleton />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: isLoaded ? 1 : 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ pointerEvents: isLoaded ? 'auto' : 'none' }}
                            >
                                <UtilityCard
                                    layoutId={`feature-card-${feature.id}`}
                                    onClick={() => setOpenCard(feature.id)}
                                    className="cursor-pointer border-0 shadow-none p-0"
                                >
                                    <div className={`p-4 rounded-lg ${feature.color}`}>
                                        <div className="relative w-full h-32 mb-2">
                                            <Image
                                                fill
                                                src={feature.image}
                                                alt={feature.title}
                                                className="w-full h-auto object-contain"
                                                onLoad={() => handleImageLoad(feature.id)}
                                            />
                                        </div>
                                    </div>
                                    <h4 className="font-normal text-sm mt-2 text-center">
                                        {feature.title}
                                    </h4>
                                </UtilityCard>
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence>
                {openCard && selectedFeature && (
                    <>
                        <motion.div
                            key="backdrop"
                            className="fixed inset-0 bg-black/50 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpenCard(null)}
                        />
                        <UtilityCard
                            layoutId={`feature-card-${openCard}`}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-200 border-0 shadow-2xl bg-light-alpha rounded-xl"
                        >
                            <div className={`p-6 rounded-lg ${selectedFeature.color}`}>
                                <div className="relative w-full h-56">
                                    <Image
                                        fill
                                        src={selectedFeature.image}
                                        alt={selectedFeature.title}
                                        className="w-full h-auto object-contain"
                                    />
                                </div>
                            </div>
                            <h4 className="font-semibold text-base mt-4 text-center">
                                {selectedFeature.title}
                            </h4>
                        </UtilityCard>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
}
