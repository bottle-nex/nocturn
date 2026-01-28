import UtilityCard from './UtilityCard';
import { Dispatch, JSX, SetStateAction, useRef, useState, useEffect, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useHandleClickOutside } from '@/hooks/useHandleClickOutside';
import { GoArrowLeft, GoBlocked } from 'react-icons/go';
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
import UserStack, { CollaboratorScreens } from '../ui/UserStack';
import { useCollaboratorStore } from '@/store/new-quiz/useCollaboratorStore';
import { TiUserAdd } from "react-icons/ti";
import Image from 'next/image';
import { MdOutlineBlock } from 'react-icons/md';

interface AddCollaboratorsProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    triggerRef: RefObject<HTMLDivElement | null>;
    initiialScreen?: CollaboratorScreens;
    screen: CollaboratorScreens;
    setScreen: Dispatch<SetStateAction<CollaboratorScreens>>;
}

interface ScreenSettings {
    setScreen: Dispatch<SetStateAction<CollaboratorScreens>>;
    setLoading: Dispatch<SetStateAction<boolean>>;
    loading: boolean;
}

interface AddCollaboratorsScreenProps {
    setLoading: Dispatch<SetStateAction<boolean>>;
    loading: boolean;
    setScreen: Dispatch<SetStateAction<CollaboratorScreens>>;
}


export default function AddCollaborators({
    open,
    setOpen,
    triggerRef,
    screen,
    setScreen
}: AddCollaboratorsProps): JSX.Element {
    const addCollaboratorsRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState<boolean>(false);
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

    useEffect(() => {
        if (!open) {
            setLoading(false);
            setScreen(CollaboratorScreens.MAIN);
        }
    }, [open, setScreen])

    if (!open) return <></>;

    function renderScreens(): JSX.Element {
        switch (screen) {
            case CollaboratorScreens.ADD_COLLABORATORS:
                return (
                    <AddCollaboratorsScreen
                        setLoading={setLoading}
                        loading={loading}
                        setScreen={setScreen}
                    />
                );
            case CollaboratorScreens.COLLABORATORS_SETTINGS:
                return (
                    <CollaboratorsSettingsScreen
                        setLoading={setLoading}
                        loading={loading}
                        setScreen={setScreen}
                    />
                );
            case CollaboratorScreens.MAIN:
                return (
                    <MainCollaboratorsScreen
                        setLoading={setLoading}
                        loading={loading}
                        setScreen={setScreen}
                    />
                );
            default:
                return <div>Main Collaborators Screen</div>;
        }
    }

    const modalContent = (
        <UtilityCard
            ref={addCollaboratorsRef}
            className="w-100 py-5 fixed dark:bg-dark-base bg-neutral-100 rounded-sm dark:border-neutral-800/40! border-neutral-300/40 overflow-visible z-9999 tracking-wide"
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
            <div className="flex justify-between items-center dark:text-white text-neutral-700">
                <h1 className="text-lg font-semibold">Add Collaborators</h1>
                <IoIosSettings
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setScreen(CollaboratorScreens.COLLABORATORS_SETTINGS);
                    }}
                    className="size-7 p-1 hover:dark:bg-neutral-800 hover:bg-neutral-200 rounded transition-colors cursor-pointer"
                />
            </div>
            <div className="mt-4">
                <Label className="pl-1 dark:text-white/70 text-neutral-600" htmlFor="add-collaborators-input">
                    People with access to
                </Label>
                <section className="relative flex items-center mt-2 border border-neutral-300 dark:border-neutral-800 has-focus:border-indigo-600 overflow-visible rounded-lg dark:bg-black/20! transition-colors">
                    <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white text-neutral-600 size-6" />
                    <Input
                        onFocus={() => setScreen(CollaboratorScreens.ADD_COLLABORATORS)}
                        placeholder="Add people to edit this quiz"
                        className="border-0 pl-11 py-5 dark:placeholder:text-white/70 placeholder:text-neutral-600 dark:text-white text-neutral-700 dark:bg-transparent bg-transparent [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgba(0,0,0,0.2)_inset]! [&:-webkit-autofill]:[-webkit-text-fill-color:white]!"
                        id="add-collaborators-input"
                    />
                </section>
            </div>
        </motion.div>
    );
}

