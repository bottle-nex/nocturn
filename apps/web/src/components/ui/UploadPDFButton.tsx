import { ReactElement, useRef } from 'react';
import { Input } from './input';
import { toast } from 'sonner';

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
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast('Only PDF files are allowed');
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

            <div onClick={handleClick} >
                {children}
            </div>
        </>
    );
}
