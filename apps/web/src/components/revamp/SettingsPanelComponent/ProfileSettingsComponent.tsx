'use client';

import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import Image from 'next/image';

const HARDCODED = {
    username: 'piyush-raj-ukichw',
    email: 'piyushraj26102004@gmail.com',
    createdAt: 'Jan 2024',
    currentTier: 'Pro',
    totalQuizzes: 128,
};

function SectionHeader({ children }: { children: React.ReactNode }) {
    return (
        <p className="text-xs font-semibold uppercase tracking-wider text-dark-base/35 dark:text-white/25">
            {children}
        </p>
    );
}

function Field({
    label,
    helperText,
    children,
}: {
    label: string;
    helperText?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-dark-base/50 dark:text-white/40">
                {label}
            </label>
            {children}
            {helperText && (
                <p className="text-xs text-dark-base/35 dark:text-white/25 leading-normal mt-0.5">
                    {helperText}
                </p>
            )}
        </div>
    );
}

function ReadonlyField({
    value,
    badge,
    prefix,
}: {
    value: string;
    badge?: string;
    prefix?: string;
}) {
    return (
        <div className="flex items-center h-9 w-full rounded-md px-3 gap-2 ring-1 ring-black/[0.07] dark:ring-white/[0.07] bg-neutral-50 dark:bg-white/3 text-sm">
            {prefix && (
                <span className="text-dark-base/25 dark:text-white/20 select-none shrink-0 text-sm">
                    {prefix}
                </span>
            )}
            <span className="font-medium text-dark-base dark:text-white/75 truncate flex-1">
                {value}
            </span>
            {badge && (
                <span className="shrink-0 text-xs font-semibold px-1.5 py-px rounded-sm bg-neutral-100 dark:bg-white/6 text-dark-base/40 dark:text-white/35">
                    {badge}
                </span>
            )}
        </div>
    );
}

function StatRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex items-center justify-between h-9">
            <span className="text-sm text-dark-base/45 dark:text-white/35">{label}</span>
            <span className="text-sm font-semibold text-dark-base/80 dark:text-white/70">
                {value}
            </span>
        </div>
    );
}

export function Divider() {
    return <div className="h-px bg-dark-base/10 dark:bg-light-base/10" />;
}

export default function ProfileSettingsComponent() {
    const { session } = useUserSessionStore();

    const avatarSrc = session?.user?.image ?? null;
    const displayName = session?.user?.name ?? 'Unknown User';
    const initials = displayName
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div
            className="w-full mx-auto py-6 flex flex-col gap-6 rounded-xl mt-1 custom-scrollbar ring-1 ring-black/10 dark:ring-white/10 bg-light-base dark:bg-[#0F0F0F]"
            data-lenis-prevent
        >
            <div className="flex flex-col px-8 -space-y-0.5">
                <h2 className="text-[17px] text-dark-base/80 dark:text-light-base/70 tracking-normal">
                    Profile Settings
                </h2>
                <p className="text-[13px] text-dark-base/60 dark:text-white/35 tracking-wide">
                    Manage your personal information and account details.
                </p>
            </div>

            <Divider />

            <div className="px-8 flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                    <SectionHeader>Avatar</SectionHeader>

                    <div className="flex items-center gap-4">
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
                            <p className="text-sm font-medium text-dark-base dark:text-white leading-tight truncate">
                                {displayName}
                            </p>
                            <p className="text-xs text-dark-base/40 dark:text-white/30 truncate">
                                {HARDCODED.email}
                            </p>
                        </div>

                        <button className="ml-auto shrink-0 h-8 px-3 rounded-md text-sm font-medium ring-1 ring-black/8 dark:ring-white/8 bg-white dark:bg-neutral-900 text-dark-base/60 dark:text-white/50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-100">
                            Upload
                        </button>
                    </div>
                </div>

                {/* <Divider /> */}

                <div className="flex flex-col gap-4">
                    <SectionHeader>Profile</SectionHeader>

                    <div className="flex flex-col gap-3">
                        <Field label="Full Name" helperText="Shown across the platform.">
                            <ReadonlyField value={displayName} />
                        </Field>

                        <Field label="Username" helperText="Used in your public profile URL.">
                            <ReadonlyField value={HARDCODED.username} prefix="nocturn.dev/" />
                        </Field>

                        <Field label="Email" helperText="Contact support to change your email.">
                            <ReadonlyField value={HARDCODED.email} badge="Primary" />
                        </Field>
                    </div>
                </div>

                <Divider />

                <div className="flex flex-col gap-4">
                    <SectionHeader>Account</SectionHeader>

                    <div className="flex flex-col divide-y divide-black/4 dark:divide-white/4">
                        <StatRow label="Member since" value={HARDCODED.createdAt} />
                        <StatRow label="Current plan" value={HARDCODED.currentTier} />
                        <StatRow label="Quizzes completed" value={HARDCODED.totalQuizzes} />
                    </div>
                </div>
            </div>
        </div>
    );
}