function AddCollaboratorsScreen({ setScreen, loading, setLoading }: AddCollaboratorsScreenProps) {
    const addCollabInputRef = useRef<HTMLInputElement>(null);
    const [email, setEmail] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [emails, setEmails] = useState<{ email: string; valid: boolean }[]>([]);
    const [permission, setPermission] = useState<string>('edit');
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const { quiz } = useNewQuizStore();
    const { session } = useUserSessionStore();

    useEffect(() => {
        if (addCollabInputRef.current) {
            addCollabInputRef.current.focus();
        }
    }, []);

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
        setLoading(true);
        await EmailAction.add_collaborator(
            session?.user.token,
            emails.map((e) => e.email),
            quiz?.id,
            note,
        );
        setLoading(false);
    }

    return (
        <motion.div
            key="add-collaborators"
            initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <section className='flex items-center justify-between px-0'>
                <div className="flex justify-start items-center gap-x-4 dark:text-white text-neutral-700">
                    <GoArrowLeft
                        onClick={() => setScreen(CollaboratorScreens.MAIN)}
                        className="size-7 p-1 hover:dark:bg-neutral-800 hover:bg-neutral-200 rounded transition-colors cursor-pointer"
                    />
                    <h1 className="text-base font-semibold mt-0.5 text-nowrap">Share design</h1>
                </div>
                <UserStack allowOnTap={false} className='mr-4' showAddButton={false} imageSize={30} />
            </section>
            <div className="mt-4">
                <Label className="pl-1 dark:text-white/70 text-neutral-600" htmlFor="add-collaborators-input">
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
                <section className="relative flex items-center mt-2 border border-neutral-300 dark:border-neutral-800 has-focus:border-indigo-600 overflow-visible rounded-lg dark:bg-black/20! transition-colors">
                    <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-white text-neutral-600 size-6" />
                    <Input
                        ref={addCollabInputRef}
                        value={email}
                        disabled={loading}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onEnter();
                            }
                        }}
                        placeholder="Add people to edit this quiz"
                        className="border-0 pl-11 py-5 dark:placeholder:text-white/70 placeholder:text-neutral-600 dark:text-white text-neutral-700 dark:bg-transparent bg-transparent [&:-webkit-autofill]:shadow-[0_0_0_1000px_rgba(0,0,0,0.2)_inset]! [&:-webkit-autofill]:[-webkit-text-fill-color:white]!"
                        id="add-collaborators-input"
                    />
                    {(email.length > 0 || emails.length > 0) && (
                        <>
                            <div className="border-r dark:border-neutral-700 border-neutral-300 pr-3">
                                <RxCross1
                                    strokeWidth={1}
                                    className="rounded-full bg-neutral-300 dark:bg-neutral-700 text-neutral-900 dark:text-white p-1 cursor-pointer"
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
                                    disabled={loading}
                                    className="flex items-center gap-x-2 px-3 py-2 text-sm capitalize dark:text-white text-neutral-700"
                                >
                                    {permission}
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </button>
                                {dropdownOpen && (
                                    <div className="absolute top-full right-0 mt-1 dark:bg-dark-base bg-white rounded-sm border dark:border-neutral-700 border-neutral-300 shadow-xl z-101 min-w-30 overflow-hidden">
                                        <button
                                            type="button"
                                            disabled={loading}
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
                                            disabled={loading}
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
                        disabled={loading}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Add a note (optional)"
                        className="rounded-lg dark:bg-black/20! bg-transparent border border-neutral-300 dark:border-neutral-800 focus-visible:ring-0 focus-visible:border-indigo-600 dark:placeholder:text-white/70 placeholder:text-neutral-600 dark:text-white text-neutral-700 transition-colors"
                    />
                </section>
                <hr className="my-2" />
                <section className="w-full">
                    <Button
                        onClick={addCollaborators}
                        disabled={!emails.some((email) => email.valid === true) || loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white tracking-wide text-base"
                    >
                        {loading ? 'Adding...' : 'Add Collaborators'}
                    </Button>
                </section>
            </div>
        </motion.div>
    );
}

function CollaboratorsSettingsScreen({ setScreen }: ScreenSettings) {
    const { collaborators } = useCollaboratorStore();
    const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
    const [permissions, setPermissions] = useState<Record<string, string>>({});

    useEffect(() => {
        const initialPermissions: Record<string, string> = {};
        collaborators.forEach((collaborator) => {
            initialPermissions[collaborator.user.email] = 'edit';
        });
        setPermissions(initialPermissions);
    }, [collaborators]);

    function handlePermissionChange(email: string, newPermission: string) {
        setPermissions((prev) => ({
            ...prev,
            [email]: newPermission,
        }));
        setOpenDropdownIndex(null);
    }

    return (
        <motion.div
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
            }}
            key="collaborators-settings"
            initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <section className='flex items-center justify-between'>
                <div className="flex justify-start items-center gap-x-4 dark:text-white text-neutral-700 cursor-pointer">
                    <GoArrowLeft
                        onClick={() => setScreen(CollaboratorScreens.MAIN)}
                        className="size-7 p-1 hover:dark:bg-neutral-800 hover:bg-neutral-200 rounded transition-colors"
                    />
                    <h1 className="text-base font-semibold mt-0.5">Collaborator settings</h1>
                </div>
                <div>
                    <TiUserAdd
                        onClick={() => setScreen(CollaboratorScreens.ADD_COLLABORATORS)}
                        className="size-7 p-1 hover:dark:bg-neutral-800 hover:bg-neutral-200 rounded transition-colors cursor-pointer"
                    />
                </div>
            </section>
            <section className='flex flex-col gap-y-1 items-start mt-4 w-full'>
                {collaborators.length > 0 && collaborators.map((collaborator, idx) => (
                    <section className='flex items-center justify-between w-full py-2' key={idx} >
                        <div className="flex items-center gap-x-3">
                            {collaborator.user.image && (<Image src={collaborator.user.image} alt={collaborator.user.email} width={32} height={32} className='rounded-full' />)}
                            <div className='flex flex-col'>
                                <span className='dark:text-white/90 text-neutral-900 text-sm'>{collaborator.user.name}</span>
                                <span className='dark:text-white/70 text-neutral-500 text-xs'>{collaborator.user.email}</span>
                            </div>
                        </div>
                        <div className='relative flex items-center'>
                            <Button
                                type="button"
                                onClick={() => setOpenDropdownIndex(openDropdownIndex === idx ? null : idx)}
                                className="flex items-center gap-x-2 px-3 py-2 text-sm capitalize dark:text-white text-neutral-700 bg-transparent hover:dark:bg-neutral-800 hover:bg-neutral-100 rounded transition-colors shadow-none"
                            >
                                {permissions[collaborator.user.email] || 'edit'}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                            <MdOutlineBlock className="size-7 p-1 hover:dark:bg-neutral-800 hover:bg-neutral-200 rounded transition-colors cursor-pointer text-neutral-800 dark:text-neutral-400" />
                            {openDropdownIndex === idx && (
                                <div className="absolute top-full right-0 mt-1 dark:bg-dark-base bg-white rounded-sm border dark:border-neutral-700 border-neutral-300 shadow-xl z-101 min-w-30 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => handlePermissionChange(collaborator.user.email, 'view')}
                                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm dark:hover:bg-neutral-800 hover:bg-neutral-100 dark:text-white text-dark-alpha transition-colors"
                                    >
                                        View
                                        {permissions[collaborator.user.email] === 'view' && <Check className="h-4 w-4" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handlePermissionChange(collaborator.user.email, 'edit')}
                                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm dark:hover:bg-neutral-800 hover:bg-neutral-100 dark:text-white text-dark-alpha transition-colors"
                                    >
                                        Edit
                                        {permissions[collaborator.user.email] === 'edit' && <Check className="h-4 w-4" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                ))}
            </section>
        </motion.div>
    );
}
