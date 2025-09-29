import { cn } from '@/lib/utils';
import React, { useRef } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    autogrow?: boolean;
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ autogrow = false, className, onChange, ...props }, ref) => {
        const internalRef = useRef<HTMLTextAreaElement | null>(null);

        const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (autogrow) {
                const el = internalRef.current;
                if (el) {
                    el.style.height = 'auto';
                    el.style.height = Math.min(el.scrollHeight, 160) + 'px'; // Max height ~10 lines
                }
            }

            // Call user's onChange if they passed one
            if (onChange) {
                onChange(e);
            }
        };

        return (
            <textarea
                ref={(node) => {
                    if (typeof ref === 'function') ref(node);
                    else if (ref)
                        (ref as React.RefObject<HTMLTextAreaElement | null>).current = node;
                    internalRef.current = node;
                }}
                onChange={handleChange}
                className={cn(
                    'flex justify-start items-between p-2',
                    'focus-visible:outline-0',
                    'selection:bg-primary',
                    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                    'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                    'custom-scrollbar',
                    'resize-none overflow-y-auto',
                    className,
                )}
                rows={1}
                {...props}
            />
        );
    },
);

TextArea.displayName = 'TextArea';

export default TextArea;
