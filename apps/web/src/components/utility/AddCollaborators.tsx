import UtilityCard from './UtilityCard';
import { Dispatch, JSX, SetStateAction, useRef, useState } from 'react';
import { useHandleClickOutside } from '@/hooks/useHandleClickOutside';
import { GoArrowLeft } from 'react-icons/go';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { IoIosSettings } from 'react-icons/io';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { motion, AnimatePresence } from 'motion/react';
import { RxCross1 } from 'react-icons/rx';
import { ChevronDown, Check } from 'lucide-react';
import { z } from 'zod';
import { cn } from '@/lib/utils';

interface AddCollaboratorsProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

interface ScreenSettings {
    setScreen: Dispatch<SetStateAction<CollaboratorScreens>>;
}

interface AddCollaboratorsScreenProps {
    setScreen: Dispatch<SetStateAction<CollaboratorScreens>>;
}

enum CollaboratorScreens {
    COLLABORATORS_SETTINGS = 'COLLABORATORS_SETTINGS',
    ADD_COLLABORATORS = 'ADD_COLLABORATORS',
    MAIN = 'MAIN',
}

export default function AddCollaborators({ open, setOpen }: AddCollaboratorsProps): JSX.Element {
    const [screen, setScreen] = useState<CollaboratorScreens>(CollaboratorScreens.MAIN);
    const addCollaboratorsRef = useRef<HTMLDivElement>(null);

    useHandleClickOutside([addCollaboratorsRef], setOpen);

    if (!open) return <></>;

    function renderScreens(): JSX.Element {
        switch (screen) {
            case CollaboratorScreens.ADD_COLLABORATORS:
                return <AddCollaboratorsScreen setScreen={setScreen} />;
            case CollaboratorScreens.COLLABORATORS_SETTINGS:
                return <CollaboratorsSettingsScreen setScreen={setScreen} />;
            case CollaboratorScreens.MAIN:
                return <MainCollaboratorsScreen setScreen={setScreen} />;
            default:
                return <div>Main Collaborators Screen</div>;
        }
    }

    return (
        <UtilityCard
            ref={addCollaboratorsRef}
            className="w-100 py-5 absolute top-full right-0 translate-y-2 dark:bg-dark-base bg-neutral-100 rounded-sm dark:border-neutral-800/40! border-neutral-300/40 overflow-visible"
        >
            <AnimatePresence mode="wait">{renderScreens()}</AnimatePresence>
        </UtilityCard>
    );
}

