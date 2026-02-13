import { PiCurrencyCircleDollarFill } from 'react-icons/pi';
import { BsFillHandThumbsUpFill } from 'react-icons/bs';
import { MdEmojiEmotions } from 'react-icons/md';
import { FaHeart, FaLightbulb } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { MESSAGE_TYPES } from '@nocturn/types';
import { InteractionEnum } from '@nocturn/types';

interface LiveQuizInteractionTickerProps {
    className?: string;
}

export enum Interactions {
    THUMBS_UP = 'THUMBS_UP',
    DOLLAR = 'DOLLAR',
    BULB = 'BULB',
    HEART = 'HEART',
    SMILE = 'SMILE',
}

interface AnimatingEmoji {
    id: number;
    type: Interactions;
}

export default function LiveQuizInteractionTicker({ className }: LiveQuizInteractionTickerProps) {
    const { quiz } = useLiveQuizStore();
    const theme = quiz.template;

    const [animatingEmojis, setAnimatingEmojis] = useState<AnimatingEmoji[]>([]);
    const { subscribeToHandler, unsubscribeToHandler, handleSendInteractionMessage } =
        useWebSocket();

    function toFrontendEnum(i: InteractionEnum): Interactions | null {
        switch (i) {
            case 'THUMBS_UP':
                return Interactions.THUMBS_UP;
            case 'DOLLAR':
                return Interactions.DOLLAR;
            case 'BULB':
                return Interactions.BULB;
            case 'HEART':
                return Interactions.HEART;
            case 'SMILE':
                return Interactions.SMILE;
            default:
                return null;
        }
    }

    const allowedEmojiTypes = useMemo(
        () =>
            (quiz?.interactions ?? [])
                .map(toFrontendEnum)
                .filter((i): i is Interactions => i !== null),
        [quiz?.interactions],
    );

    useEffect(() => {
        function handleIncomingReactionEvent(message: unknown) {
            const payload = message as { reactionType: Interactions };
            createEmojiAnimation(payload.reactionType);
        }

        subscribeToHandler(MESSAGE_TYPES.INTERACTION_EVENT, handleIncomingReactionEvent);
        return () => {
            unsubscribeToHandler(MESSAGE_TYPES.INTERACTION_EVENT, handleIncomingReactionEvent);
        };
    }, [subscribeToHandler, unsubscribeToHandler]);

    function createEmojiAnimation(emojiType: Interactions) {
        const newEmojiId = Date.now() + Math.random();
        setAnimatingEmojis((prev) => [...prev, { id: newEmojiId, type: emojiType }]);

        setTimeout(() => {
            setAnimatingEmojis((prev) => prev.filter((emoji) => emoji.id !== newEmojiId));
        }, 2200);
    }

    function handleClick(emojiType: Interactions) {
        createEmojiAnimation(emojiType);
        handleSendInteractionMessage({ reactionType: emojiType });
    }

    function renderIcon(type: Interactions, size: number = 35) {
        const iconProps = {
            size,
            style: {
                border: `1px solid ${theme.borderColor}50`,
                backgroundColor: `${theme.textColor}20`,
            },
            className:
                'border-[1px] dark:border-neutral-500 border-neutral-300 p-2 rounded-full hover:shadow-sm transition-all duration-200 ease-in-out cursor-pointer select-none',
        };

        switch (type) {
            case Interactions.HEART:
                return <FaHeart {...iconProps} />;
            case Interactions.DOLLAR:
                return <PiCurrencyCircleDollarFill {...iconProps} />;
            case Interactions.BULB:
                return <FaLightbulb {...iconProps} />;
            case Interactions.THUMBS_UP:
                return <BsFillHandThumbsUpFill {...iconProps} />;
            case Interactions.SMILE:
                return <MdEmojiEmotions {...iconProps} />;
            default:
                return null;
        }
    }

    function renderAnimatedIcon(type: Interactions) {
        const animatedIconProps = {
            size: 22,
            className: 'drop-shadow-lg',
        };

        switch (type) {
            case Interactions.HEART:
                return <FaHeart {...animatedIconProps} style={{ color: '#ff0033' }} />;
            case Interactions.DOLLAR:
                return (
                    <PiCurrencyCircleDollarFill
                        {...animatedIconProps}
                        style={{ color: '#10b981' }}
                    />
                );
            case Interactions.BULB:
                return <FaLightbulb {...animatedIconProps} style={{ color: '#f59e0b' }} />;
            case Interactions.THUMBS_UP:
                return (
                    <BsFillHandThumbsUpFill {...animatedIconProps} style={{ color: '#3b82f6' }} />
                );
            case Interactions.SMILE:
                return <MdEmojiEmotions {...animatedIconProps} style={{ color: '#f97316' }} />;
            default:
                return null;
        }
    }

    return (
        <div
            style={{ color: theme.textColor }}
            className={cn('flex items-center gap-x-2 z-[20] relative', className)}
        >
            {allowedEmojiTypes.map((emojiType) => (
                <div key={emojiType} className="relative">
                    <div onClick={() => handleClick(emojiType)}>{renderIcon(emojiType)}</div>

                    <AnimatePresence>
                        {animatingEmojis
                            .filter((emoji) => emoji.type === emojiType)
                            .map((emoji) => (
                                <motion.div
                                    key={emoji.id}
                                    className="absolute pointer-events-none"
                                    initial={{
                                        opacity: 1,
                                        y: 0,
                                        x: 0,
                                        scale: 1,
                                        rotate: 0,
                                    }}
                                    animate={{
                                        opacity: 0,
                                        y: -120 - Math.random() * 400,
                                        x: Math.random() * 360 - 120,
                                        scale: 1.0 + Math.random() * 1.5,
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
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    {renderAnimatedIcon(emoji.type)}
                                </motion.div>
                            ))}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
