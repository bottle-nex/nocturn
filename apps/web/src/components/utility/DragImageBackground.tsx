'use client';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { createPortal } from 'react-dom';
import { FaImage } from 'react-icons/fa';

export default function DragImageBackground({
    onDropFile,
}: {
    onDropFile: (file: File, preview: string) => void;
}) {
    const { dragActive } = useDragAndDrop({
        onDropFile,
        acceptedTypes: ['image/'],
    });

    if (!dragActive) return null;

    return createPortal(
        <>
            <div className="fixed inset-0 z-[998]" />

            {dragActive && (
                <div className="fixed inset-0 z-[999] bg-secDark/70 backdrop-blur-md flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center gap-y-4">
                        <div className="flex items-center justify-center gap-x-4 text-prime">
                            <FaImage size={36} className="scale-110" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-dark-prime dark:text-light-base">
                                Drag your image here
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>,
        document.body,
    );
}
