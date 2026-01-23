'use client';

import { Dispatch, MouseEvent, SetStateAction, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsFillHandThumbsUpFill } from 'react-icons/bs';
import { MdEmojiEmotions } from 'react-icons/md';
import { FaHeart, FaLightbulb } from 'react-icons/fa6';
import { PiCurrencyCircleDollarFill } from 'react-icons/pi';
import { IconType } from 'react-icons/lib';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { cn } from '@/lib/utils';
import { SELECTION_MODE } from '@/components/canvas/Canvas';
import { InteractionEnum } from '@nocturn/types';

interface Icon {
    id: InteractionEnum;
    Component: IconType;
    iconColor: string;
}

const icons: Icon[] = [
    { id: InteractionEnum.HEART, Component: FaHeart, iconColor: '#E53E3E' },
    { id: InteractionEnum.DOLLAR, Component: PiCurrencyCircleDollarFill, iconColor: '#38A169' },
    { id: InteractionEnum.BULB, Component: FaLightbulb, iconColor: '#252525' },
    { id: InteractionEnum.THUMBS_UP, Component: BsFillHandThumbsUpFill, iconColor: '#3182CE' },
    { id: InteractionEnum.SMILE, Component: MdEmojiEmotions, iconColor: '#F6AD55' },
];

interface AnimationIcon {
    id: number;
    Icon: React.ElementType;
    containerIndex: number;
}

interface NewQuizInteractiveIconsProps {
    selectionMode: SELECTION_MODE;
    setSelectionMode: Dispatch<SetStateAction<SELECTION_MODE>>;
}

export default function NewQuizInteractiveIcons({
    selectionMode,
    setSelectionMode,
}: NewQuizInteractiveIconsProps) {
    const [animatingIcons, setAnimatingIcons] = useState<AnimationIcon[]>([]);
    const { setState } = useDraftRendererStore();
    const { quiz } = useNewQuizStore();

    const selectedStyles = 'border-2 border-indigo-600/60';

    function createAnimation(Icon: React.ElementType, containerIndex: number) {
        const newIcon = {
            id: Date.now() + Math.random(),
            Icon,
            containerIndex,
        };
        setAnimatingIcons((prev) => [...prev, newIcon]);

        setTimeout(() => {
            setAnimatingIcons((prev) => prev.filter((icon) => icon.id !== newIcon.id));
        }, 2200);
    }

    function interactionDivTapHandler(e: MouseEvent<HTMLDivElement>) {
        e.stopPropagation();
        setSelectionMode(SELECTION_MODE.INTERACTION);
        setState(DraftRenderer.INTERACTION);
    }

    return (
        <div
            onClick={interactionDivTapHandler}
            className={cn(
                'flex items-center justify-end gap-x-4 z-40 rounded-[12px] px-4 py-2',
                selectionMode === SELECTION_MODE.INTERACTION && selectedStyles,
            )}
        >
            {icons
                .filter(({ id }) => quiz.interactions.includes(id))
                .map(({ id, Component, iconColor }, index) => (
                    <div key={id} className="relative w-fit h-fit overflow-visible z-41">
                        <Component
                            onClick={() => createAnimation(Component, index)}
                            style={{
                                backgroundColor: `#00000070`,
                                color: '#EEEEEEca',
                            }}
                            size={28}
                            className="p-1.5 rounded-full transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-md cursor-pointer"
                        />
                        <AnimatePresence>
                            {animatingIcons
                                .filter((icon) => icon.containerIndex === index)
                                .map(({ id, Icon }) => (
                                    <motion.div
                                        key={id}
                                        className="absolute left-1/2 top-1/2 pointer-events-none"
                                        initial={{
                                            opacity: 1,
                                            y: 0,
                                            x: '-50%',
                                            scale: 1,
                                            rotate: 0,
                                        }}
                                        animate={{
                                            opacity: 0,
                                            y: -160 - Math.random() * 200,
                                            x: '-50%',
                                            scale: 1 + Math.random(),
                                            rotate: Math.random() * 30 - 15,
                                        }}
                                        exit={{ opacity: 0 }}
                                        transition={{
                                            duration: 2.2,
                                            ease: [0.23, 1, 0.32, 1],
                                            opacity: { duration: 2.2, ease: 'easeOut' },
                                            rotate: {
                                                duration: 0.3,
                                                ease: 'easeInOut',
                                                repeat: Infinity,
                                                repeatType: 'reverse',
                                            },
                                        }}
                                    >
                                        <Icon
                                            size={22}
                                            className="drop-shadow-lg"
                                            style={{
                                                color: iconColor,
                                            }}
                                        />
                                    </motion.div>
                                ))}
                        </AnimatePresence>
                    </div>
                ))}
        </div>
    );
}
