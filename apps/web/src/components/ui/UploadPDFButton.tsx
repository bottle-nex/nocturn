import { ReactElement, useRef } from 'react';
import { Input } from './input';
import { toast } from 'sonner';

const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

interface UploadPDFButtonProps {
    children: ReactElement;
    onPdfSelect: (file: File) => void;
}

export default function UploadPDFButton({ children, onPdfSelect }: UploadPDFButtonProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleClick() {
        fileInputRef.current?.click();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) {
            toast('PDF not found!');
            return;
        }

        if (file.type !== 'application/pdf') {
            toast('Only PDF files are allowed');
            return;
        }

        if (file.size > MAX_PDF_SIZE) {
            toast(`PDF size is greater than ${MAX_PDF_SIZE / (1024 * 1024)} MB`);
            return;
        }

        onPdfSelect(file);
    }

    return (
        <>
            <Input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
            />

            <div onClick={handleClick}>{children}</div>
        </>
    );
}
