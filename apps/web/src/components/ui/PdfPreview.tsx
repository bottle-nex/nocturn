import { useEffect, useState } from 'react';
import { RxCross2 } from 'react-icons/rx';

interface PdfPreviewProps {
    file: File | null;
    onRemove?: () => void;
}

export default function PdfPreview({ file, onRemove }: PdfPreviewProps) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    if (!file || !url) return null;

    return (
        <div className="h-64 rounded-md border overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-neutral-50 dark:bg-zinc-900">
                <div className="flex items-center gap-2 truncate">
                    <span className="text-sm font-medium truncate">{file.name}</span>
                </div>

                <div
                    onClick={onRemove}
                    className="rounded-md p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                    aria-label="Remove PDF"
                >
                    <RxCross2 size={16} className="text-black dark:text-white " />
                </div>
            </div>

            <iframe src={url} className="w-full flex-1" title="PDF preview" />
        </div>
    );
}
