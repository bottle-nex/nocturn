'use client';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { Circle } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import UtilityCard from './UtilityCard';
import { TbSettings2 } from 'react-icons/tb';
import { SiGithub } from 'react-icons/si';
import { IoMdLogOut } from 'react-icons/io';
import { useHandleClickOutside } from '@/hooks/useHandleClickOutside';
import LogoutModal from './LogoutModal';

export default function ProfileMenu() {
    const { session } = useUserSessionStore();
    const [dropdown, setDropdown] = useState<boolean>(false);
    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        right: 0,
    });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useHandleClickOutside([dropdownRef], setDropdown);
    const [openLogoutModal, setOpenLogoutModal] = useState<boolean>(false);

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
                className="fixed z-[99999]"
                style={{
                    top: `${dropdownPosition.top}px`,
                    right: `${dropdownPosition.right}px`,
                }}
            >
                <UtilityCard className="p-0 w-[10rem] overflow-hidden bg-white dark:bg-[#141414] border border-neutral-300 dark:border-neutral-700 shadow-lg">
                    <div>
                        <div className="px-4 py-[11px] text-xs font-normal text-dark-base dark:text-light-base border-b-[1px] border-neutral-300 dark:border-neutral-700 cursor-default">
                            My Profile
                        </div>
                        <div className="px-4 py-[11px] text-xs font-light text-dark-base dark:hover:bg-dark-primary/40 hover:bg-gray-200 dark:text-light-base">
                            Docs
                        </div>
                        <div className="px-4 py-[11px] text-xs font-light text-dark-base dark:hover:bg-dark-primary/40 hover:bg-gray-200 dark:text-light-base">
                            Accounts Info
                        </div>
                        <div className="px-4 py-[11px] text-xs font-light text-dark-base dark:hover:bg-dark-primary/40 hover:bg-gray-200 dark:text-light-base border-b-[1px] border-neutral-300 dark:border-neutral-700 flex justify-between">
                            Settings
                            <TbSettings2 size={14} />
                        </div>
                        <a
                            href="https://github.com/celestium-x/triangulum-x/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-[11px] text-xs font-light text-dark-base dark:hover:bg-dark-primary/40 hover:bg-gray-200 dark:text-neutral-100 border-b-[1px] border-neutral-300 dark:border-neutral-700 flex justify-between"
                        >
                            Github
                            <SiGithub />
                        </a>
                        <div
                            className="px-4 py-[11px] text-xs font-normal text-red-500 dark:hover:bg-dark-primary/40 hover:bg-gray-200 flex justify-between cursor-pointer"
                            onClick={handler}
                        >
                            Sign Out
                            <IoMdLogOut size={14} />
                        </div>
                    </div>
                </UtilityCard>
            </div>
        ) : null;

    return (
        <div className="relative" ref={triggerRef}>
            {session?.user.image && (
                <>
                    <Image
                        onClick={() => setDropdown(true)}
                        src={session?.user.image}
                        width={32}
                        height={32}
                        alt="user-logo"
                        className="rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                    />
                    <Circle className="absolute -bottom-0 -right-0 w-2 h-2 fill-green-500 text-green-500 bg-white dark:bg-dark-base rounded-full" />
                </>
            )}
            {mounted && createPortal(dropdownContent, document.body)}
            <LogoutModal />
        </div>
    );
}
