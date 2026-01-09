import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { JSX } from 'react';
import { BiSolidMessageEdit } from 'react-icons/bi';
import { MdAddReaction } from 'react-icons/md';
import Drafts from './Drafts';
import { FaDartLang } from 'react-icons/fa6';
import { SiSolana } from 'react-icons/si';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { MdSettingsSuggest } from 'react-icons/md';

interface option {
    name: string;
    type: DraftRenderer;
    icon: React.ReactNode;
    message: string;
}

const option_one: option[] = [
    {
        name: 'QUESTION',
        type: DraftRenderer.QUESTION,
        icon: <BiSolidMessageEdit className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />,
        message: 'Add a question to your quiz',
    },
    {
        name: 'THEME',
        type: DraftRenderer.THEME,
        icon: <FaDartLang className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />,
        message: 'Choose a theme for your quiz',
    },
    {
        name: 'INTERACTION',
        type: DraftRenderer.INTERACTION,
        icon: <MdAddReaction className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />,
        message: 'Add an interaction to your quiz',
    },
];

const option_two: option[] = [
    {
        name: 'ADVANCED',
        type: DraftRenderer.ADVANCED,
        icon: <MdSettingsSuggest className="w-7 h-7 text-neutral-900 dark:text-neutral-100" />,
        message: 'Add advanced features to your quiz',
    },
    {
        name: 'STAKE',
        type: DraftRenderer.STAKE,
        icon: <SiSolana className="w-6 h-6 text-neutral-900 dark:text-neutral-100" />,
        message: 'Add a stake to your quiz',
    },
];

export default function QuizRight(): JSX.Element {
    const { state, setState } = useDraftRendererStore();

    return (
        <>
            <BigQuizRight state={state} setState={setState} />
        </>
    );
}

interface QuizRight {
    state: DraftRenderer;
    setState: (state: DraftRenderer) => void;
}

function BigQuizRight({ state, setState }: QuizRight): JSX.Element {
    return (
        <div className="hidden min-h-full md2:flex justify-end py-4 pr-4">
            <div
                className={cn(
                    'flex gap-x-3 flex-row-reverse rounded-l-xl transition-all duration-300',
                    state ? 'w-full max-w-4xl' : 'w-auto',
                )}
            >
                <div className="flex flex-col gap-y-3 ">
                    <div className="w-[6rem] shrink-0">
                        <div className="bg-light-base dark:bg-dark-alpha/30 rounded-xl overflow-hidden p-1 flex flex-col gap-y-2 border-[1px] border-neutral-300 dark:border-neutral-700">
                            {option_one.map((option, index) => (
                                <ToolTipComponent side="left" key={index} content={option.message}>
                                    <Button
                                        type="button"
                                        onClick={() => setState(option.type)}
                                        className={cn(
                                            'w-full shadow-none h-20 flex items-center justify-center rounded-xl bg-light-base dark:bg-dark-base hover:bg-alpha/10 cursor-pointer',
                                            `${state === option.type && 'hover:bg-purple-700/10 bg-alpha/10 border border-purple-800'}`,
                                        )}
                                    >
                                        <div className="flex flex-col items-center justify-center gap-y-1">
                                            {option.icon}
                                            <span className="text-neutral-900 dark:text-neutral-100 text-xs">
                                                {option.name}
                                            </span>
                                        </div>
                                    </Button>
                                </ToolTipComponent>
                            ))}
                        </div>
                    </div>
                    <div className="w-[6rem] flex-shrink-0">
                        <div className="bg-light-base dark:bg-dark-base/30 rounded-xl overflow-hidden p-1 flex flex-col gap-y-2 border-[1px] border-neutral-300 dark:border-neutral-700">
                            {option_two.map((option, index) => (
                                <ToolTipComponent side="left" key={index} content={option.message}>
                                    <Button
                                        type="button"
                                        onClick={() => setState(option.type)}
                                        className={cn(
                                            'w-full shadow-none h-20 flex items-center justify-center rounded-xl bg-light-base dark:bg-dark-base hover:bg-alpha/10 cursor-pointer',
                                            `${state === option.type && 'hover:bg-purple-700/10 bg-alpha/10 border border-purple-800'}`,
                                        )}
                                    >
                                        <div className="flex flex-col items-center justify-center gap-y-1">
                                            {option.icon}
                                            <span className="text-neutral-900 dark:text-neutral-100 text-xs">
                                                {option.name}
                                            </span>
                                        </div>
                                    </Button>
                                </ToolTipComponent>
                            ))}
                        </div>
                    </div>
                </div>
                {state !== DraftRenderer.NONE && <Drafts />}
            </div>
        </div>
    );
}

export function SmallQuizRight(): JSX.Element {
    const { state, setState } = useDraftRendererStore();

    return (
        <div className="md2:hidden min-h-full flex justify-end py-4 pr-4">
            <div
                className={cn(
                    'flex gap-x-3 flex-row-reverse rounded-l-xl transition-all duration-300',
                    state ? 'w-full ' : 'w-auto',
                )}
            >
                <div className="md2:hidden flex gap-x-3 ">
                    <div className=" flex-shrink-0 ">
                        <div className="bg-light-base dark:bg-dark-base/30 rounded-xl overflow-hidden p-1 flex gap-x-2 border-[1px] border-neutral-300 dark:border-neutral-700">
                            {option_one.map((option, index) => (
                                <ToolTipComponent side="left" key={index} content={option.message}>
                                    <Button
                                        type="button"
                                        onClick={() => setState(option.type)}
                                        className={cn(
                                            'w-[6rem] shadow-none h-20 flex items-center justify-center rounded-xl bg-light-base dark:bg-dark-base hover:bg-alpha/10',
                                            `${state === option.type && 'hover:bg-purple-700/10 bg-alpha/10 border border-purple-800'}`,
                                        )}
                                    >
                                        <div className="flex flex-col items-center justify-center gap-y-1">
                                            {option.icon}
                                            <span className="text-neutral-900 dark:text-neutral-100 text-xs">
                                                {option.name}
                                            </span>
                                        </div>
                                    </Button>
                                </ToolTipComponent>
                            ))}
                        </div>
                    </div>
                    <div className="flex-shrink-0">
                        <div className="bg-light-base dark:bg-dark-base/30 rounded-xl overflow-hidden p-1 flex gap-x-2 border-[1px] border-neutral-300 dark:border-neutral-700">
                            {option_two.map((option, index) => (
                                <ToolTipComponent side="left" key={index} content={option.message}>
                                    <Button
                                        type="button"
                                        onClick={() => setState(option.type)}
                                        className={cn(
                                            'w-[6rem] shadow-none h-20 flex items-center justify-center rounded-xl bg-light-base dark:bg-dark-base hover:bg-alpha/10',
                                            `${state === option.type && 'hover:bg-purple-700/10 bg-alpha/10 border border-purple-800'}`,
                                        )}
                                    >
                                        <div className="flex flex-col items-center justify-center gap-y-1">
                                            {option.icon}
                                            <span className="text-neutral-900 dark:text-neutral-100 text-xs">
                                                {option.name}
                                            </span>
                                        </div>
                                    </Button>
                                </ToolTipComponent>
                            ))}
                        </div>
                    </div>
                </div>
                {state !== DraftRenderer.NONE && <Drafts />}
            </div>
        </div>
    );
}
