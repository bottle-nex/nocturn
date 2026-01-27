import { cn } from '@/lib/utils';
import { GoPlus } from 'react-icons/go';
import { useState, useRef } from 'react';
import { useCollaboratorStore } from '@/store/new-quiz/useCollaboratorStore';
import Image from 'next/image';
import AddCollaborators from '../utility/AddCollaborators';
import ToolTipComponent from '../utility/TooltipComponent';

export enum CollaboratorScreens {
    COLLABORATORS_SETTINGS = 'COLLABORATORS_SETTINGS',
    ADD_COLLABORATORS = 'ADD_COLLABORATORS',
    MAIN = 'MAIN',
}

interface UserStackProps {
    showAddButton?: boolean;
    allowOnTap?: boolean;
    imageSize?: number;
    className?: string;
}


export default function UserStack({ className, showAddButton = true, imageSize = 40, allowOnTap = true }: UserStackProps) {
    const [openAddCollaborators, setOpenAddCollaborators] = useState<boolean>(false);
    const [screen, setScreen] = useState<CollaboratorScreens>(CollaboratorScreens.MAIN);
    const { collaborators } = useCollaboratorStore();
    const triggerRef = useRef<HTMLDivElement>(null);

    function handleUserTap() {
        if (!allowOnTap) return;
        setOpenAddCollaborators(true);
        setScreen(CollaboratorScreens.COLLABORATORS_SETTINGS);
    }

    return (
        <div className={cn("flex flex-row items-center justify-center z-20", className)}>
            {collaborators.map((item, idx) => (
                <ToolTipComponent content={item.user.name} key={item.id}>
                    <div
                        className="relative -mr-4"
                        style={{ zIndex: collaborators.length - idx }}
                        onClick={handleUserTap}
                    >
                        <Image
                            height={imageSize}
                            width={imageSize}
                            src={item.user.image!}
                            alt={item.user.name}
                            className="relative m-0! rounded-full object-cover object-top p-0! border border-neutral-400 dark:border-neutral-700 cursor-pointer"
                        />
                    </div>
                </ToolTipComponent>
            ))}
            <div
                ref={triggerRef}
                className="relative z-0 cursor-pointer"
                onClick={() => {
                    setOpenAddCollaborators(true);
                    setScreen(CollaboratorScreens.MAIN);
                }}
            >
                <ToolTipComponent content="add collaborators to build your quiz together">
                    {showAddButton && (
                        <GoPlus
                            className={cn(
                                'h-10 w-10 p-2 rounded-full',
                                'bg-neutral-200 dark:bg-dark-base hover:dark:bg-neutral-800 hover:bg-neutral-300/70 dark:text-neutral-100 transition-colors duration-150',
                            )}
                        />
                    )}
                </ToolTipComponent>
                <AddCollaborators
                    open={openAddCollaborators}
                    setOpen={setOpenAddCollaborators}
                    triggerRef={triggerRef}
                    screen={screen}
                    setScreen={setScreen}
                />
            </div>
        </div>
    );
}