function MainCollaboratorsScreen({ setScreen }: ScreenSettings) {
    return (
        <motion.div
            key="main"
            initial={{ opacity: 0, x: -32, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <div className="flex justify-between items-center dark:text-light-alpha/90 text-dark-alpha/90">
                <h1 className="text-lg font-semibold">Add Collaborators</h1>
                <IoIosSettings
                    onClick={() => setScreen(CollaboratorScreens.COLLABORATORS_SETTINGS)}
                    className="size-6"
                />
            </div>
            <div className="mt-4">
                <Label className="pl-1" htmlFor="add-collaborators-input">
                    People with access to
                </Label>
                <div className="relative mt-2">
                    <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-light-alpha/90 text-dark-alpha/90 size-6" />
                    <Input
                        onFocus={() => setScreen(CollaboratorScreens.ADD_COLLABORATORS)}
                        placeholder="Add people to edit this quiz"
                        className="rounded-[8px] dark:bg-black/20! bg-white/80 py-5 pl-11"
                        id="add-collaborators-input"
                    />
                </div>
            </div>
        </motion.div>
    );
}

function AddCollaboratorsScreen({ setScreen }: AddCollaboratorsScreenProps) {
    const [email, setEmail] = useState<string>('');
    const [emails, setEmails] = useState<{ email: string; valid: boolean }[]>([]);
    const [permission, setPermission] = useState<string>('edit');
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    function onEnter() {
        if (email.trim() === '') return;

        let isValid = true;
        try {
            z.email().parse(email.trim());
        } catch {
            isValid = false;
        }

        setEmails((prev) => [...prev, { email: email.trim(), valid: isValid }]);
        setEmail('');
    }

    return (
        <motion.div
            key="add-collaborators"
            initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <div className="flex justify-start items-center gap-x-4 dark:text-light-alpha/90 text-dark-alpha/90">
                <GoArrowLeft
                    onClick={() => setScreen(CollaboratorScreens.MAIN)}
                    className="size-7 p-1 hover:dark:bg-neutral-800 rounded transition-colors"
                />
                <h1 className="text-base font-semibold mt-0.5">Share design</h1>
            </div>
            <div className="mt-4">
                <Label className="pl-1" htmlFor="add-collaborators-input">
                    People with access to
                </Label>
                <section className="flex flex-wrap items-center gap-x-2 gap-y-2 mt-1 pl-1">
                    {emails.map((emailObj, index) => (
                        <div
                            key={index}
                            className={cn(
                                'text-sm pr-2 pl-1 py-0.5 rounded-[4px] border flex items-center gap-x-1 select-none',
                                emailObj.valid
                                    ? 'dark:text-white/70 dark:border-neutral-700 dark:bg-neutral-700'
                                    : 'bg-red-500/90 border-red-500 text-red-100',
                            )}
                        >
                            <RxCross1
                                className={cn(
                                    'rounded-full bg-neutral-300 text-neutral-900 size-5 p-1',
                                    emailObj.valid ? '' : 'bg-red-900 text-red-100',
                                )}
                                onClick={() => setEmails(emails.filter((_, i) => i !== index))}
                            />
                            {emailObj.email}
                        </div>
                    ))}
                </section>
                <div className="relative flex items-center mt-2 rounded-[8px] border border-neutral-800 overflow-visible">
                    <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-white size-6" />
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onEnter();
                            }
                        }}
                        placeholder="Add people to edit this quiz"
                        className="rounded-[8px] border-0 dark:bg-dark-base pl-11 py-5 placeholder:text-white/70 text-white"
                        id="add-collaborators-input"
                    />
                    <div className="border-r border-white pr-3">
                        <RxCross1
                            strokeWidth={1}
                            className="rounded-full bg-neutral-300 text-neutral-900 p-1"
                            onClick={() => setEmails([])}
                        />
                    </div>
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-x-2 px-3 py-2 text-sm capitalize text-white"
                        >
                            {permission}
                            <ChevronDown className="h-4 w-4 opacity-50" />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute top-full right-0 mt-1 dark:bg-dark-base bg-white rounded-sm border dark:border-neutral-700 border-neutral-300 shadow-xl z-9999 min-w-30 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPermission('view');
                                        setDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm dark:hover:bg-neutral-800 hover:bg-neutral-100 dark:text-white text-dark-alpha transition-colors"
                                >
                                    View
                                    {permission === 'view' && <Check className="h-4 w-4" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPermission('edit');
                                        setDropdownOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm dark:hover:bg-neutral-800 hover:bg-neutral-100 dark:text-white text-dark-alpha transition-colors"
                                >
                                    Edit
                                    {permission === 'edit' && <Check className="h-4 w-4" />}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CollaboratorsSettingsScreen({ setScreen }: ScreenSettings) {
    return (
        <motion.div
            key="collaborators-settings"
            initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <div className="flex justify-start items-center gap-x-4 dark:text-light-alpha/90 text-dark-alpha/90">
                <GoArrowLeft
                    onClick={() => setScreen(CollaboratorScreens.MAIN)}
                    className="size-7 p-1 hover:dark:bg-neutral-800 rounded transition-colors"
                />
                <h1 className="text-base font-semibold mt-0.5">Collaborator settings</h1>
            </div>
        </motion.div>
    );
}
