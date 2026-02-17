'use client';
import PreviewQuiz from '@/components/home/AiChat/PreviewQuiz';
import HomeSidebar from '@/components/test/HomeSidebar';
import HomeTrashPanel from '@/components/test/HomeTrashPanel';
import SidebarPanelRenderer from '@/components/test/SidebarPanelRenderer';
import { SidebarTab } from '@/constants/SidebarTabConstants';
import { useAiChatStore } from '@/store/home/useAiChatStore';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';
import { useQuizTemplatesStore } from '@/store/templates/useQuizTemplatesStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { TemplateType } from '@/types/prisma-types';
import { CustomResponse } from '@nocturn/types';
import axios from 'axios';
import { useEffect } from 'react';
import { GET_QUIZ_TEMPLATES } from 'routes/api_routes';

export default function Home() {
    const { activeTab } = useHomeSidebarStore();
    const { session } = useUserSessionStore();
    const { setTemplates } = useQuizTemplatesStore();
    const { quiz, preview, setPreview } = useAiChatStore();

    const isTrashOpen = activeTab === SidebarTab.TRASH;

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session?.user.token]);

    return (
        <div className="tracking-wider dark:bg-neutral-950 h-screen w-screen overflow-hidden relative select-none">
            <div className="flex h-full">
                <HomeSidebar />
                <SidebarPanelRenderer />
            </div>

            {preview && <PreviewQuiz quiz={quiz!} onPreviewClose={() => setPreview(false)} />}

            {isTrashOpen && (
                <div className="absolute inset-0 z-50 bg-black/30 backdrop-blur-sm">
                    <HomeTrashPanel />
                </div>
            )}
        </div>
    );
}
