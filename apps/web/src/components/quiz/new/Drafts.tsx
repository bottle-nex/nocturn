'use client';

import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import QuestionsDraft from './QuestionsDraft';
import ThemesDraft from './ThemesDraft';
import InteractionsDraft from './InteractionsDraft';
import UtilityCard from '@/components/utility/UtilityCard';
import AdvancedDraft from './AdvancedDraft';
import StakeDraft from './StakeDraft';
import { JSX, useEffect } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export default function Drafts() {
    const { state } = useDraftRendererStore();

    function handleDraftRenderer() {
        switch (state) {
            case DraftRenderer.QUESTION:
                return <QuestionsDraft />;
            case DraftRenderer.THEME:
                return <ThemesDraft />;
            case DraftRenderer.INTERACTION:
                return <InteractionsDraft />;
            case DraftRenderer.ADVANCED || DraftRenderer.AUTO_SAVE:
                return <AdvancedDraft />;
            case DraftRenderer.STAKE:
                return <StakeDraft />;
            case DraftRenderer.NONE:
                return null;
        }
    }

    return (
        <>
            <BigDrafts handleDraftRenderer={handleDraftRenderer} />
            <MediumDrafts handleDraftRenderer={handleDraftRenderer} />
            <SmallDrafts handleDraftRenderer={handleDraftRenderer} />
        </>
    );
}

function BigDrafts({
    handleDraftRenderer,
}: {
    handleDraftRenderer: () => JSX.Element | null | undefined;
}) {
    return (
        <UtilityCard className="hidden xl:flex flex-col bg-light-base dark:bg-dark-base/30 rounded-sm overflow-y-auto custom-scrollbar py-4 px-6 border-[1px] border-neutral-300 dark:border-neutral-800 w-[326px]" data-lenis-prevent>
            {handleDraftRenderer()}
        </UtilityCard>
    );
}

function MediumDrafts({
    handleDraftRenderer,
}: {
    handleDraftRenderer: () => JSX.Element | null | undefined;
}) {
    useEffect(() => {
        gsap.from('utility', {
            x: 300,
            duration: 0.2,
            ease: 'power2.inOut',
        });
    }, [handleDraftRenderer]);

    return (
        <UtilityCard className="utility h-full hidden md2:flex flex-col absolute z-40 xl:hidden bg-light-base/80 dark:bg-dark-base/80 backdrop-blur-md shadow-lg rounded-sm overflow-y-auto custom-scrollbar py-4 px-6 border-[1px] border-neutral-300 dark:border-neutral-800 w-[326px]" data-lenis-prevent>
            {handleDraftRenderer()}
        </UtilityCard>
    );
}

function SmallDrafts({
    handleDraftRenderer,
}: {
    handleDraftRenderer: () => JSX.Element | null | undefined;
}) {
    useEffect(() => {
        gsap.from('utility', {
            x: 300,
            duration: 0.2,
            ease: 'power2.inOut',
        });
    }, [handleDraftRenderer]);

    return (
        <UtilityCard
            className={cn(
                'bg-red-600',
                'utility absolute top-0 right-0 z-40 md2:hidden bg-light-base/80 dark:bg-dark-base/80 backdrop-blur-md shadow-lg rounded-l-sm overflow-y-auto custom-scrollbar py-4 px-6 border-[1px] border-neutral-300 dark:border-neutral-800 ',
                'h-screen xs:w-[326px] w-full',
            )}
            data-lenis-prevent
        >
            {handleDraftRenderer()}
        </UtilityCard>
    );
}
