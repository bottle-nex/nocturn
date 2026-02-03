'use client';

import { useRef, useState } from 'react';
import { GoPlus } from 'react-icons/go';
import { cn } from '@/lib/utils';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { FaSquare } from 'react-icons/fa6';
import useVoiceRecognition from '@/hooks/useVoiceRecognition';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import { IoMicOutline } from 'react-icons/io5';
import { useTypewriterPlaceholder } from '@/hooks/useTypewriterPlaceholder';
import { HiArrowUp } from 'react-icons/hi2';
import AiBackendAction from '@/lib/backend/home/start-with-ai-action';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { AiQuizChatRole, AiQuizMessage } from '@nocturn/types';
import { v4 as uuid } from 'uuid';

const newChatPlaceholders = ['Have an idea?', "Don't know where to start?", 'Use me!'];
const difficultyPlaceholders = ['want it easy?', 'or challenging?', 'cast with toughness'];
const revampPlaceholders = ['not satisfied?', 'having more things in mind?', 'abra ka dabra!'];

export default function AIChatBoxrevamp() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState<string>('');
    const [prompt, setPrompt] = useState<string>('');
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [isMultiline, setIsMultiline] = useState<boolean>(false);
    const { messages, loading, quiz, appendMessage, sessionId } = useAiChatStore();
    const { session } = useUserSessionStore();

    const animatedPlaceholders = useTypewriterPlaceholder(
        quiz
            ? revampPlaceholders
            : messages.length > 0
              ? difficultyPlaceholders
              : newChatPlaceholders,
    );

    const { listening, interimTranscript, toggle, stop } = useVoiceRecognition({
        onFinalTranscript: (text) => setPrompt((prev) => (prev ? prev + ' ' : '') + text),
    });

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setValue(e.target.value);
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
        setIsMultiline(el.scrollHeight > 32);
    }

    function handleSubmit() {
        const finalPrompt = `${value} ${prompt}`.trim();
        if (!finalPrompt) return;

        stop();

        const id = sessionId || uuid();

        const message: AiQuizMessage = {
            id: uuid(),
            aiQuizChatSessionId: id,
            role: AiQuizChatRole.USER,
            content: finalPrompt,
            createdAt: new Date(),
        };

        appendMessage(message);

        AiBackendAction.create_new_quiz(session?.user.token, id, finalPrompt);

        setValue('');
        setPrompt('');
    }

    function handleOnKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    function handleInputOnClick() {
        setIsFocused(true);
    }

    const hasContent = value.trim().length > 0 || prompt.trim().length > 0;

    return (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl mx-auto z-30 px-4">
            <div
                className={cn(
                    'rounded-2xl bg-dark-base border transition-all duration-200',
                    isFocused ? 'border-neutral-700' : 'border-neutral-800',
                    'hover:border-neutral-700',
                )}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            >
                <div className="px-4 pt-3">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={value}
                        onChange={handleChange}
                        onKeyDown={handleOnKeyDown}
                        onClick={handleInputOnClick}
                        placeholder={value ? '' : animatedPlaceholders}
                        className="w-full resize-none bg-transparent outline-none text-[15px] text-neutral-100 placeholder:text-neutral-500 max-h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
                    />

                    {listening && interimTranscript && (
                        <div className="text-sm text-neutral-400 italic mt-1">
                            {interimTranscript}
                        </div>
                    )}
                </div>

                <div
                    className={cn(
                        'flex items-center justify-between px-3 pb-3 pt-2',
                        !isMultiline && 'mt-[-6px]',
                    )}
                >
                    <ToolTipComponent content="Attach file" side="top">
                        <button className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full hover:bg-neutral-800 transition-all duration-200">
                            <GoPlus
                                size={20}
                                className="text-neutral-400 hover:text-neutral-200 transition-colors"
                            />
                        </button>
                    </ToolTipComponent>

                    <div className="flex items-center gap-2">
                        {!hasContent && (
                            <ToolTipComponent
                                content={listening ? 'Stop recording' : 'Voice input'}
                                side="top"
                            >
                                <button
                                    onClick={!loading ? toggle : undefined}
                                    disabled={loading}
                                    className={cn(
                                        'w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer',
                                        listening
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'hover:bg-neutral-800',
                                        loading && 'opacity-40 cursor-not-allowed',
                                    )}
                                >
                                    {loading ? (
                                        <FaSquare size={14} className="text-neutral-300" />
                                    ) : (
                                        <IoMicOutline
                                            className={cn(
                                                'size-5 mt-px',
                                                listening ? 'text-white' : 'text-neutral-400',
                                            )}
                                        />
                                    )}
                                </button>
                            </ToolTipComponent>
                        )}

                        <ToolTipComponent
                            content={hasContent ? 'Send message' : 'Type a message'}
                            side="top"
                        >
                            <button
                                disabled={!hasContent}
                                onClick={handleSubmit}
                                className={cn(
                                    'w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200',
                                    hasContent
                                        ? 'bg-light-base hover:bg-light-base/40'
                                        : 'bg-neutral-800 cursor-not-allowed opacity-40',
                                )}
                            >
                                <HiArrowUp
                                    className={cn(
                                        'size-4 stroke-2',
                                        hasContent ? 'text-neutral-900' : 'text-neutral-600',
                                    )}
                                />
                            </button>
                        </ToolTipComponent>
                    </div>
                </div>
            </div>
        </div>
    );
}
