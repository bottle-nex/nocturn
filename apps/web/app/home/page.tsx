'use client';
import PreviewQuiz from '@/components/home/AiChat/PreviewQuiz';
import HomeTour from '@/components/home/HomeTour';
import HomeSidebar from '@/components/test/HomeSidebar';
import HomeTrashPanel from '@/components/test/HomeTrashPanel';
import SidebarPanelRenderer from '@/components/test/SidebarPanelRenderer';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import { useQuizTemplatesStore } from '@/store/templates/useQuizTemplatesStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { TemplateType } from '@/types/prisma-types';
import { CustomResponse } from '@nocturn/types';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { GET_QUIZ_TEMPLATES, GET_TUTORIAL_STATUS_URL } from 'routes/api_routes';

export default function Home() {
    const { session, tutorialComplete, setTutorialComplete } = useUserSessionStore();
    const { setTemplates } = useQuizTemplatesStore();
    const { quiz, preview, setPreview } = useAiChatStore();
    const [trashOpen, setTrashOpen] = useState<boolean>(false);

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
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key !== 'Escape') return;

            if (trashOpen) setTrashOpen(false);
            if (preview) setPreview(false);
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [trashOpen, preview, setPreview]);

    return (
        <div className="tracking-wider dark:bg-neutral-950 h-screen w-screen overflow-hidden relative select-none">
            {session?.user && tutorialComplete === false && <HomeTour />}

            <div className="flex h-full">
                <HomeSidebar openTrash={() => setTrashOpen(true)} />
                <SidebarPanelRenderer />
            </div>

            {preview && <PreviewQuiz quiz={quiz!} onPreviewClose={() => setPreview(false)} />}
            {trashOpen && <HomeTrashPanel onClose={() => setTrashOpen(false)} />}
        </div>
    );
}
