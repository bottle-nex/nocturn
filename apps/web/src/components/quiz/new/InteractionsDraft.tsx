'use client';

import { RxCross2 } from 'react-icons/rx';
import { BsFillHandThumbsUpFill } from 'react-icons/bs';
import { MdEmojiEmotions } from 'react-icons/md';
import { FaHeart, FaLightbulb } from 'react-icons/fa6';
import { PiCurrencyCircleDollarFill } from 'react-icons/pi';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { useState, ReactElement, cloneElement } from 'react';
import { Switch } from '@/components/ui/switch';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { InteractionEnum } from '@/types/prisma-types';

interface InteractionIconProps {
    icon: ReactElement;
    type: InteractionEnum;
    color: string;
}

export default function InteractionsDraft() {
    const { setState } = useDraftRendererStore();
    const { quiz, toggleInteraction, updateQuiz } = useNewQuizStore();
    const [hoveredType, setHoveredType] = useState<InteractionEnum | null>(null);

    const interactionIcons: InteractionIconProps[] = [
        {
            icon: <FaHeart size={20} />,
            type: InteractionEnum.HEART,
            color: '#E53E3E',
        },
        {
            icon: <PiCurrencyCircleDollarFill size={20} />,
            type: InteractionEnum.DOLLAR,
            color: '#38A169',
        },
        {
            icon: <FaLightbulb size={20} />,
            type: InteractionEnum.BULB,
            color: '#F6E05E',
        },
        {
            icon: <BsFillHandThumbsUpFill size={20} />,
            type: InteractionEnum.THUMBS_UP,
            color: '#3182CE',
        },
        {
            icon: <MdEmojiEmotions size={20} />,
            type: InteractionEnum.SMILE,
            color: '#F6AD55',
        },
    ];

    return (
        <div className="text-neutral-900 dark:text-neutral-100">
            <div className="w-full flex items-center justify-between border-b border-neutral-300 dark:border-neutral-700 pb-2">
                <div className="text-lg font-medium">Interactions</div>
                <RxCross2 onClick={() => setState(DraftRenderer.NONE)} className="cursor-pointer" />
            </div>
            <div className="w-full px-2 mt-6">
                <div className="flex items-center justify-start gap-x-4">
                    {interactionIcons.map(({ icon, type, color }) => {
                        const isSelected = quiz.interactions.includes(type);
                        const isHovered = hoveredType === type;
                        const displayColor = isSelected || isHovered ? color : undefined;

                        return (
                            <div
                                key={type}
                                onClick={() => toggleInteraction(type)}
                                onMouseEnter={() => setHoveredType(type)}
                                onMouseLeave={() => setHoveredType(null)}
                                className={`border-[1px] p-2 rounded-md cursor-pointer transition-all duration-200 ease-in-out
                                    dark:border-neutral-600 border-neutral-300
                                    hover:shadow-sm
                                    ${
                                        isSelected
                                            ? 'scale-110 shadow-md bg-neutral-800/40'
                                            : 'hover:scale-105'
                                    }`}
                            >
                                <span style={{ color: displayColor }}>{cloneElement(icon)}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="w-full px-2 mt-6">
                <div className="flex items-center justify-start gap-x-1">
                    <span className="text-sm font-normal text-dark-primary dark:text-light-base">
                        Live chat
                    </span>
                    <ToolTipComponent content="Enable live chat for your audience to ask questions and interact with you">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>
                <div className="flex w-full items-center justify-between mt-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Enable live chat
                    </span>
                    <Switch
                        className="cursor-pointer"
                        checked={quiz.liveChat}
                        onCheckedChange={(checked) => updateQuiz({ liveChat: checked })}
                    />
                </div>
            </div>

            <div className="w-full px-2 mt-6">
                <div className="flex items-center justify-start gap-x-1">
                    <span className="text-sm font-normal text-dark-primary dark:text-light-base">
                        Spectator mode
                    </span>
                    <ToolTipComponent content="Enable spectator mode for your audience to ask questions and interact with you">
                        <AiOutlineQuestionCircle size={15} />
                    </ToolTipComponent>
                </div>
                <div className="flex w-full items-center justify-between mt-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        Enable spectator mode
                    </span>
                    <Switch
                        className="cursor-pointer"
                        checked={quiz.spectatorMode}
                        onCheckedChange={(checked) => updateQuiz({ spectatorMode: checked })}
                    />
                </div>
            </div>
        </div>
    );
}
