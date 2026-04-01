import { cn } from '@/lib/utils';
import { QuestionType } from '@nocturn/types';
import { MouseEvent, useState, useEffect, useRef } from 'react';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import FormattingToolbar from '../utility/RichTextEditor';
import { useCollaborativeEdit } from '@/hooks/useCollaborativeEdit';
import { SELECTION_MODE, useCanvasSelectionStore } from '@/store/new-quiz/useCanvasSelectionStore';

let styleInjected = false;
const injectShakeStyle = () => {
    if (typeof window !== 'undefined' && !styleInjected) {
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes shaky-error {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-5px); }
                40% { transform: translateX(5px); }
                60% { transform: translateX(-3px); }
                80% { transform: translateX(3px); }
            }
        `;
        document.head.appendChild(style);
        styleInjected = true;
    }
};

interface CanvasHeadingProps {
    currentQ: QuestionType | undefined;
    className?: string;
}

export default function CanvasHeading({ currentQ }: CanvasHeadingProps) {
    const { currentQuestionIndex } = useNewQuizStore();
    const { editQuestionAndBroadcast } = useCollaborativeEdit();
    const { setState } = useDraftRendererStore();
    const { currentOn, setCurrentOn } = useCanvasSelectionStore();
    const [question, setQuestion] = useState<string | undefined>(currentQ?.question);
    const [isShaking, setIsShaking] = useState(false);
    const [hasError, setHasError] = useState(false);
    const selectedStyles = 'border-2 border-[#5e59b3]';
    const isExternalUpdate = useRef(false);
    const currentQuestionIndexRef = useRef(currentQuestionIndex);
    function getFontSizeClass(text: string): string {
        const length = text.length;
        if (length === 0) return 'text-2xl';
        if (length <= 50) return 'text-2xl';
        if (length <= 60) return 'text-xl';
        if (length <= 70) return 'text-lg';
        if (length <= 95) return 'text-base';
        return 'text-xs';
    }

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                codeBlock: false,
                blockquote: false,
                horizontalRule: false,
                bulletList: false,
                orderedList: false,
                listItem: false,
            }),
            Underline,
            Strike,
        ],
        content: question || '',
        immediatelyRender: false,
        onBlur: ({ editor }) => {
            if (editor.isEmpty || editor.getText().trim() === '') {
                injectShakeStyle();
                setHasError(true);
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 400);
            }
        },
        onUpdate: ({ editor }) => {
            setHasError(prev => {
                if (prev && !editor.isEmpty && editor.getText().trim() !== '') return false;
                return prev;
            });
            // Skip broadcasting if this update came from external source (websocket)
            if (isExternalUpdate.current) {
                isExternalUpdate.current = false;
                return;
            }

            const content = editor.getHTML();
            setQuestion(content);
            editQuestionAndBroadcast(
                currentQuestionIndexRef.current,
                { question: content, id: currentQ?.id },
                { debounce: true, debounceMs: 2000 },
            );
        },
        editorProps: {
            attributes: {
                class: 'w-full py-2 sm:py-3 px-2 rounded-md transition-all duration-200 border border-gray-200 focus:outline-none text-2xl',
                placeholder: 'Ask your question here',
            },
        },
    });

    useEffect(() => {
        currentQuestionIndexRef.current = currentQuestionIndex;
    }, [currentQuestionIndex]);

    useEffect(() => {
        if (editor && currentQ) {
            // Mark this as an external update to prevent broadcasting back
            isExternalUpdate.current = true;
            editor.commands.setContent(currentQ.question || '');
            setQuestion(currentQ.question || '');
        }
    }, [currentQuestionIndex, currentQ, editor]);

    function questionTapHandler(e: MouseEvent<HTMLDivElement>) {
        e.stopPropagation();
        setCurrentOn(SELECTION_MODE.QUESTION);
        setState(DraftRenderer.QUESTION);
        if (editor) {
            editor.commands.focus();
        }
    }

    useEffect(() => {
        if (editor) {
            const textContent = editor.getText();
            const newFontSizeClass = getFontSizeClass(textContent);

            const editorElement = editor.view.dom as HTMLElement;
            editorElement.className = cn(
                'w-full py-2 sm:py-3 px-2 rounded-md transition-all duration-200 focus:outline-gray-200',
                newFontSizeClass,
                currentOn === SELECTION_MODE.QUESTION && selectedStyles,
                hasError && 'bg-red-50 dark:bg-red-950/20 ring-1 ring-red-500! border-red-500! text-red-500 dark:text-red-400'
            );
        }
    }, [question, editor, currentOn, setCurrentOn, hasError]);

    if (!editor) {
        return null;
    }

    return (
        <div className="absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 w-[90%] z-30">
            <div
                onClick={questionTapHandler}
                className={cn('p-1 rounded-[10px]')}
                style={{ boxSizing: 'border-box', animation: isShaking ? 'shaky-error 0.4s ease-in-out' : undefined }}
            >
                <div className="relative">
                    <EditorContent editor={editor} className="question-editor text-center" />

                    {editor.isEmpty && (
                        <div className={cn("absolute top-2 sm:top-3 left-2 pointer-events-none text-2xl", hasError ? "text-red-500/70 dark:text-red-500/70" : "text-gray-400")}>
                            Ask your question here
                        </div>
                    )}
                </div>

                {currentOn === SELECTION_MODE.QUESTION && (
                    <div className="mt-2 absolute left-1/2 -translate-x-1/2">
                        <FormattingToolbar editor={editor} className="w-fit mx-auto" />
                    </div>
                )}
            </div>
        </div>
    );
}
