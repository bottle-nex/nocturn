'use client';

import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { v7 as uuid } from 'uuid';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import { useTypewriterPlaceholder } from '@/hooks/useTypewriterPlaceholder';
import { HiPlus, HiMicrophone, HiArrowUp, HiSparkles, HiArrowUpRight } from 'react-icons/hi2';
import { CgSpinner } from 'react-icons/cg';
import { AiQuizChatRole, AiQuizMessage, dummyPrompts } from '@nocturn/types';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import React, { useMemo, useRef, useState } from 'react';
import Message from './Message/Message';
import useVoiceRecognition from '@/hooks/useVoiceRecognition';
import AiSlidesPreviewArea from './AiSlidesPreviewArea';
import AiBackendAction from '@/lib/backend/home/start-with-ai-action';
import OpacityBackground from '@/components/utility/OpacityBackground';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useQuizTemplatesStore } from '@/store/templates/useQuizTemplatesStore';
import Spinner from '@/components/ui/Spinner';


const newChatPlaceholders = ['Have an idea?', "Don't know where to start?", 'Use me!'];
const difficultyPlaceholders = ['want it easy?', 'or challenging?', 'cast with toughness'];
const revampPlaceholders = ['not satisfied?', 'having more things in mind?', 'abra ka dabra!'];

