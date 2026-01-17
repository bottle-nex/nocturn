import { cn } from '@/lib/utils';
import { useState } from 'react';
import { GoPlus } from 'react-icons/go';
import AddCollaborators from '../utility/AddCollaborators';
import Image from 'next/image';

const people = [
    {
        id: 1,
        name: 'John Doe',
        image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80',
    },
    {
        id: 2,
        name: 'Robert Johnson',
        image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
    },
    {
        id: 3,
        name: 'Jane Smith',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60',
    },
    {
        id: 4,
        name: 'Emily Davis',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
    },
    {
        id: 5,
        name: 'Tyler Durden',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80',
    },
    {
        id: 6,
        name: 'Dora',
        image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3534&q=80',
    },
];

export default function UserStack() {
    const [openAddCollaborators, setOpenAddCollaborators] = useState<boolean>(false);
    return (
        <div className="flex flex-row items-center justify-center w-full z-20">
            {people.map((item, idx) => (
                <div
                    className="relative -mr-4"
                    style={{ zIndex: people.length - idx }}
                    key={item.id}
                >
                    <Image
                        height={80}
                        width={80}
                        src={item.image}
                        alt={item.name}
                        className="relative m-0! h-10 w-10 rounded-full object-cover object-top p-0! border border-neutral-400 dark:border-neutral-700"
                    />
                </div>
            ))}
            <div
                className="relative z-0 cursor-pointer"
                onClick={() => setOpenAddCollaborators(true)}
            >
                <GoPlus
                    className={cn(
                        'h-10 w-10 p-2 rounded-full',
                        'dark:bg-neutral-600 bg-neutral-300 hover:dark:bg-neutral-700 hover:bg-neutral-400/70 dark:text-neutral-100 transition-colors duration-150',
                    )}
                />
                <AddCollaborators open={openAddCollaborators} setOpen={setOpenAddCollaborators} />
            </div>
        </div>
    );
}
