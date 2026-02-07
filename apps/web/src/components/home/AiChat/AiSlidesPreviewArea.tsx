import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { LiaPagerSolid } from 'react-icons/lia';
import ChangeThemePanel from './ChangeThemePanel';

interface AiSlidesPreviewAreaProps {
    expanded: boolean;
    themePanel: boolean;
    currentTheme: string;
    setThemePanel: (value: boolean) => void;
    setCurrentTheme: (theme: string) => void;
    setPreviewTheme?: (theme: string | null) => void;
    onClose: () => void;
    onContinue: () => void;
}

export default function AiSlidesPreviewArea({
    expanded,
    themePanel,
    currentTheme,
    setThemePanel,
    setCurrentTheme,
    setPreviewTheme,
    onClose,
    onContinue,
}: AiSlidesPreviewAreaProps) {
    if (!expanded) return null;

    return (
        <motion.div
            layout="position"
            initial={{ opacity: 0, width: 0 }}
            animate={{
                opacity: expanded ? 1 : 0,
                width: expanded ? '100%' : 0,
            }}
            transition={{
                type: 'spring',
                stiffness: 85,
                damping: 18,
                mass: 1.2,
            }}
            className="h-full bg-neutral-900 overflow-hidden flex flex-col"
        >
            <div className="flex-1 flex flex-col text-center text-neutral-500 min-w-75 px-10 py-5 ">
                <SlidesPreviewNav
                    themePanel={themePanel}
                    currentTheme={currentTheme}
                    setThemePanel={setThemePanel}
                    setPreviewTheme={setPreviewTheme}
                    setCurrentTheme={setCurrentTheme}
                    onContinue={onContinue}
                    onClose={onClose}
                />
            </div>
        </motion.div>
    );
}

interface SlidesPreviewNavProps {
    themePanel: boolean;
    currentTheme: string;
    setThemePanel: (value: boolean) => void;
    setPreviewTheme?: (theme: string | null) => void;
    setCurrentTheme: (theme: string) => void;
    onContinue: () => void;
    onClose: () => void;
}

function SlidesPreviewNav({
    themePanel,
    currentTheme,
    setThemePanel,
    setPreviewTheme,
    setCurrentTheme,
    onContinue,
    onClose,
}: SlidesPreviewNavProps) {
    return (
        <div className="relative w-full flex justify-between items-center">
            <div
                className={cn(
                    'relative flex items-center gap-x-1 px-3 py-1.5',
                    'rounded-beta hover:bg-dark-alpha transition cursor-pointer',
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    setThemePanel(true);
                }}
            >
                <LiaPagerSolid size={20} />
                <span>Change theme</span>

                {themePanel && (
                    <ChangeThemePanel
                        currentTheme={currentTheme}
                        onThemeHover={setPreviewTheme}
                        onThemeChange={(theme) => {
                            setCurrentTheme(theme);
                            setPreviewTheme?.(null);
                            setThemePanel(false);
                        }}
                        onClose={() => {
                            setPreviewTheme?.(null);
                            setThemePanel(false);
                        }}
                    />
                )}
            </div>

            <div
                className={cn(
                    'absolute left-1/2 -translate-x-1/2 text-4xl ',
                    'dark:bg-clip-text dark:text-transparent dark:bg-linear-to-b dark:from-light-base dark:via-light-base/80 dark:to-light-base/10',
                )}
            >
                Previewing slides
            </div>

            <div className="flex gap-x-3">
                <div
                    className="px-3 py-1.5 rounded-beta bg-light-alpha text-dark-alpha cursor-pointer"
                    onClick={onClose}
                >
                    Cancel
                </div>
                <div
                    className="px-3 py-1.5 rounded-beta bg-alpha text-light-alpha cursor-pointer"
                    onClick={onContinue}
                >
                    Continue
                </div>
            </div>
        </div>
    );
}