export default function AIChatBoxRevamp() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { session } = useUserSessionStore();
    const [value, setValue] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const { quiz, messages, sessionId, loading, setLoading, appendMessage, resetChat } = useAiChatStore();
    const { templates } = useQuizTemplatesStore();
    const randomValue = useMemo(
        () => Math.floor(Math.random() * templates.length),
        [templates.length],
    );

    const selectedTemplate = templates[randomValue];
    const router = useRouter();

    const { listening, interimTranscript, toggle, stop } = useVoiceRecognition({
        onFinalTranscript: (text) => setPrompt((prev) => (prev ? prev + ' ' : '') + text),
    });

    const animatedPlaceholders = useTypewriterPlaceholder(
        quiz
            ? revampPlaceholders
            : messages.length > 0
                ? difficultyPlaceholders
                : newChatPlaceholders,
    );

    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setValue(e.target.value);
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }

    async function handleSubmit() {
        const finalPrompt = `${value} ${prompt}`.trim();
        if (!finalPrompt) return;

        stop();

        const message: AiQuizMessage = {
            id: uuid(),
            aiQuizChatSessionId: sessionId || '',
            role: AiQuizChatRole.USER,
            content: finalPrompt,
            createdAt: new Date(),
        };

        appendMessage(message);
        AiBackendAction.create_new_quiz(session?.user.token, sessionId, finalPrompt);
        setLoading(true);
        setValue('');
        setPrompt('');
        setExpanded(true);
    }

    function handleOnKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    function handleOnContinue() {
        if (selectedTemplate) {
            useNewQuizStore.getState().setPendingTemplate(selectedTemplate);
        }
        router.push(`/new/${quiz?.id}`);
    }

    function handleOnClose() {
        resetChat();
        setExpanded(false);
    }

    const hasContent = value.trim().length > 0 || prompt.trim().length > 0;

    if (!expanded) {
        return (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-115 text-neutral-200">
                <InputBox
                    textareaRef={textareaRef}
                    value={value}
                    isFocused={isFocused}
                    hasContent={hasContent}
                    listening={listening}
                    interimTranscript={interimTranscript}
                    animatedPlaceholders={animatedPlaceholders}
                    onChange={handleChange}
                    onKeyDown={handleOnKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onToggleVoice={toggle}
                    onSubmit={handleSubmit}
                />
            </div>
        );
    }

    return (
        <OpacityBackground className="bg-black/20">
            <div className="fixed inset-6 z-40 flex flex-row overflow-hidden rounded-2xl bg-light-alpha dark:bg-dark-alpha border dark:border-light-base/10 border-dark-alpha/10 shadow-2xl text-neutral-200 max-w-8xl mx-auto">
                <div className="flex flex-col w-100 shrink-0 border-r dark:border-light-base/10 border-dark-alpha/10 h-full">
                    <section
                        className="flex-1 overflow-y-auto px-3 pt-4 space-y-2 custom-scrollbar"
                        data-lenis-prevent
                    >
                        {messages.map((msg) => (
                            <Message
                                key={msg.id}
                                message={msg}
                                loading={false}
                                image={session?.user.image}
                            />
                        ))}
                    </section>

                    <div className="p-3 mb-2">
                        {loading && (
                            <div className="flex items-center justify-start gap-x-3 mb-2 ml-2">
                                <Spinner />
                                <span className='text-sm text-dark-alpha dark:text-light-alpha'>loading..</span>
                            </div>
                        )}
                        {messages.length < 1 && (
                            <div className="mb-3 space-y-1.5">
                                <p className="px-1 text-[11px] font-medium uppercase tracking-widest dark:text-light-alpha/30 text-dark-alpha/30">
                                    Try asking
                                </p>
                                {dummyPrompts.map((dp) => (
                                    <button
                                        key={dp.id}
                                        type="button"
                                        onClick={() => setValue(dp.prompt)}
                                        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:dark:bg-light-alpha/5 hover:bg-dark-alpha/5 cursor-pointer"
                                    >
                                        <HiSparkles className="shrink-0 text-[13px] dark:text-light-alpha/25 text-dark-alpha/25 group-hover:dark:text-light-alpha/60 group-hover:text-dark-alpha/60 transition-colors" />
                                        <span className="truncate text-[13px] leading-snug font-normal dark:text-light-alpha/50 text-dark-alpha/50 group-hover:dark:text-light-alpha/90 group-hover:text-dark-alpha/90 transition-colors">
                                            {dp.prompt}
                                        </span>
                                        <HiArrowUpRight className="shrink-0 ml-auto text-[11px] opacity-0 group-hover:opacity-50 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        )}
                        <InputBox
                            textareaRef={textareaRef}
                            value={value}
                            isFocused={isFocused}
                            hasContent={hasContent}
                            listening={listening}
                            interimTranscript={interimTranscript}
                            animatedPlaceholders={animatedPlaceholders}
                            onChange={handleChange}
                            onKeyDown={handleOnKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onToggleVoice={toggle}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>

                <AiSlidesPreviewArea
                    onClose={handleOnClose}
                    onContinue={handleOnContinue}
                    selectedTemplate={selectedTemplate}
                />
            </div>
        </OpacityBackground>
    );
}

/* ── Shared input box ── */

interface InputBoxProps {
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
    value: string;
    isFocused: boolean;
    hasContent: boolean;
    listening: boolean;
    interimTranscript: string;
    animatedPlaceholders: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onFocus: () => void;
    onBlur: () => void;
    onToggleVoice: () => void;
    onSubmit: () => void;
}

function InputBox({
    textareaRef,
    value,
    isFocused,
    hasContent,
    listening,
    interimTranscript,
    animatedPlaceholders,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    onToggleVoice,
    onSubmit,
}: InputBoxProps) {
    return (
        <div
            className={cn(
                'rounded-2xl dark:bg-dark-alpha bg-light-base border dark:border-light-alpha/10 border-dark-alpha/10 transition-colors relative overflow-hidden',
                isFocused && 'ring-2 ring-nprimary/60',
            )}
        >
            <div className="px-4 pt-3">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder={value ? '' : animatedPlaceholders}
                    className="w-full resize-none bg-transparent outline-none text-[15px] dark:text-light-base text-dark-base placeholder:text-neutral-500 max-h-30 overflow-y-auto"
                />
                {listening && interimTranscript && (
                    <div className="text-sm text-neutral-400 italic mt-1 pb-2">
                        {interimTranscript}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between px-3 pb-3 pt-2">
                <button
                    aria-label="sdsdv"
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors"
                >
                    <HiPlus className="text-neutral-400 text-xl" />
                </button>

                <div className="flex items-center gap-2">
                    {!hasContent && (
                        <button
                            onClick={onToggleVoice}
                            className={cn(
                                'w-8 h-8 flex items-center justify-center rounded-full transition-all',
                                listening
                                    ? 'bg-red-500/20 text-red-500'
                                    : 'hover:bg-neutral-800 text-neutral-400',
                            )}
                        >
                            {listening ? (
                                <CgSpinner className="animate-spin text-base" />
                            ) : (
                                <HiMicrophone className="text-xl" />
                            )}
                        </button>
                    )}

                    <button
                        aria-label="sdsdvsdv"
                        disabled={!hasContent}
                        onClick={onSubmit}
                        className={cn(
                            'w-8 h-8 flex items-center justify-center rounded-full transition-all',
                            hasContent
                                ? 'bg-neutral-100 text-neutral-900 hover:scale-105'
                                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed',
                        )}
                    >
                        <HiArrowUp className="text-base" />
                    </button>
                </div>
            </div>
        </div>
    );
}
