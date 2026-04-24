'use client';
import PreviewQuiz from '@/components/home/AiChat/PreviewQuiz';
import HomeSidebar from '@/components/test/HomeSidebar';
import HomeTrashPanel from '@/components/test/HomeTrashPanel';
import SidebarPanelRenderer from '@/components/test/SidebarPanelRenderer';
import { Button } from '@/components/ui/button';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import { useQuizTemplatesStore } from '@/store/templates/useQuizTemplatesStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { TemplateType } from '@/types/prisma-types';
import { CustomResponse } from '@nocturn/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { GET_LAST_AI_CHAT, GET_QUIZ_TEMPLATES, GET_TUTORIAL_STATUS_URL } from 'routes/api_routes';
import { RiVipCrownFill } from 'react-icons/ri';
import Link from 'next/link';
import { RxCross1 } from 'react-icons/rx';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { useSeenOnce } from '@/hooks/useSeenOnce';

export default function Home() {
    const [showBanner, setShowBanner] = useState<boolean>(true);
    const { session, tutorialComplete, setTutorialComplete } = useUserSessionStore();
    const { setTemplates } = useQuizTemplatesStore();
    const { quiz, preview, setPreview, setQuiz, setMessages, setSessionId } = useAiChatStore();
    const [trashOpen, setTrashOpen] = useState<boolean>(false);
    const [tooltipOpen, setTooltipOpen] = useState<boolean>(false);
    const [showTooltip, dismissTooltip] = useSeenOnce('premiumTooltipSeen');

    useEffect(() => {
        async function getTutorialStatus() {
            try {
                const { data } = await axios.get(GET_TUTORIAL_STATUS_URL, {
                    headers: {
                        Authorization: `Bearer ${session?.user.token}`,
                    },
                });

                if (data.success) {
                    setTutorialComplete(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch tutorial status', error);
            }
        }

        if (session?.user?.token && tutorialComplete === null) {
            getTutorialStatus();
        }
    }, [session?.user?.token, tutorialComplete, setTutorialComplete]);

    useEffect(() => {
        async function fetchTemplates() {
            try {
                const { data } = await axios.get<CustomResponse<TemplateType[]>>(
                    GET_QUIZ_TEMPLATES,
                    {
                        headers: {
                            Authorization: `Bearer ${session?.user.token}`,
                        },
                    },
                );

                if (data.data) {
                    setTemplates(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch templates:', err);
            }
        }

        if (session?.user?.token) {
            fetchTemplates();
        }
    }, [session?.user?.token, setTemplates]);

    useEffect(() => {
        async function getLastAIChat() {
            try {
                const { data } = await axios.get(GET_LAST_AI_CHAT, {
                    headers: {
                        Authorization: `Bearer ${session?.user.token}`,
                    },
                });

                if (!data.success) return;

                setQuiz(data.data.quiz || null);
                setMessages(data.data.messages);
                setSessionId(data.data.id);
            } catch {
                console.error('cannot find any active chat');
            }
        }
        if (session?.user?.token) {
            getLastAIChat();
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user.token]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key !== 'Escape') return;

            if (trashOpen) setTrashOpen(false);
            if (preview) setPreview(false);
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [trashOpen, preview, setPreview]);

    return (
        <div className="tracking-wider dark:bg-neutral-950 h-screen w-screen overflow-hidden relative select-none flex flex-col">
            <AnimatePresence>
                {showBanner && (
                    <motion.section
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 64, opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        onAnimationComplete={() => {
                            setTimeout(() => {
                                if (showTooltip) setTooltipOpen(true);
                            }, 2000);
                        }}
                        className="bg-alpha flex items-center justify-end w-full px-12 overflow-hidden"
                    >
                        <div className="flex items-center gap-x-3 pr-4 min-h-16">
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut', delay: 0.2 }}
                                className="text-light-alpha text-sm"
                            >
                                Get 30 days free access to all premium features
                            </motion.span>
                            <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
                                <TooltipTrigger asChild>
                                    <Link href={'/premium'}>
                                        <motion.button
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{
                                                duration: 0.3,
                                                ease: 'easeInOut',
                                                delay: 0.2,
                                            }}
                                            className="bg-dark-alpha rounded-full hover:bg-dark-base h-11 px-6! text-light-base dark:text-light-base flex items-center justify-center gap-x-2"
                                        >
                                            <RiVipCrownFill />
                                            Get Premium
                                        </motion.button>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={5}>
                                    <span>
                                        <section className="w-full max-w-82 px-3 py-4 space-y-2">
                                            <h3 className="text-lg font-semibold">
                                                You can still present this month
                                            </h3>
                                            <p className="text-sm w-full dark:text-dark-base/70 text-light-base/70">
                                                On Free, you can present to 50 participants each
                                                month. If more people join a live presentation and
                                                this limit is exceeded, you won&apos;t be
                                                interrupted. You have presented to 0/50 participants
                                                this month. This resets on March 20th.
                                            </p>
                                            <div className="space-x-6 mt-5 w-full flex justify-end">
                                                <Button
                                                    onClick={() => {
                                                        setTooltipOpen(false);
                                                        dismissTooltip();
                                                    }}
                                                    className="hover:bg-transparent bg-transparent shadow-none p-0!"
                                                >
                                                    Got it
                                                </Button>
                                                <Link href={'/premium'}>
                                                    <Button className="rounded-full bg-light-alpha dark:bg-dark-alpha dark:hover:bg-dark-base hover:bg-light-base dark:text-light-alpha text-dark-alpha">
                                                        <RiVipCrownFill />
                                                        Upgrade
                                                    </Button>
                                                </Link>
                                            </div>
                                        </section>
                                    </span>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <Button
                            onClick={() => {
                                setShowBanner(false);
                                dismissTooltip();
                            }}
                            className="rounded-xl ring-0 ring-white/70 hover:ring-3 p-3 cursor-pointer transition duration-100"
                        >
                            <RxCross1 className="text-light-alpha" />
                        </Button>
                    </motion.section>
                )}
            </AnimatePresence>
            <div className="flex flex-1 min-h-0">
                <HomeSidebar openTrash={() => setTrashOpen(true)} />
                <SidebarPanelRenderer />
            </div>

            {preview && <PreviewQuiz quiz={quiz!} onPreviewClose={() => setPreview(false)} />}
            {trashOpen && <HomeTrashPanel onClose={() => setTrashOpen(false)} />}
        </div>
    );
}
