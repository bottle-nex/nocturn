import { cn } from '@/lib/utils';
import { QuestionType, TemplateType } from '@nocturn/types';
import CanvasAccents from '../utility/CanvasAccents';
import { BsThreeDots } from 'react-icons/bs';
import { MouseEvent, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useHandleClickOutside } from '@/hooks/useHandleClickOutside';
import { BiTrash } from 'react-icons/bi';
import { Button } from '../ui/button';
import { useCollaboratorStore } from '@/store/new-quiz/useCollaboratorStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';

interface MiniCanvasProps {
    template: TemplateType | undefined;
    question: QuestionType;
    currentQuestionIndex: number;
    orderIndex: number;
    collaboratorHighlight?: string;
    handleQuestionChange?: (index: number) => void;
    removeQuestion?: (index: number) => void;
    onClick?: (e?: MouseEvent<HTMLDivElement>) => void;
}

export default function MiniCanvas({
    template,
    question,
    currentQuestionIndex,
    orderIndex,
    collaboratorHighlight,
    handleQuestionChange,
    removeQuestion,
    onClick,
}: MiniCanvasProps) {
    const [openMiniCanvasOptions, setOpenMiniCanvasOptions] = useState<boolean>(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { collaboratorAtIndex } = useCollaboratorStore();
    const { session } = useUserSessionStore();
    const currentUserId = session?.user?.id;
    const collaboratorsAtThisIndex = Array.from(collaboratorAtIndex.entries()).filter(
        ([_id, data]) => data.orderIndex === orderIndex,
    );

    const otherCollaboratorsHere = collaboratorsAtThisIndex.filter(
        ([collaboratorId, _data]) => collaboratorId !== currentUserId,
    );
    const hasOtherCollaborators = otherCollaboratorsHere.length > 0;
    const isCurrentUserHere = currentQuestionIndex === question.orderIndex;
    const borderStyles = isCurrentUserHere
        ? 'border-2 border-indigo-600'
        : hasOtherCollaborators
          ? 'border-2 border-red-800'
          : '';

    function handleRemoveQuestion() {
        removeQuestion?.(orderIndex);
        setOpenMiniCanvasOptions(false);
    }

    function stripHtml(html: string): string {
        // Check if we're in the browser environment
        if (typeof window === 'undefined') {
            // Fallback for SSR: simple regex-based HTML stripping
            return html.replace(/<[^>]*>/g, '');
        }

        // Browser environment: use DOM API
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }

    const preview = stripHtml(question.question).slice(0, 10) + '...';

    function openMiniCanvasOptionsHandler(e: MouseEvent<HTMLDivElement>) {
        e.stopPropagation();

        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 128; // 8rem
            const overflowsRight = rect.right + 8 + dropdownWidth > window.innerWidth;
            setDropdownPosition({
                top: rect.top,
                left: overflowsRight ? rect.left - 8 - dropdownWidth : rect.right + 8,
            });
        }

        setOpenMiniCanvasOptions((prev) => !prev);
    }

    useHandleClickOutside([buttonRef, dropdownRef], setOpenMiniCanvasOptions);

    return (
        <>
            <div
                onClick={(e) => {
                    handleQuestionChange?.(orderIndex);
                    onClick?.(e);
                }}
                className={cn(
                    'w-full rounded-md h-18 p-0.5 cursor-pointer relative ',
                    borderStyles,
                    collaboratorHighlight,
                )}
                style={{ boxSizing: 'border-box' }}
            >
                {hasOtherCollaborators && !isCurrentUserHere && (
                    <span className="bottom-full right-2 absolute bg-red-800 text-[9px] px-2 text-white rounded-t-sm tracking-wide z-20">
                        {
                            otherCollaboratorsHere[otherCollaboratorsHere.length - 1][1]
                                .collaboratorName
                        }
                    </span>
                )}
                <div
                    style={{
                        backgroundColor: template?.backgroundColor,
                        color: template?.textColor,
                    }}
                    className="w-full h-full rounded-sm flex justify-center items-center relative group"
                >
                    <div className="text-[10px] text-center text-light-base bg-dark-base rounded-full absolute top-2 left-2 px-2 py-1 hidden group-hover:block">
                        Question {orderIndex + 1}
                    </div>
                    <div
                        ref={buttonRef}
                        onClick={openMiniCanvasOptionsHandler}
                        className="absolute top-1.5 right-1.5 cursor-pointer"
                    >
                        <BsThreeDots
                            size={18}
                            className="text-neutral-900 dark:text-neutral-100 px-1 py-[1px] rounded-sm dark:bg-dark-base/20 bg-light-base/30"
                        />
                    </div>
                    <CanvasAccents
                        className="rounded"
                        design={template?.accentType}
                        accentColor={template?.accentColor}
                    />
                    <div className="text-xs">{preview}</div>
                </div>
            </div>

            {openMiniCanvasOptions &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        className={cn(
                            'bg-light-base/90 dark:bg-dark-base/90 border border-gray-200 dark:border-gray-700',
                            'fixed w-[8rem] rounded-md shadow-lg z-[1000]',
                        )}
                        style={{
                            top: dropdownPosition.top,
                            left: dropdownPosition.left,
                        }}
                    >
                        <Button
                            onClick={() => handleRemoveQuestion()}
                            className={cn(
                                'px-3 py-2 text-red-500 w-full bg-transparent hover:bg-transparent cursor-pointer',
                                'flex items-center justify-between',
                            )}
                        >
                            <span className="text-xs">delete</span>
                            <BiTrash size={12} />
                        </Button>
                    </div>,
                    document.body,
                )}
        </>
    );
}
