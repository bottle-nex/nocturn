'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { MdOutlineFolderShared } from 'react-icons/md';
import { cn } from '@/lib/utils';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import Image from 'next/image';
import { useHomeSidebarStore } from '@/store/home/useHomeSidebarStore';
import { SidebarTab } from '@/constants/SidebarTabConstants';
import { GoHome, GoPeople } from 'react-icons/go';
import { PiTrashSimple } from 'react-icons/pi';
import { RiSettings6Line } from 'react-icons/ri';
import { FaRegHeart } from 'react-icons/fa6';
import { useDragQuizStore } from '@/store/home/useDragQuizStore';
import { RiVipCrownLine } from 'react-icons/ri';
import AppLogo from '../app/AppLogo';
import { audio } from './LandingFooter';

export interface SidebarItem {
    id?: string;
    tab: SidebarTab;
    label: string;
    icon?: React.ReactNode;
    className?: string;
    onClick: () => void;
}

const ITEM_BASE =
    'group relative flex w-full items-center gap-x-3 rounded-lg px-3 py-2 text-sm cursor-pointer outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-neutral-300 dark:focus-visible:ring-neutral-700';

function SidebarLabel({ children }: { children: React.ReactNode }) {
    return (
        <span className="block px-3 pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400 dark:text-neutral-500">
            {children}
        </span>
    );
}

function SidebarNavItem({ item, active }: { item: SidebarItem; active: boolean }) {
    return (
        <div
            id={item.id}
            role="button"
            tabIndex={0}
            aria-current={active ? 'page' : undefined}
            onClick={item.onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    item.onClick();
                }
            }}
            className={cn(
                ITEM_BASE,
                active
                    ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50'
                    : 'text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900/60 dark:hover:text-neutral-100',
                item.className,
            )}
        >
            <span
                className={cn(
                    'absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-neutral-900 transition-opacity duration-200 dark:bg-neutral-100',
                    active ? 'opacity-100' : 'opacity-0',
                )}
            />
            <span className="flex size-5 shrink-0 items-center justify-center">{item.icon}</span>
            <span className="truncate font-medium">{item.label}</span>
        </div>
    );
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

    const workspaceItems: SidebarItem[] = [
        {
            tab: SidebarTab.HOME,
            label: 'Home',
            icon: <GoHome size={18} />,
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
    ];

    const libraryItems: SidebarItem[] = [
        {
            id: 'tour-favourites',
            tab: SidebarTab.FAVORITES,
            label: 'Favorites',
            icon: <FaRegHeart size={16} />,
            onClick: () => handleTabChange(SidebarTab.FAVORITES),
        },
        {
            tab: SidebarTab.SETTINGS,
            label: 'Settings',
            icon: <RiSettings6Line size={18} />,
            onClick: () => handleTabChange(SidebarTab.SETTINGS),
        },
    ];

    const premiumItem: SidebarItem = {
        tab: SidebarTab.PREMIUM,
        label: 'Premium',
        icon: <RiVipCrownLine size={18} />,
        onClick: () => router.push('/premium'),
    };

    return (
        <aside
            className="flex h-full w-64 shrink-0 flex-col border-r border-neutral-200/70 bg-white dark:border-neutral-800/60 dark:bg-neutral-950"
            data-lenis-prevent
        >
            <div className="flex h-16 items-center gap-x-2.5 px-4">
                <AppLogo size={32} />
                <span
                    className={cn(
                        'text-[15px] font-semibold tracking-wide text-neutral-900 dark:text-neutral-50',
                        audio.className,
                    )}
                >
                    Nocturn
                </span>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-2 custom-scrollbar">
                <section>
                    <SidebarLabel>Workspace</SidebarLabel>
                    <div className="flex flex-col gap-y-0.5">
                        {workspaceItems.map((item) => (
                            <SidebarNavItem
                                key={item.tab}
                                item={item}
                                active={activeTab === item.tab}
                            />
                        ))}
                    </div>
                </section>

                <section>
                    <SidebarLabel>Library</SidebarLabel>
                    <div className="flex flex-col gap-y-0.5">
                        {libraryItems.map((item) => (
                            <SidebarNavItem
                                key={item.tab}
                                item={item}
                                active={activeTab === item.tab}
                            />
                        ))}
                    </div>
                </section>
            </nav>

            <div className="flex flex-col gap-y-0.5 px-3 pb-2">
                <SidebarNavItem item={premiumItem} active={activeTab === premiumItem.tab} />

                <div
                    id="tour-trash"
                    ref={trashRef}
                    role="button"
                    tabIndex={0}
                    onClick={openTrash}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openTrash();
                        }
                    }}
                    className={cn(
                        ITEM_BASE,
                        'text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900/60 dark:hover:text-neutral-100',
                        isDragging && 'border border-dashed border-red-400/60',
                        isOverTrash &&
                            isDragging &&
                            'border-red-500 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
                    )}
                >
                    <span className="flex size-5 shrink-0 items-center justify-center">
                        <PiTrashSimple size={18} />
                    </span>
                    <span className="truncate font-medium">
                        {isOverTrash && isDragging ? 'Drop to delete' : 'Trash'}
                    </span>
                </div>
            </div>

            {session?.user.email && (
                <div className="border-t border-neutral-200/70 px-3 py-3 dark:border-neutral-800/60">
                    <div className="flex items-center gap-x-3 rounded-lg px-2 py-1.5">
                        <Image
                            src={session.user.image}
                            width={32}
                            height={32}
                            alt="user-logo"
                            className="size-8 shrink-0 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-800"
                        />
                        <div className="flex min-w-0 flex-col leading-tight">
                            <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {session.user.name}
                            </span>
                            <span className="truncate text-xs text-neutral-500 dark:text-neutral-500">
                                {session.user.email}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
