'use client';

interface ToggleSwitchProps {
    value?: boolean;
    onChange?: (val: boolean) => void;
}

export default function OnOffToggle({ value, onChange }: ToggleSwitchProps) {
    return (
        <div
            className="relative flex w-28 h-8 bg-neutral-200 dark:bg-transparent border rounded-full p-1 cursor-pointer transition-colors duration-300"
            onClick={() => onChange?.(!value)}
        >
            <div
                className={`absolute top-1 left-1 h-6 w-12 rounded-full bg-neutral-800 dark:bg-white transition-all duration-300 ${
                    value ? 'translate-x-[56px]' : 'translate-x-0'
                }`}
            />

            <div className="flex-1 flex items-center justify-center z-10 text-sm font-medium select-none">
                <span
                    className={`transition-colors duration-300 ${
                        !value
                            ? 'text-white dark:text-black'
                            : 'text-neutral-500 dark:text-neutral-300'
                    }`}
                >
                    Off
                </span>
            </div>

            <div className="flex-1 flex items-center justify-center z-10 text-sm font-medium select-none">
                <span
                    className={`transition-colors duration-300 ${
                        value
                            ? 'text-white dark:text-black'
                            : 'text-neutral-500 dark:text-neutral-300'
                    }`}
                >
                    On
                </span>
            </div>
        </div>
    );
}
