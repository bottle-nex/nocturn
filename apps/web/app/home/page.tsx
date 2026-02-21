'use client';
import PreviewQuiz from '@/components/home/AiChat/PreviewQuiz';
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
import { GET_QUIZ_TEMPLATES } from 'routes/api_routes';

export default function Home() {
    const { session } = useUserSessionStore();
    const { setTemplates } = useQuizTemplatesStore();
    const { quiz, preview, setPreview } = useAiChatStore();
    const [trashOpen, setTrashOpen] = useState<boolean>(false);

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
                console.error('Failed to fetch templates: ', err);
                return;
            }
        }

        if (session?.user.token) {
            fetchTemplates();
        }
    }, [session?.user.token, setTemplates]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key !== 'Escape') return;

            if (trashOpen) setTrashOpen(false);
            if (preview) setPreview(false);
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trashOpen, preview]);

    return (
        <div className="tracking-wider dark:bg-neutral-950 h-screen w-screen overflow-hidden relative select-none">
            <div className="flex h-full">
                <HomeSidebar openTrash={() => setTrashOpen(true)} />
                <SidebarPanelRenderer />
            </div>

            {preview && <PreviewQuiz quiz={quiz!} onPreviewClose={() => setPreview(false)} />}

            {trashOpen && <HomeTrashPanel onClose={() => setTrashOpen(false)} />}
        </div>
    );
}
