import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RxCross2 } from 'react-icons/rx';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useCollaborativeEdit } from '@/hooks/useCollaborativeEdit';
import BackendActions from '@/lib/backend/new/quiz-backend-actions';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useQuizTemplatesStore } from '@/store/templates/useQuizTemplatesStore';
import { toast } from '@/lib/toast';
import { FaPalette } from 'react-icons/fa6';
import { HexColorPicker, HexColorInput } from 'react-colorful';

function hexToAlpha(hex: string): number {
    if (hex.length === 9) {
        return Math.round(parseInt(hex.slice(7, 9), 16) / 2.55);
    }
    return 100;
}

function applyAlphaToHex(hex: string, alphaPercent: number): string {
    const base = hex.slice(0, 7);
    const alphaHex = Math.round(alphaPercent * 2.55)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase();
    return base + alphaHex;
}
interface Props {
    onClose: () => void;
}

export default function CustomThemeEditor({ onClose }: Props) {
    const { quiz } = useNewQuizStore();
    const { updateQuizAndBroadcast } = useCollaborativeEdit();

    const template = quiz.template;
    const isCustom = template.name === 'CUSTOM';
    const [activePickerId, setActivePickerId] = useState<string | null>(null);
    const { session } = useUserSessionStore();
    const { templates, setTemplates } = useQuizTemplatesStore();
    const [isSaving, setIsSaving] = useState(false);

    async function forceSaveTheme() {
        if (!session?.user?.token || !template) return;
        setIsSaving(true);
        const resolvedTemplate = await BackendActions.upsertTemplateAction(
            template,
            session.user.token,
        );
        setIsSaving(false);
        if (resolvedTemplate) {
            toast.success('Theme saved successfully!');
            // Update local template grid with new or updated template
            const exists = templates.some((t) => t.id === resolvedTemplate.id);
            if (exists) {
                setTemplates(
                    templates.map((t) => (t.id === resolvedTemplate.id ? resolvedTemplate : t)),
                );
            } else {
                setTemplates([...templates, resolvedTemplate]);
            }
            // Bind the precise persistent ID back to the current active quiz
            updateQuizAndBroadcast({
                template: resolvedTemplate,
                templateId: resolvedTemplate.id,
            });
        } else {
            toast.error('Failed to save theme.');
        }
    }

    function togglePicker(id: string) {
        setActivePickerId((prev) => (prev === id ? null : id));
    }

    function handleColorChange(key: string, value: string) {
        if (!isCustom) return;
        updateQuizAndBroadcast({
            template: {
                ...template,
                [key]: value,
            },
        });
    }

    function handleAccentColorChange(value: string) {
        if (!isCustom) return;
        const currentAlpha = hexToAlpha(template.accentColor);
        handleColorChange('accentColor', applyAlphaToHex(value, currentAlpha));
    }

    function handleAccentAlphaChange(opacity: number) {
        if (!isCustom) return;
        handleColorChange('accentColor', applyAlphaToHex(template.accentColor, opacity));
    }

    function handleBarColorChange(index: number, value: string) {
        if (!isCustom) return;
        const newBars = [...template.bars];
        newBars[index] = value;
        updateQuizAndBroadcast({
            template: {
                ...template,
                bars: newBars,
            },
        });
    }

    return (
        <motion.div
            drag
            dragMomentum={false}
            className="fixed bottom-10 right-10 z-[100] w-80 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-xl rounded-alpha cursor-move overflow-visible flex flex-col"
            style={{ touchAction: 'none' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 rounded-t-alpha">
                <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-x-2">
                    <FaPalette className="text-indigo-500" />
                    Custom Theme
                </span>
                <div className="flex items-center gap-x-2">
                    <button
                        onClick={forceSaveTheme}
                        disabled={isSaving}
                        className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-alpha text-xs font-medium transition-colors"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-alpha cursor-pointer transition-colors"
                    >
                        <RxCross2 className="text-neutral-500" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div
                className="p-4 flex flex-col gap-y-5 cursor-auto overflow-visible"
                onPointerDownCapture={(e) => e.stopPropagation()}
            >
                <div className="flex flex-col gap-y-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide uppercase">
                        Background Canvas Pattern
                    </span>
                    <select
                        value={template.accentType}
                        onChange={(e) => handleColorChange('accentType', e.target.value)}
                        className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-alpha px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-colors"
                    >
                        <option value="mountains">Mountains</option>
                        <option value="wave">Wave</option>
                        <option value="staircase">Staircase</option>
                        <option value="circle">Circle</option>
                        <option value="donut">Donut</option>
                        <option value="slash">Slash</option>
                        <option value="none">None</option>
                    </select>
                </div>

                {/* Colors */}
                <div className="flex flex-col gap-y-3">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide uppercase">
                        Base Colors
                    </span>

                    <ColorPickerRow
                        label="Background"
                        value={template.backgroundColor}
                        isOpen={activePickerId === 'backgroundColor'}
                        onToggle={() => togglePicker('backgroundColor')}
                        onChange={(v) => handleColorChange('backgroundColor', v)}
                    />
                    <ColorPickerRow
                        label="Text Style"
                        value={template.textColor}
                        isOpen={activePickerId === 'textColor'}
                        onToggle={() => togglePicker('textColor')}
                        onChange={(v) => handleColorChange('textColor', v)}
                    />
                    <ColorPickerRow
                        label="Borders"
                        value={template.borderColor}
                        isOpen={activePickerId === 'borderColor'}
                        onToggle={() => togglePicker('borderColor')}
                        onChange={(v) => handleColorChange('borderColor', v)}
                    />

                    <div className="flex flex-col gap-y-2 pt-1">
                        <ColorPickerRow
                            label="Pattern Accent"
                            value={template.accentColor.slice(0, 7)}
                            isOpen={activePickerId === 'accentColor'}
                            onToggle={() => togglePicker('accentColor')}
                            onChange={handleAccentColorChange}
                        />
                        <div className="flex items-center justify-between gap-x-3 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-alpha border border-neutral-100 dark:border-neutral-800">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                Opacity
                            </span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={hexToAlpha(template.accentColor)}
                                onChange={(e) => handleAccentAlphaChange(Number(e.target.value))}
                                className="flex-1 accent-indigo-500 cursor-pointer"
                            />
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 w-6 text-right">
                                {hexToAlpha(template.accentColor)}%
                            </span>
                        </div>
                    </div>

                    <ColorPickerRow
                        label="Items"
                        value={template.itemsColor}
                        isOpen={activePickerId === 'itemsColor'}
                        onToggle={() => togglePicker('itemsColor')}
                        onChange={(v) => handleColorChange('itemsColor', v)}
                    />
                </div>

                <hr className="border-neutral-200 dark:border-neutral-800" />

                {/* Option Bars */}
                <div className="flex flex-col gap-y-3">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium tracking-wide uppercase">
                        Question Option Bars
                    </span>
                    <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-alpha border border-neutral-100 dark:border-neutral-800 gap-x-2">
                        {template.bars.map((barColor, idx) => (
                            <PopoverColorPicker
                                key={idx}
                                color={barColor}
                                isOpen={activePickerId === `bar-${idx}`}
                                onToggle={() => togglePicker(`bar-${idx}`)}
                                onChange={(value) => handleBarColorChange(idx, value)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function PopoverColorPicker({
    color,
    isOpen,
    onToggle,
    onChange,
}: {
    color: string;
    isOpen: boolean;
    onToggle: () => void;
    onChange: (v: string) => void;
}) {
    return (
        <div className="relative isolate">
            <div
                className="w-8 h-8 rounded-alpha border border-neutral-200 dark:border-neutral-700 shadow-sm cursor-pointer"
                style={{ backgroundColor: color }}
                onClick={onToggle}
            />
            {isOpen && (
                <div
                    className="fixed inset-0 z-[190]"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                />
            )}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-[200] right-full mr-4 top-1/2 -translate-y-1/2"
                    >
                        <div className="bg-white dark:bg-neutral-800 p-3 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 flex flex-col gap-y-3 w-[200px]">
                            <HexColorPicker
                                color={color}
                                onChange={onChange}
                                style={{ width: '100%' }}
                            />
                            <div className="flex items-center gap-x-2 border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 bg-neutral-50 dark:bg-neutral-900 focus-within:border-indigo-500 transition-colors">
                                <span className="text-neutral-400 font-mono text-sm">#</span>
                                <HexColorInput
                                    color={color}
                                    onChange={onChange}
                                    className="bg-transparent outline-none w-full text-sm font-mono text-neutral-700 dark:text-neutral-300 uppercase"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ColorPickerRow({
    label,
    value,
    isOpen,
    onToggle,
    onChange,
}: {
    label: string;
    value: string;
    isOpen: boolean;
    onToggle: () => void;
    onChange: (v: string) => void;
}) {
    return (
        <div className="flex items-center justify-between group">
            <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                {label}
            </span>
            <div className="flex items-center gap-x-3">
                <span className="text-xs text-neutral-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {value.toUpperCase()}
                </span>
                <PopoverColorPicker
                    color={value}
                    isOpen={isOpen}
                    onToggle={onToggle}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}
