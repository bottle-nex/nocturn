'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { MdOutlineFolderShared, MdOutlineHomeMax } from 'react-icons/md';
import { cn } from '@/lib/utils';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import Image from 'next/image';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';
import { SidebarTab } from '@/constants/SidebarTabConstants';
import { GoPeople } from 'react-icons/go';
import { PiTrashSimple } from 'react-icons/pi';
import { RiSettings6Line } from 'react-icons/ri';
import { FaRegHeart } from 'react-icons/fa6';
import { useDragQuizStore } from '@/store/home/useDragQuizStore';
import { RiVipCrownLine } from 'react-icons/ri';
import AppLogo from '../app/AppLogo';

export interface SidebarItem {
    id?: string;
    tab: SidebarTab;
    label: string;
    icon?: React.ReactNode;
    className?: string;
    onClick: () => void;
}

export default function HomeSidebar({ openTrash }: { openTrash: () => void }) {
    const { activeTab, setActiveTab } = useHomeSidebarStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { session } = useUserSessionStore();
    const { isDragging, isOverTrash, setOverTrash } = useDragQuizStore();

    const trashRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && Object.values(SidebarTab).includes(tab as SidebarTab)) {
            setActiveTab(tab as SidebarTab);
        }
    }, [searchParams, setActiveTab]);

    useEffect(() => {
        if (!isDragging) {
            setOverTrash(false);
            return;
        }

        function handlePointerMove(e: PointerEvent) {
            if (!trashRef.current) return;

            const rect = trashRef.current.getBoundingClientRect();

            const over =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            setOverTrash(over);
        }

        window.addEventListener('pointermove', handlePointerMove);
        return () => window.removeEventListener('pointermove', handlePointerMove);
    }, [isDragging, setOverTrash]);

    function handleTabChange(tab: SidebarTab) {
        const params = new URLSearchParams(window.location.search);
        params.set('tab', tab);

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newUrl);

        setActiveTab(tab);
    }

    const sidebarItems: SidebarItem[] = [
        {
            tab: SidebarTab.HOME,
            label: 'Home',
            icon: <MdOutlineHomeMax size={18} />,
            onClick: () => handleTabChange(SidebarTab.HOME),
        },
        {
            id: 'tour-my-quizzes',
            tab: SidebarTab.MY_QUIZZES,
            label: 'My Quizzes',
            icon: <GoPeople size={18} />,
            onClick: () => handleTabChange(SidebarTab.MY_QUIZZES),
        },
        {
            id: 'tour-shared-with-me',
            tab: SidebarTab.SHARED_WITH_ME,
            label: 'Shared with me',
            icon: <MdOutlineFolderShared size={18} />,
            onClick: () => handleTabChange(SidebarTab.SHARED_WITH_ME),
        },
        {
            id: 'tour-favourites',
            tab: SidebarTab.FAVORITES,
            label: 'Favorites',
            icon: <FaRegHeart size={17} />,
            onClick: () => handleTabChange(SidebarTab.FAVORITES),
        },
        {
            tab: SidebarTab.SETTINGS,
            label: 'Settings',
            icon: <RiSettings6Line size={18} />,
            onClick: () => handleTabChange(SidebarTab.SETTINGS),
        },
        {
            tab: SidebarTab.PREMIUM,
            label: 'Premium',
            icon: <RiVipCrownLine size={18} />,
            onClick: () => router.push('/premium'),
        },
    ];

    return (
        <aside
            className="w-72 h-full bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 overflow-hidden shrink-0 flex flex-col justify-between"
            data-lenis-prevent
        >
            <div>
                <div className="px-5 pt-5 pb-2">
                    <AppLogo size={110} withText textColor="dark:text-light-base text-dark-base" />
                </div>

                <nav className="mt-4 flex flex-col gap-y-6 px-3">
                    <div>
                        <span className="block px-3 text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                            Menu
                        </span>

                        <div className="flex flex-col gap-y-1 mt-2">
                            {sidebarItems.slice(0, 3).map((item) => (
                                <div
                                    id={item.id}
                                    key={item.tab}
                                    onClick={item.onClick}
                                    className={cn(
                                        'flex items-center gap-x-3 py-2 px-3 rounded-lg cursor-pointer transition-colors',
                                        activeTab === item.tab
                                            ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-900',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'shrink-0',
                                            activeTab !== item.tab && 'text-neutral-500 dark:text-neutral-400',
                                        )}
                                    >
                                        {item.icon}
                                    </span>
                                    <span
                                        className={cn(
                                            'text-sm text-nowrap',
                                            activeTab === item.tab
                                                ? 'font-medium'
                                                : 'text-black/80 dark:text-white/75',
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <span className="block px-3 text-[11px] font-semibold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase">
                            Utility
                        </span>

                        <div className="flex flex-col gap-y-1 mt-2">
                            {sidebarItems.slice(3, 5).map((item) => (
                                <div
                                    id={item.id}
                                    key={item.tab}
                                    onClick={item.onClick}
                                    className={cn(
                                        'flex items-center gap-x-3 py-2 px-3 rounded-lg cursor-pointer transition-colors',
                                        activeTab === item.tab
                                            ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                                            : 'hover:bg-neutral-100 dark:hover:bg-neutral-900',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'shrink-0',
                                            activeTab !== item.tab && 'text-neutral-500 dark:text-neutral-400',
                                        )}
                                    >
                                        {item.icon}
                                    </span>
                                    <span
                                        className={cn(
                                            'text-sm text-nowrap',
                                            activeTab === item.tab
                                                ? 'font-medium'
                                                : 'text-black/80 dark:text-white/75',
                                        )}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </nav>
            </div>

            <div className="px-3 pb-3">
                <div className="flex flex-col gap-y-1">
                    {sidebarItems.slice(5).map((item) => (
                        <div
                            id={item.id}
                            key={item.tab}
                            onClick={item.onClick}
                            className={cn(
                                'flex items-center gap-x-3 py-2 px-3 rounded-lg cursor-pointer transition-colors',
                                activeTab === item.tab
                                    ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-900',
                            )}
                        >
                            <span
                                className={cn(
                                    'shrink-0',
                                    activeTab !== item.tab && 'text-neutral-500 dark:text-neutral-400',
                                )}
                            >
                                {item.icon}
                            </span>
                            <span
                                className={cn(
                                    'text-sm',
                                    activeTab === item.tab
                                        ? 'font-medium'
                                        : 'text-black/80 dark:text-white/75',
                                )}
                            >
                                {item.label}
                            </span>
                        </div>
                    ))}

                    <div
                        id="tour-trash"
                        ref={trashRef}
                        onClick={openTrash}
                        className={cn(
                            'flex items-center gap-x-3 py-2 px-3 rounded-lg cursor-pointer transition-all duration-200',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-900',
                            isDragging &&
                                'ring-2 ring-red-500/50 ring-offset-2 dark:ring-offset-neutral-950',
                            isOverTrash &&
                                isDragging &&
                                'bg-red-500/20 dark:bg-red-500/30 scale-105 ring-red-600',
                        )}
                    >
                        <span
                            className={cn(
                                'shrink-0 text-neutral-500 dark:text-neutral-400 transition-colors',
                                isOverTrash && isDragging && 'text-red-600 dark:text-red-400',
                            )}
                        >
                            <PiTrashSimple size={18} />
                        </span>

                        <span
                            className={cn(
                                'text-sm text-black/80 dark:text-white/75 transition-colors',
                                isOverTrash &&
                                    isDragging &&
                                    'text-red-600 dark:text-red-400 font-semibold',
                            )}
                        >
                            {isOverTrash && isDragging ? 'Drop here' : 'Trash'}
                        </span>
                    </div>
                </div>

                {session?.user.email && (
                    <div className="flex items-center gap-x-3 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 px-3">
                        <Image
                            src={session.user.image}
                            width={28}
                            height={28}
                            alt="user-logo"
                            className="rounded-full"
                        />
                        <span className="text-sm font-medium text-black/90 dark:text-white/90 truncate">
                            {session.user.name}
                        </span>
                    </div>
                )}
            </div>
        </aside>
    );
}
