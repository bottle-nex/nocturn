'use client';

import CountDownClock from '@/components/ui/CountDownClock';
import { getImageContainerWidth, useWidth } from '@/hooks/useWidth';
import { cn } from '@/lib/utils';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import Image from 'next/image';
import { useRef } from 'react';

export default function ParticipantQuestionReadingScreen() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const canvasWidth = useWidth(canvasRef);
    const { currentQuestion, gameSession } = useLiveQuizStore();
    // const { resetResponse } = useLiveParticipantsStore();

    if (!currentQuestion || !gameSession) {
        return (
            <div className="text-center text-neutral-400 w-full">
                Error in getting current question
            </div>
        );
    }

    // useEffect(() => {
    //     resetResponse();
    // }, [currentQuestion.id])

    return (
        <div
            className={cn(
                'w-full h-full overflow-hidden flex flex-col items-center justify-center',
                'relative',
            )}
        >
            <div className="min-h-128 w-[90%] flex flex-col justify-between">
                <div
                    className={cn('w-full text-3xl text-center')}
                    dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                />
                <div className="flex flex-row items-center justify-center">
                    {currentQuestion.imageUrl && (
                        <div
                            className={cn(
                                'h-full flex flex-col justify-end p-2 sm:p-4 relative mb-15',
                                getImageContainerWidth(canvasWidth),
                            )}
                        >
                            <div className="w-full overflow-hidden relative rounded-sm">
                                <Image
                                    src={currentQuestion.imageUrl}
                                    alt="Question reference image"
                                    className="object-contain w-full h-auto"
                                    width={500}
                                    height={500}
                                    unoptimized
                                />
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center gap-y-3">
                    <CountDownClock
                        startTime={gameSession.phaseStartTime!}
                        endTime={gameSession.phaseEndTime!}
                    />
                </div>
            </div>
        </div>
    );
}

// import { JSX, useEffect, useState } from 'react';
// import { motion } from 'framer-motion';
// import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
// import Avatar from '@/components/waitingRoom/Avatar';
// import { useLiveParticipantStore } from '@/store/live-quiz/useLiveQuizUserStore';
// import { templates } from '@/lib/templates';

// const ONE_SECOND = 1000;
// const TOTAL_TIME = 5;

// export default function ParticipantQuestionReadingScreen(): JSX.Element {
//     const [timer, setTimer] = useState<number>(TOTAL_TIME);
//     const [progress, setProgress] = useState<number>(0);
//     const { participantData } = useLiveParticipantStore();
//     const { quiz } = useLiveQuizStore();
//     const template = templates.find((t) => t.id === quiz?.theme);

//     useEffect(() => {
//         const interval = setInterval(() => {
//             setTimer((prev) => {
//                 const newTimer = prev - 1;
//                 if (newTimer <= 0) {
//                     clearInterval(interval);
//                     setProgress(100);
//                     return 0;
//                 }
//                 return newTimer;
//             });

//             setProgress((prev) => {
//                 const newProgress = prev + 100 / TOTAL_TIME;
//                 return Math.min(newProgress, 100);
//             });
//         }, ONE_SECOND);

//         return () => clearInterval(interval);
//     }, []);
//     return (
//         <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="h-full w-full relative flex items-center justify-center"
//         >
//             <div className="absolute top-0 left-0 w-full h-1">
//                 <div
//                     className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
//                     style={{
//                         width: `${progress}%`,
//                         backgroundColor: template?.bars[3],
//                     }}
//                 />
//             </div>
//             <div className="max-w-3xl h-[500px] sm:h-[550px] lg:h-[550px] flex flex-col items-center justify-start gap-y-20 flex-shrink-0">
//                 <div className="flex-1 flex flex-col justify-between items-center my-12">
//                     <span className="text-2xl tracking-wider font-light leading-relaxed text-wrap">
//                         {
//                             "In a React component, what's the difference between using useEffect(() => {...}, []) and useLayoutEffect(() => {...}, [])? When would you prefer one over the other?"
//                         }
//                     </span>
//                     <motion.span
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{
//                             duration: 0.8,
//                             ease: 'easeOut',
//                         }}
//                         className="text-3xl font-extralight tracking-wider flex flex-col items-center gap-y-4"
//                     >
//                         <div className="font-bold text-7xl">{timer}</div>
//                     </motion.span>
//                     {participantData?.avatar && (
//                         <Avatar
//                             avatar={participantData.avatar}
//                             name={participantData.nickname}
//                             position={{ x: 0, y: 0 }}
//                             index={0}
//                             size={100}
//                             showOnlineIndicator={true}
//                             showNameTooltip={true}
//                         />
//                     )}
//                 </div>
//             </div>
//         </motion.div>
//     );
// }
