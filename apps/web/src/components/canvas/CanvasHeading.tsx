import { cn } from '@/lib/utils';
import { QuestionType } from '@nocturn/types';
import { SELECTION_MODE } from './Canvas';
import { Dispatch, MouseEvent, SetStateAction, useState, useEffect } from 'react';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { DraftRenderer, useDraftRendererStore } from '@/store/new-quiz/useDraftRendererStore';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import FormattingToolbar from '../utility/RichTextEditor';

interface CanvasHeadingProps {
    currentQ: QuestionType | undefined;
    selectionMode: SELECTION_MODE;
    className?: string;
    setSelectionMode: Dispatch<SetStateAction<SELECTION_MODE>>;
}

export default function CanvasHeading({
    currentQ,
    selectionMode,
    setSelectionMode,
}: CanvasHeadingProps) {
    const { editQuestion, currentQuestionIndex } = useNewQuizStore();
    const { setState } = useDraftRendererStore();
    const selectedStyles = 'border-2 border-[#5e59b3]';
    const [question, setQuestion] = useState<string | undefined>(currentQ?.question);

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
        onUpdate: ({ editor }) => {
            const content = editor.getHTML();
            setQuestion(content);
            editQuestion(currentQuestionIndex, { question: content });
        },
        editorProps: {
            attributes: {
                class: 'w-full py-2 sm:py-3 px-2 rounded-md transition-all duration-200 border border-gray-200 focus:outline-none text-2xl',
                placeholder: 'Ask your question here',
            },
        },
    });

    useEffect(() => {
        if (editor && currentQ?.question !== editor.getHTML()) {
            editor.commands.setContent(currentQ?.question || '');
            setQuestion(currentQ?.question);
        }
    }, [currentQ?.question, editor]);

    function questionTapHandler(e: MouseEvent<HTMLDivElement>) {
        e.stopPropagation();
        setSelectionMode(SELECTION_MODE.QUESTION);
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
                selectionMode === SELECTION_MODE.QUESTION && selectedStyles,
            );
        }
    }, [question, editor, selectionMode]);

    if (!editor) {
        return null;
    }

    return (
        <div className="absolute top-16 sm:top-17 left-1/2 -translate-x-1/2 w-[90%] z-30">
            <div
                onClick={questionTapHandler}
                className={cn('p-1 rounded-[10px]')}
                style={{ boxSizing: 'border-box' }}
            >
                <div className="relative">
                    <EditorContent editor={editor} className="question-editor text-center" />

                    {editor.isEmpty && (
                        <div className="absolute top-2 sm:top-3 left-2 text-gray-400 pointer-events-none text-2xl">
                            Ask your question here
                        </div>
                    )}
                </div>

                {selectionMode === SELECTION_MODE.QUESTION && (
                    <div className="mt-2 absolute left-1/2 -translate-x-1/2">
                        <FormattingToolbar editor={editor} className="w-fit mx-auto" />
                    </div>
                )}
            </div>
        </div>
    );
}
