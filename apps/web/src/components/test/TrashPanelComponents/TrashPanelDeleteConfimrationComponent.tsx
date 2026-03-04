import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import OpacityBackground from '@/components/utility/OpacityBackground';

interface TrashPanelDeleteConfirmationProps {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function TrashPanelDeleteConfirmationComponent({
    isOpen,
    onCancel,
    onConfirm,
}: TrashPanelDeleteConfirmationProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <OpacityBackground
                    className="bg-black/25 dark:bg-black/45"
                    onBackgroundClick={onCancel}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-dark-alpha border border-black/8 dark:border-white/8 rounded-md shadow-sm px-6 py-5 flex flex-col gap-y-5 w-full max-w-sm mx-4"
                    >
                        <div className="flex flex-col gap-y-1">
                            <span className="text-[15px] font-medium text-dark-base dark:text-light-base tracking-wide">
                                Are you sure?
                            </span>
                            <span className="text-[13px] text-dark-base/55 dark:text-light-base/50 tracking-wide leading-snug">
                                You cannot revert this action.
                            </span>
                        </div>
                        <div className="flex gap-x-2.5 justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onCancel}
                                className="rounded-alpha text-[13px] tracking-wide dark:border-neutral-700 dark:bg-transparent dark:text-light-base dark:hover:bg-white/5"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={onConfirm}
                                className="rounded-alpha text-[13px] tracking-wide bg-red-700 dark:bg-red-700/60 hover:bg-red-700/90 dark:hover:bg-red-700/40 text-light-base shadow-sm border-none"
                            >
                                Delete
                            </Button>
                        </div>
                    </motion.div>
                </OpacityBackground>
            )}
        </AnimatePresence>
    );
}
