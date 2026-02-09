import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            style={{ fontFamily: 'inherit', overflowWrap: 'anywhere' }}
            toastOptions={{
                unstyled: true,
                classNames: {
                    toast: 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 font-heading shadow-shadow rounded-lg text-[13px] flex items-center gap-2.5 p-4 w-[356px] [&:has(button)]:justify-between',
                    description: 'tracking-widr',
                    actionButton:
                        'font-base border-2 text-[12px] h-6 px-2 bg-main text-main-foreground border-border rounded-base shrink-0',
                    cancelButton:
                        'font-base border-2 text-[12px] h-6 px-2 bg-secondary-background text-foreground border-border rounded-base shrink-0',
                    error: 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white',
                    loading:
                        '[&[data-sonner-toast]_[data-icon]]:flex [&[data-sonner-toast]_[data-icon]]:size-4 [&[data-sonner-toast]_[data-icon]]:relative [&[data-sonner-toast]_[data-icon]]:justify-start [&[data-sonner-toast]_[data-icon]]:items-center [&[data-sonner-toast]_[data-icon]]:flex-shrink-0',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
