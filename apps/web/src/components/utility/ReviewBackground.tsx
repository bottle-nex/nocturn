import { useHomeRendererStore } from '@/store/home/useHomeRendererStore';
import OpacityBackground from './OpacityBackground';
import UtilityCard from './UtilityCard';
import { HomeRendererEnum } from '@/types/homeRendererTypes';
import ReviewInputBoxRight from './ReviewInputBoxRight';
import ReviewLeftAnimatedList from './ReviewLeftAnimatedList';
import { ReviewProvider } from '@/context/ReviewContext';
import { motion } from 'framer-motion';
import AppLogo from '../app/AppLogo';

export default function ReviewBackground() {
    const { setValue } = useHomeRendererStore();

    const pathData =
        'M260.5 150C264.09 150 267 152.91 267 156.5C267 160.09 264.09 163 260.5 163C256.91 163 254 160.09 254 156.5C254 152.91 256.91 150 260.5 150ZM260.5 150.493C257.183 150.493 254.493 153.183 254.493 156.5C254.493 159.817 257.183 162.507 260.5 162.507C263.817 162.507 266.507 159.817 266.507 156.5C266.507 153.183 263.817 150.493 260.5 150.493ZM79.6436 151.657C82.6481 154.689 86.7395 156.394 91.0078 156.395H254V156.895H90.5078C86.2395 156.894 82.1481 155.189 79.1436 152.157L2.26953 74.584L2.76953 74.084L79.6436 151.657ZM0.567383 0.982422C4.83564 0.986265 8.92587 2.69521 11.9277 5.72949L93.0664 87.7471C94.2277 86.6634 95.7863 86 97.5 86C101.09 86 104 88.9101 104 92.5C104 96.0899 101.09 99 97.5 99C93.9101 99 91 96.0899 91 92.5C91 90.8037 91.6496 89.259 92.7139 88.1016L11.9238 6.43652C8.92194 3.40222 4.83176 1.69327 0.563477 1.68945L0 1.68848V0.981445L0.567383 0.982422ZM97.5 86.4932C94.1825 86.4932 91.4932 89.1825 91.4932 92.5C91.4932 95.8175 94.1825 98.5068 97.5 98.5068C100.817 98.5068 103.507 95.8175 103.507 92.5C103.507 89.1825 100.817 86.4932 97.5 86.4932Z';

    return (
        <OpacityBackground
            className="bg-dark-alpha/90"
            onBackgroundClick={() => setValue(HomeRendererEnum.DASHBOARD)}
        >
            <UtilityCard className="dark:bg-neutral-950 w-full max-w-[60vw] max-h-[70vh] h-full relative overflow-hidden border dark:border-neutral-800 rounded-3xl">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle 40vw at 50% 0%,
                             rgba(142, 70, 243, 0.5) 0%,
                             rgba(142, 70, 243, 0.25) 30%,
                             rgba(142, 70, 243, 0.1) 50%,
                             transparent 70%)`,
                    }}
                />

                <AppLogo className="absolute top-7 right-8 text-neutral-900/70 dark:text-light-base/80" />

                <svg
                    className="absolute top-20 -left-2"
                    width="266"
                    height="163"
                    viewBox="0 0 266 163"
                    fill="none"
                    xmlns="http"
                >
                    <motion.path
                        d={pathData}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: 4,
                            ease: 'easeInOut',
                            repeat: Infinity,
                            repeatType: 'reverse',
                        }}
                        stroke="url(#animatedGradient)"
                        strokeWidth="1"
                    />

                    <defs>
                        <linearGradient id="animatedGradient" x1="0" y1="0" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(142, 70, 243, 0)" />
                            <stop offset="50%" stopColor="rgba(142, 70, 243, 0.5)" />
                            <stop offset="100%" stopColor="rgba(142, 70, 243, 0)" />
                        </linearGradient>
                    </defs>
                </svg>

                <svg
                    className="absolute top-56 -right-2 rotate-180"
                    width="266"
                    height="163"
                    viewBox="0 0 266 163"
                    fill="none"
                    xmlns="http"
                >
                    <motion.path
                        d={pathData}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{
                            duration: 4,
                            ease: 'easeInOut',
                            repeat: Infinity,
                            repeatType: 'reverse',
                        }}
                        stroke="url(#animatedGradient)"
                        strokeWidth="1"
                    />

                    <defs>
                        <linearGradient id="animatedGradient" x1="0" y1="0" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(142, 70, 243, 0)" />
                            <stop offset="50%" stopColor="rgba(142, 70, 243, 0.5)" />
                            <stop offset="100%" stopColor="rgba(142, 70, 243, 0)" />
                        </linearGradient>
                    </defs>
                </svg>

                <div className="absolute top-25 left-1/2 -translate-x-1/2">
                    <span
                        className="text-[#a885d6] text-9xl font-bold tracking-wide capitalize relative block"
                        style={{
                            background: `linear-gradient(to bottom,
                                 rgb(129, 103, 163) 20%,
                                rgb(129, 103, 163) 20%,
                                rgba(129, 103, 163, 0.7) 40%,
                                rgba(129, 103, 163, 0.3) 60%,
                                 rgba(129, 103, 163, 0.05) 80%,
                                transparent 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        REVIEW
                    </span>
                </div>
                <div className="flex flex-col items-center justify-end h-full ">
                    <div className="grid grid-cols-2 w-full px-12 mb-20">
                        <div className="flex flex-col h-full justify-end min-w-[50%] col-span-1">
                            <ReviewLeftAnimatedList />
                        </div>

                        <div className="w-full h-full pt-20 space-y-2">
                            <ReviewProvider>
                                <ReviewInputBoxRight />
                            </ReviewProvider>
                        </div>
                    </div>
                </div>
            </UtilityCard>
        </OpacityBackground>
    );
}
