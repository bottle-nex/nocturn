'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mic, ArrowUp, Loader2 } from 'lucide-react';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import useVoiceRecognition from '@/hooks/useVoiceRecognition';
import { AiQuizChatRole, AiQuizMessage, TemplateType } from '@nocturn/types';
import { v4 as uuid } from 'uuid';
import { cn } from '@/lib/utils';
import { useTypewriterPlaceholder } from '@/hooks/useTypewriterPlaceholder';
import { useRouter } from 'next/navigation';
import AiSlidesPreviewArea from './AiSlidesPreviewArea';

const newChatPlaceholders = ['Have an idea?', "Don't know where to start?", 'Use me!'];
const difficultyPlaceholders = ['want it easy?', 'or challenging?', 'cast with toughness'];
const revampPlaceholders = ['not satisfied?', 'having more things in mind?', 'abra ka dabra!'];

const spring = {
    type: 'spring' as const,
    stiffness: 170,
    damping: 26,
    mass: 1,
};

export default function AIChatBoxRevamp() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [value, setValue] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const { quiz, messages, sessionId, appendMessage } = useAiChatStore();
    const router = useRouter();

    const [currentTheme, setCurrentTheme] = useState<TemplateType | undefined>(quiz?.template);
    const [themePanel, setThemePanel] = useState(false);

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
        router.push(`/new/${quiz?.id}`);
    }

    function handleOnClose() {
        setExpanded(false);
    }

    const hasContent = value.trim().length > 0 || prompt.trim().length > 0;

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-30 bg-black/60"
                        onClick={handleOnClose}
                    />
                )}
            </AnimatePresence>

            {/* Main container */}
            <motion.div
                initial={false}
                animate={
                    expanded
                        ? {
                              bottom: 24,
                              left: 24,
                              right: 24,
                              top: 24,
                              borderRadius: 16,
                          }
                        : {
                              bottom: 32,
                              left: 'calc(50% - 230px)',
                              right: 'calc(50% - 230px)',
                              top: 'auto',
                              borderRadius: 24,
                          }
                }
                transition={spring}
                className={cn(
                    'fixed z-40 flex flex-row overflow-hidden text-neutral-200 font-sans',
                    expanded
                        ? 'bg-neutral-900 border border-neutral-800 shadow-2xl'
                        : 'shadow-2xl',
                )}
            >
                {/* Left sidebar — textarea lives here */}
                <motion.div
                    initial={false}
                    animate={{
                        width: expanded ? 400 : '100%',
                    }}
                    transition={spring}
                    className={cn(
                        'flex flex-col shrink-0 relative h-full',
                        expanded ? 'border-r border-neutral-800' : '',
                    )}
                >
                    {/* Messages area — only visible when expanded */}
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3, delay: 0.15 }}
                                className="flex-1 overflow-y-auto px-3 pt-4"
                            >
                                {/* Messages will render here */}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Input pinned to bottom */}
                    <div className={cn('w-full', expanded ? 'p-3' : '')}>
                        <div
                            className={cn(
                                'rounded-2xl bg-neutral-950 border transition-colors relative overflow-hidden',
                                isFocused ? 'border-neutral-700' : 'border-neutral-800',
                            )}
                        >
                            <div className="px-4 pt-3">
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={value}
                                    onChange={handleChange}
                                    onKeyDown={handleOnKeyDown}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder={value ? '' : animatedPlaceholders}
                                    className="w-full resize-none bg-transparent outline-none text-[15px] text-neutral-100 placeholder:text-neutral-500 max-h-[120px] overflow-y-auto"
                                />
                                {listening && interimTranscript && (
                                    <div className="text-sm text-neutral-400 italic mt-1 pb-2">
                                        {interimTranscript}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between px-3 pb-3 pt-2">
                                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-800 transition-colors">
                                    <Plus size={20} className="text-neutral-400" />
                                </button>

                                <div className="flex items-center gap-2">
                                    {!hasContent && (
                                        <button
                                            onClick={toggle}
                                            className={cn(
                                                'w-8 h-8 flex items-center justify-center rounded-full transition-all',
                                                listening
                                                    ? 'bg-red-500/20 text-red-500'
                                                    : 'hover:bg-neutral-800 text-neutral-400',
                                            )}
                                        >
                                            {listening ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Mic size={20} />
                                            )}
                                        </button>
                                    )}

                                    <button
                                        disabled={!hasContent}
                                        onClick={handleSubmit}
                                        className={cn(
                                            'w-8 h-8 flex items-center justify-center rounded-full transition-all',
                                            hasContent
                                                ? 'bg-neutral-100 text-neutral-900 hover:scale-105'
                                                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed',
                                        )}
                                    >
                                        <ArrowUp size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {expanded && (
                                <motion.p
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.25, delay: 0.2 }}
                                    className="mt-3 text-center text-xs text-neutral-500"
                                >
                                    AI can make mistakes. Always check your slides.
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Right side — slides preview */}
                <AnimatePresence>
                    {expanded && (
                        <AiSlidesPreviewArea
                            expanded={expanded}
                            themePanel={themePanel}
                            currentTheme={currentTheme}
                            setThemePanel={setThemePanel}
                            setCurrentTheme={setCurrentTheme}
                            onClose={handleOnClose}
                            onContinue={handleOnContinue}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}
