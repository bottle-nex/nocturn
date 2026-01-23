import UtilityCard from './UtilityCard';
import { Dispatch, JSX, SetStateAction, useRef, useState, useEffect, RefObject } from 'react';
import { createPortal } from 'react-dom';
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
import { Textarea } from '../ui/text-area';
import { Button } from '../ui/button';
import EmailAction from '@/lib/backend/home/email-action';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';

interface AddCollaboratorsProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    triggerRef: RefObject<HTMLDivElement | null>;
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

export default function AddCollaborators({
    open,
    setOpen,
    triggerRef,
}: AddCollaboratorsProps): JSX.Element {
    const [screen, setScreen] = useState<CollaboratorScreens>(CollaboratorScreens.MAIN);
    const addCollaboratorsRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useHandleClickOutside([addCollaboratorsRef], setOpen);

    useEffect(() => {
        if (!open || !triggerRef?.current) return;

        const updatePosition = () => {
            const triggerRect = triggerRef.current!.getBoundingClientRect();
            setPosition({
                top: triggerRect.bottom + 8, // 8px gap (translate-y-2)
                left: triggerRect.right - 384, // 384px = w-96 (adjust based on modal width)
            });
        };

        updatePosition();

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [open, triggerRef]);

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

    const modalContent = (
        <UtilityCard
            ref={addCollaboratorsRef}
            className="w-100 py-5 fixed dark:bg-dark-base bg-neutral-100 rounded-sm dark:border-neutral-800/40! border-neutral-300/40 overflow-visible z-9999"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
            }}
        >
            <AnimatePresence mode="wait">{renderScreens()}</AnimatePresence>
        </UtilityCard>
    );

    return createPortal(modalContent, document.body);
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
                        className="rounded-[8px] dark:bg-black/20! bg-white/80 py-5 pl-11 border border-neutral-800"
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
    const { quiz } = useNewQuizStore();
    const { session } = useUserSessionStore();

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

    async function addCollaborators() {
        if (!quiz.id || !session?.user.token || emails.length === 0) return;
        await EmailAction.add_collaborator(
            session?.user.token,
            emails.map((e) => e.email),
            quiz?.id,
        );
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
                                'text-sm pr-2 pl-1 py-0.5 rounded border flex items-center gap-x-1 select-none cursor-pointer',
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
                <section className="relative flex items-center mt-2 border border-neutral-800 has-focus:border-indigo-600 overflow-visible rounded-lg dark:bg-black/20! transition-colors">
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
                        className="border-0 pl-11 py-5 placeholder:text-white/70 text-white dark:bg-transparent bg-transparent [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgba(0,0,0,0.2)_inset]! [&:-webkit-autofill]:[-webkit-text-fill-color:white]!"
                        id="add-collaborators-input"
                    />
                    {(email.length > 0 || emails.length > 0) && (
                        <>
                            <div className="border-r border-white pr-3">
                                <RxCross1
                                    strokeWidth={1}
                                    className="rounded-full bg-neutral-300 text-neutral-900 p-1 cursor-pointer"
                                    onClick={() => {
                                        setEmails([]);
                                        setEmail('');
                                    }}
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
                                    <div className="absolute top-full right-0 mt-1 dark:bg-dark-base bg-white rounded-sm border dark:border-neutral-700 border-neutral-300 shadow-xl z-101 min-w-30 overflow-hidden">
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
                        </>
                    )}
                </section>
                <section className="mt-2">
                    <Textarea
                        placeholder="Add a note (optional)"
                        className="rounded-lg dark:bg-black/20! bg-white/80 border border-neutral-800 focus-visible:ring-0 focus-visible:border-indigo-600 placeholder:tracking-wider transition-colors"
                    />
                </section>
                <hr className="my-2" />
                <section className="w-full">
                    <Button
                        onClick={addCollaborators}
                        disabled={!emails.some((email) => email.valid === true)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white tracking-wide text-base"
                    >
                        Invite People
                    </Button>
                </section>
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
