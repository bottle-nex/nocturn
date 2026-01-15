import UtilityCard from "./UtilityCard";
import { Dispatch, JSX, SetStateAction, useRef, useState } from "react";
import { useHandleClickOutside } from "@/hooks/useHandleClickOutside";
import { GoArrowLeft } from "react-icons/go";
import { PiMagnifyingGlass } from "react-icons/pi";
import { IoIosSettings } from "react-icons/io";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { motion, AnimatePresence } from 'motion/react';

interface AddCollaboratorsProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

interface ScreenSettings {
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
    useHandleClickOutside([addCollaboratorsRef], () => setOpen(false));
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
        <UtilityCard ref={addCollaboratorsRef} className="w-100 py-5 absolute top-full right-0 translate-y-2 dark:bg-dark-base bg-neutral-100 rounded-sm dark:border-neutral-800/40! border-neutral-300/40 overflow-hidden">
            <AnimatePresence mode="wait">
                {renderScreens()}
            </AnimatePresence>
        </UtilityCard>
    )
}

function MainCollaboratorsScreen({ setScreen }: ScreenSettings) {
    return (
        <motion.div
            key="main"
            initial={{ opacity: 0, x: -32, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <div className="flex justify-between items-center dark:text-light-alpha/90 text-dark-alpha/90">
                <h1 className="text-lg font-semibold">Add Collaborators</h1>
                <IoIosSettings onClick={() => setScreen(CollaboratorScreens.COLLABORATORS_SETTINGS)} className="size-6" />
            </div>
            <div className="mt-4">
                <Label className="pl-1" htmlFor="add-collaborators-input">People with access to</Label>
                <div className="relative mt-2">
                    <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-light-alpha/90 text-dark-alpha/90 size-6" />
                    <Input onFocus={() => setScreen(CollaboratorScreens.ADD_COLLABORATORS)} placeholder="Add people to edit this quiz" className="rounded-[8px] dark:bg-black/20! bg-white/80 py-5 pl-11" id="add-collaborators-input" />
                </div>
            </div>
        </motion.div>
    )
}

function AddCollaboratorsScreen({ setScreen }: ScreenSettings) {
    return (
        <motion.div
            key="add-collaborators"
            initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <div className="flex justify-start items-center gap-x-4 dark:text-light-alpha/90 text-dark-alpha/90">
                <GoArrowLeft onClick={() => setScreen(CollaboratorScreens.MAIN)} className="size-7 p-1 hover:dark:bg-neutral-800 rounded transition-colors" />
                <h1 className="text-base font-semibold mt-0.5">Share design</h1>
            </div>
            <div className="mt-4">
                <Label className="pl-1" htmlFor="add-collaborators-input">People with access to</Label>
                <div className="relative mt-2">
                    <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-light-alpha/90 text-dark-alpha/90 size-6" />
                    <Input placeholder="Add people to edit this quiz" className="rounded-[8px] dark:bg-black/20! bg-white/80 py-5 pl-11" id="add-collaborators-input" />
                </div>
            </div>
        </motion.div>
    )
}

function CollaboratorsSettingsScreen({ setScreen }: ScreenSettings) {
    return (
        <motion.div
            key="collaborators-settings"
            initial={{ opacity: 0, x: 30, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <div className="flex justify-start items-center gap-x-4 dark:text-light-alpha/90 text-dark-alpha/90">
                <GoArrowLeft onClick={() => setScreen(CollaboratorScreens.MAIN)} className="size-7 p-1 hover:dark:bg-neutral-800 rounded transition-colors" />
                <h1 className="text-base font-semibold mt-0.5">Collaborator settings</h1>
            </div>
        </motion.div>
    )
}


