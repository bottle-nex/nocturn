'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GoPlus } from 'react-icons/go';
import { FaSquare } from 'react-icons/fa6';
import { IoMicOutline } from 'react-icons/io5';
import { HiArrowUp } from 'react-icons/hi2';
import { v4 as uuid } from 'uuid';

import { cn } from '@/lib/utils';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import useVoiceRecognition from '@/hooks/useVoiceRecognition';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import { useTypewriterPlaceholder } from '@/hooks/useTypewriterPlaceholder';
import { AiQuizChatRole, AiQuizMessage } from '@nocturn/types';

const newChatPlaceholders = ['Have an idea?', "Don't know where to start?", 'Use me!'];
const difficultyPlaceholders = ['want it easy?', 'or challenging?', 'cast with toughness'];
const revampPlaceholders = ['not satisfied?', 'having more things in mind?', 'abra ka dabra!'];

export default function AIChatBoxrevamp() {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [value, setValue] = useState('');
    const [prompt, setPrompt] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isMultiline, setIsMultiline] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const { messages, loading, quiz, appendMessage, sessionId } = useAiChatStore();

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
        <motion.div
            initial={false}
            animate={expanded ? 'expanded' : 'collapsed'}
            variants={{
                collapsed: {
                    left: '50%',
                    x: '-50%',
                    width: '100%',
                    maxWidth: 454,
                },
                expanded: {
                    left: -270,
                    bottom: 40,
                    x: 0,
                    y: 0,
                    height: 600,
                    maxHeight: 600,
                    width: '100%',
                    maxWidth: 2400,
                },
            }}
            transition={{
                type: 'spring',
                stiffness: 120,
                damping: 18,
            }}
            style={{
                bottom: 32,
                transformOrigin: 'bottom left',
            }}
            className="absolute z-30 px-4"
        >
            <div
                className={cn(
                    'rounded-2xl bg-dark-base border transition-colors',
                    isFocused ? 'border-neutral-700' : 'border-neutral-800',
                )}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            >
                <div className="flex">
                    {/* LEFT — fixed chat input */}
                    <div className="w-[420px] shrink-0">
                        <div className="px-4 pt-3">
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={value}
                                onChange={handleChange}
                                onKeyDown={handleOnKeyDown}
                                placeholder={value ? '' : animatedPlaceholders}
                                className="w-full resize-none bg-transparent outline-none text-[15px] text-neutral-100 placeholder:text-neutral-500 max-h-[120px] overflow-y-auto"
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
                                <button
                                    aria-label="Attach file"
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-800"
                                >
                                    <GoPlus size={20} className="text-neutral-400" />
                                </button>
                            </ToolTipComponent>

                            <div className="flex items-center gap-2">
                                {!hasContent && (
                                    <ToolTipComponent
                                        content={listening ? 'Stop recording' : 'Voice input'}
                                        side="top"
                                    >
                                        <button
                                            aria-label={
                                                listening ? 'Stop recording' : 'Voice input'
                                            }
                                            onClick={!loading ? toggle : undefined}
                                            disabled={loading}
                                            className={cn(
                                                'w-8 h-8 flex items-center justify-center rounded-full',
                                                listening ? 'bg-red-500' : 'hover:bg-neutral-800',
                                                loading && 'opacity-40 cursor-not-allowed',
                                            )}
                                        >
                                            {loading ? (
                                                <FaSquare size={14} className="text-neutral-300" />
                                            ) : (
                                                <IoMicOutline
                                                    className={cn(
                                                        'size-5',
                                                        listening
                                                            ? 'text-white'
                                                            : 'text-neutral-400',
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
                                        aria-label={hasContent ? 'Send message' : 'Type a message'}
                                        disabled={!hasContent}
                                        onClick={handleSubmit}
                                        className={cn(
                                            'w-8 h-8 flex items-center justify-center rounded-full',
                                            hasContent
                                                ? 'bg-light-base hover:bg-light-base/40'
                                                : 'bg-neutral-800 opacity-40 cursor-not-allowed',
                                        )}
                                    >
                                        <HiArrowUp
                                            className={cn(
                                                'size-4',
                                                hasContent
                                                    ? 'text-neutral-900'
                                                    : 'text-neutral-600',
                                            )}
                                        />
                                    </button>
                                </ToolTipComponent>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — expanded empty area */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: expanded ? 1 : 0 }}
                        transition={{ delay: 0.2 }}
                        className={cn('flex-1', expanded && 'border-l border-neutral-800')}
                    />
                </div>
            </div>
        </motion.div>
    );
}
