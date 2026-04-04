'use client';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import Image from 'next/image';
import SettingsHeaderComponent from './SettingsUtility/SettingsHeaderComponent';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LogoutModal from '@/components/utility/LogoutModal';

export function Divider() {
    return <div className="h-px bg-dark-base/10 dark:bg-light-base/10" />;
}

export default function ProfileSettingsComponent() {
    const { session, setOpenLogoutModal } = useUserSessionStore();

    const avatarSrc = session?.user?.image ?? null;
    const displayName = session?.user?.name ?? 'Unknown User';
    const initials = displayName
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <>
            <div
                className="w-full mx-auto py-6 flex flex-col gap-6 rounded-xl mt-1 custom-scrollbar ring-1 ring-black/10 dark:ring-white/10 bg-light-base dark:bg-[#0F0F0F]"
                data-lenis-prevent
            >
                <SettingsHeaderComponent
                    title="Profile Settings"
                    description="Manage your personal information and account details."
                />

                <Divider />

                <div className="px-8 flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-dark-base/35 dark:text-white/25">
                            Avatar
                        </p>
                        <div className="flex items-center justify-between gap-4">
                            <div className='flex items-center gap-4 '>
                                <div className="relative shrink-0 h-10 w-10 rounded-full overflow-hidden ring-1 ring-black/8 dark:ring-white/8 bg-neutral-100 dark:bg-neutral-800">
                                    {avatarSrc ? (
                                        <Image
                                            src={avatarSrc}
                                            alt={displayName}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs font-semibold text-dark-base/45 dark:text-white/35 select-none">
                                            {initials}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <p className="text-sm font-medium text-dark-base dark:text-white truncate">
                                        {displayName}
                                    </p>
                                    <p className="text-xs text-dark-base/40 dark:text-white/30 truncate">
                                        {session?.user.email}
                                    </p>
                                </div>
                            </div>
                            <Button
                                size={"sm"}
                                className={cn(
                                    'dark:bg-red-500/40 bg-red-500/70 hover:bg-red-500/70 border border-red-500/80 dark:border-red-500/60 text-white ',
                                )}
                                onClick={() => setOpenLogoutModal(true)}
                            >
                                Logout
                            </Button>
                            {/* TODO: add upload feature */}
                            {/* <Button
                                className={cn(
                                    'ml-auto shrink-0 h-8 px-3 rounded-md text-sm font-medium',
                                    'ring-1 ring-black/8 dark:ring-white/8',
                                    'bg-white dark:bg-neutral-900',
                                    'text-dark-base/60 dark:text-white/50',
                                    'hover:bg-neutral-50 dark:hover:bg-neutral-800/70',
                                    'transition-colors duration-100 cursor-pointer',
                                )}
                            >
                                Upload
                            </Button> */}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-dark-base/35 dark:text-white/25">
                            Profile
                        </p>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-dark-base/50 dark:text-white/40">
                                    Full Name
                                </label>
                                <div className="flex items-center h-9 w-full rounded-md px-3 ring-1 ring-black/[0.07] dark:ring-white/[0.07] bg-neutral-50 dark:bg-white/3 text-sm">
                                    <span className="font-medium text-dark-base dark:text-white/75 truncate flex-1">
                                        {displayName}
                                    </span>
                                </div>
                                <p className="text-xs text-dark-base/35 dark:text-white/25 leading-normal mt-0.5">
                                    Shown across the platform.
                                </p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-dark-base/50 dark:text-white/40">
                                    Email
                                </label>
                                <div className="flex items-center h-9 w-full rounded-md px-3 gap-2 ring-1 ring-black/[0.07] dark:ring-white/[0.07] bg-neutral-50 dark:bg-white/3 text-sm">
                                    <span className="font-medium text-dark-base dark:text-white/75 truncate flex-1">
                                        {session?.user.email}
                                    </span>
                                    <span className="shrink-0 text-xs font-semibold px-1.5 py-px rounded-sm bg-neutral-100 dark:bg-white/6 text-dark-base/40 dark:text-white/35">
                                        Primary
                                    </span>
                                </div>
                                <p className="text-xs text-dark-base/35 dark:text-white/25 leading-normal mt-0.5">
                                    Contact support to change your email.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <LogoutModal />
            </div>
        </>
    );
}
