'use client';
import Image from 'next/image';
import UtilityCard from './UtilityCard';
import LogoutModal from './LogoutModal';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { IoChevronDownSharp } from 'react-icons/io5';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SiGithub } from 'react-icons/si';
import { IoMdLogOut } from 'react-icons/io';
import { useHandleClickOutside } from '@/hooks/useHandleClickOutside';
import Link from 'next/link';

export default function ProfileMenu() {
    const { session, setOpenLogoutModal } = useUserSessionStore();
    const [dropdown, setDropdown] = useState<boolean>(false);
    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        right: 0,
    });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useHandleClickOutside([dropdownRef], setDropdown);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (dropdown && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 8, // 8px gap
                right: window.innerWidth - rect.right - window.scrollX,
            });
        }
    }, [dropdown]);

    function handler() {
        setOpenLogoutModal(true);
    }

    const dropdownContent =
        dropdown && mounted ? (
            <div
                ref={dropdownRef}
                className="fixed"
                style={{
                    top: `${dropdownPosition.top}px`,
                    right: `${dropdownPosition.right}px`,
                }}
            >
                <UtilityCard className="p-0 overflow-hidden bg-gamma dark:bg-dark-base dark:text-gamma text-dark-base shadow-lg w-48 rounded border border-neutral-300 dark:border-neutral-800">
                    <div>
                        <Link
                            href="https://github.com/celestium-x/triangulum-x/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.75 text-sm font-light flex justify-between"
                        >
                            Github
                            <SiGithub size={16} />
                        </Link>
                        <div
                            className="px-4 py-2.75 text-sm font-normal text-red-500 flex justify-between cursor-pointer"
                            onClick={handler}
                        >
                            Sign Out
                            <IoMdLogOut size={18} />
                        </div>
                    </div>
                </UtilityCard>
            </div>
        ) : null;

    return (
        <div className="relative" ref={triggerRef}>
            {session?.user.image && (
                <div
                    onClick={() => setDropdown(true)}
                    className="flex items-center justify-end gap-x-3 px-3 py-2 cursor-pointer dark:text-gamma text-dark-base"
                >
                    <Image
                        src={session?.user.image}
                        width={32}
                        height={32}
                        alt="user-logo"
                        className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all rounded-full"
                    />
                    <span className="font-normal text-nowrap">{session?.user.name}</span>
                    <IoChevronDownSharp />
                </div>
            )}
            {mounted && createPortal(dropdownContent, document.body)}
            <LogoutModal />
        </div>
    );
}
