'use client';

import { type CSSProperties } from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            position="bottom-center"
            className="toaster group"
            // Match the input surface: sonner reads these vars inline (they beat
            // Tailwind classes); the inset shadow is forced with `!` over sonner's
            // own box-shadow.
            style={
                {
                    '--normal-bg': '#101011',
                    '--normal-text': '#e5e5e5',
                    '--normal-border': 'transparent',
                } as CSSProperties
            }
            toastOptions={{
                classNames: {
                    toast: 'group toast rounded-lg !shadow-[inset_0_1px_0_0_var(--color-border)]',
                    description: 'text-neutral-400',
                    actionButton: 'bg-neutral-100 text-neutral-900',
                    cancelButton: 'bg-white/5 text-neutral-300',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
