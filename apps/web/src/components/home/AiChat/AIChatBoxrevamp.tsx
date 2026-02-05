'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Mic, X, ArrowUp, Expand, Loader2 } from 'lucide-react';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import useVoiceRecognition from '@/hooks/useVoiceRecognition';
import { AiQuizChatRole, AiQuizMessage } from '@nocturn/types';
import { v4 as uuid } from 'uuid';
import { cn } from '@/lib/utils';
import { useTypewriterPlaceholder } from '@/hooks/useTypewriterPlaceholder';

const newChatPlaceholders = ['Have an idea?', "Don't know where to start?", 'Use me!'];
const difficultyPlaceholders = ['want it easy?', 'or challenging?', 'cast with toughness'];
const revampPlaceholders = ['not satisfied?', 'having more things in mind?', 'abra ka dabra!'];

export default function AIChatBoxRevamp() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [value, setValue] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const { quiz, messages, sessionId, appendMessage } = useAiChatStore();
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
        // AiBackendAction.create_new_quiz(session?.user.token, id, finalPrompt);

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

    const hasContent = value.trim().length > 0 || prompt.trim().length > 0;

    return (
        <div className="relative w-full overflow-hidden flex items-center justify-center text-neutral-200 font-sans">
            {/* Background hint */}
            <AnimatePresence>
                {!expanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-800 font-bold text-4xl select-none "
                    >
                        AI CHAT CANVAS
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                layout
                initial="collapsed"
                animate={expanded ? 'expanded' : 'collapsed'}
                variants={{
                    collapsed: {
                        position: 'fixed',
                        bottom: 32,
                        left: '50%',
                        x: '-50%',
                        width: 460,
                        height: 'auto', // Hug content initially
                        borderRadius: 24,
                    },
                    expanded: {
                        position: 'fixed',
                        bottom: 24,
                        left: 24,
                        x: '0%',
                        width: 'calc(100vw - 48px)',
                        height: 'calc(100vh - 48px)',
                        borderRadius: 16,
                    },
                }}
                transition={{
                    type: 'spring',
                    stiffness: 85, // Lower stiffness for more visible movement
                    damping: 18,
                    mass: 1.2,
                }}
                className="z-30 overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl flex flex-row items-stretch"
            >
                {/* LEFT SIDE (Input Area / Sidebar) */}
                <motion.div
                    layout="position"
                    className={cn(
                        'flex flex-col relative shrink-0 transition-colors duration-500',
                        expanded ? 'border-r border-neutral-800' : '',
                    )}
                    // Explicitly animate width to prevent snapping
                    animate={{
                        width: expanded ? 400 : '100%',
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 85,
                        damping: 18,
                        mass: 1.2,
                    }}
                >
                    {/* Header Controls */}
                    <AnimatePresence>
                        {expanded && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex justify-between items-center px-4 py-3 border-b border-neutral-800 shrink-0"
                            >
                                <span className="text-sm font-medium text-neutral-400">
                                    Chat Session
                                </span>
                                <button
                                    onClick={() => setExpanded(false)}
                                    className="p-2 hover:bg-neutral-800 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* The Input Container Area */}
                    <motion.div
                        layout
                        className={cn(
                            'p-4 w-full flex flex-col',
                            // Use margin-top auto to push it to bottom in expanded mode
                            expanded ? 'mt-auto' : '',
                        )}
                    >
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
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="mt-4 text-center shrink-0"
                                >
                                    <p className="text-xs text-neutral-500">
                                        AI can make mistakes. Verify info.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {/* RIGHT SIDE (Expanded Content) */}
                {/* We keep this in DOM but animate width 0 -> auto to ensure parent layout animates smoothly */}
                <motion.div
                    layout="position"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{
                        opacity: expanded ? 1 : 0,
                        width: expanded ? '100%' : 0,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 85,
                        damping: 18,
                        mass: 1.2,
                    }}
                    className="h-full bg-neutral-900 overflow-hidden flex flex-col"
                >
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-neutral-500 min-w-[300px]">
                        <div className="w-16 h-16 rounded-full bg-neutral-800/50 mb-6 flex items-center justify-center">
                            <Expand className="text-neutral-600" size={24} />
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-300 mb-2">
                            Expansion Complete
                        </h3>
                        <p className="max-w-md">
                            {"The card has expanded upwards. The 'Right Side' animated from 0 width to fill the space, allowing the parent container to interpolate its size smoothly."}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
