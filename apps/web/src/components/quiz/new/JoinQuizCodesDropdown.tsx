'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa6';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { cn } from '@/lib/utils';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useHandleClickOutside } from '@/hooks/useHandleClickOutside';

interface JoinQuizCodesDropdownProps {
    spectatorCode?: string;
    participantCode?: string;
    link?: string;
    position?: 'r' | 'l' | 't' | 'b' | 'tr' | 'tl' | 'br' | 'bl' | 'center';
}

export default function JoinQuizCodesDropdown({
    spectatorCode,
    participantCode,
    link,
    position = 't',
}: JoinQuizCodesDropdownProps) {
    const [open, setOpen] = useState(false);
    const [copiedSpectator, setCopiedSpectator] = useState<boolean>(false);
    const [copiedParticipant, setCopiedParticipant] = useState<boolean>(false);
    const [copiedLink, setCopiedLink] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useHandleClickOutside([containerRef], () => setOpen(false));

    function addHyphen(str: string): string {
        return str.match(/.{1,3}/g)?.join('-') ?? str;
    }

    useEffect(() => {
        if (copiedSpectator) {
            const timeout = setTimeout(() => {
                setCopiedSpectator(false);
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [copiedSpectator]);

    useEffect(() => {
        if (copiedParticipant) {
            const timeout = setTimeout(() => {
                setCopiedParticipant(false);
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [copiedParticipant]);

    useEffect(() => {
        if (copiedLink) {
            const timeout = setTimeout(() => {
                setCopiedLink(false);
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [copiedLink]);

    const getPosition = (): string => {
        switch (position) {
            case 'r':
                return 'right-2 top-1/2 -translate-y-1/2';
            case 'l':
                return 'left-2 top-1/2 -translate-y-1/2';
            case 't':
                return 'top-2 left-1/2 -translate-x-1/2';
            case 'b':
                return 'bottom-2 left-1/2 -translate-x-1/2';
            case 'tr':
                return 'top-2 right-2';
            case 'tl':
                return 'top-2 left-2';
            case 'br':
                return 'bottom-2 right-2';
            case 'bl':
                return 'bottom-2 left-2';
            case 'center':
                return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
            default:
                return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
        }
    };

    function copyToClipboard(
        type: 'PATRICIPANT_CODE' | 'SPECTATOR_CODE' | 'SPECTATOR_LINK',
        text?: string,
    ) {
        if (!text) return;
        navigator.clipboard.writeText(text);
        switch (type) {
            case 'PATRICIPANT_CODE':
                setCopiedParticipant(true);
                break;
            case 'SPECTATOR_CODE':
                setCopiedSpectator(true);
                break;
            case 'SPECTATOR_LINK':
                setCopiedLink(true);
                break;
        }
        setTimeout(() => {
            setOpen(false);
            setCopiedSpectator(false);
            setCopiedParticipant(false);
            setCopiedLink(false);
        }, 1000);
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                'absolute z-50 px-3 py-1.5 rounded-md bg-neutral-200 font-light',
                'flex items-center justify-center gap-x-2 cursor-pointer whitespace-nowrap text-center',
                getPosition(),
            )}
        >
            <div className="relative">
                <div className="flex items-center gap-x-2">
                    <span className="text-dark-base">Audience and Participant Access</span>
                    <ToolTipComponent
                        side="right"
                        content="The code lets your audience join the presentation and expires in 2 days"
                    >
                        <div
                            onClick={() => setOpen(!open)}
                            className="bg-dark-base text-light-base py-0.5 px-2 rounded-sm tracking-widest flex items-center justify-center gap-x-1 group"
                        >
                            <span>codes</span>
                            <FaChevronDown
                                className={cn(
                                    'transition-transform duration-300',
                                    open ? 'rotate-180' : 'rotate-0',
                                )}
                                size={12}
                            />
                        </div>
                    </ToolTipComponent>
                </div>

                {/* Dropdown */}
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[16rem] bg-white rounded-md shadow-lg overflow-hidden flex flex-col text-sm z-50"
                        >
                            {spectatorCode && (
                                <ToolTipComponent
                                    side="right"
                                    content="Enter this code on the quiz page to join as a spectator. Valid for 2 days."
                                >
                                    <div
                                        className="px-4 py-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer text-dark-base group"
                                        onClick={() =>
                                            copyToClipboard('SPECTATOR_CODE', spectatorCode)
                                        }
                                    >
                                        <span>Audience Join Code</span>
                                        <div className="bg-dark-base text-light-base py-0.5 px-2 rounded-sm tracking-widest flex items-center justify-center gap-x-1">
                                            {!copiedSpectator ? (
                                                <CopyIcon
                                                    className="max-w-0 group-hover:max-w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden"
                                                    size={12}
                                                />
                                            ) : (
                                                <CheckIcon
                                                    className="max-w-0 group-hover:max-w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden text-green-500"
                                                    size={12}
                                                />
                                            )}
                                            <span>{spectatorCode}</span>
                                        </div>
                                    </div>
                                </ToolTipComponent>
                            )}

                            {link && (
                                <ToolTipComponent
                                    side="right"
                                    content="A direct URL that allows spectators to view the quiz. Expires in 2 days."
                                >
                                    <div
                                        className="w-full px-4 py-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer text-dark-base group"
                                        onClick={() => copyToClipboard('SPECTATOR_LINK', link)}
                                    >
                                        <span>Audience Join Link</span>
                                        <div
                                            // onClick={copyLinkHandler}
                                            className="bg-dark-base text-light-base py-0.5 px-2 rounded-sm tracking-widest flex items-center justify-center gap-x-1 group"
                                        >
                                            {!copiedLink ? (
                                                <CopyIcon
                                                    className="max-w-0 group-hover:max-w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden"
                                                    size={12}
                                                />
                                            ) : (
                                                <CheckIcon
                                                    className="max-w-0 group-hover:max-w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden text-green-500"
                                                    size={12}
                                                />
                                            )}
                                            <span>link</span>
                                        </div>
                                    </div>
                                </ToolTipComponent>
                            )}

                            {participantCode && (
                                <ToolTipComponent
                                    side="right"
                                    content="Use this code to join as a participant and submit answers. Expires in 2 days."
                                >
                                    <div
                                        className="px-4 py-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer text-dark-base group"
                                        onClick={() =>
                                            copyToClipboard('PATRICIPANT_CODE', participantCode)
                                        }
                                    >
                                        <span>Participant Join Code</span>
                                        <div className="bg-dark-base text-light-base py-0.5 px-2 rounded-sm tracking-widest flex items-center justify-center gap-x-1">
                                            {!copiedParticipant ? (
                                                <CopyIcon
                                                    className="max-w-0 group-hover:max-w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden"
                                                    size={12}
                                                />
                                            ) : (
                                                <CheckIcon
                                                    className="max-w-0 group-hover:max-w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden text-green-500"
                                                    size={12}
                                                />
                                            )}
                                            <span>code</span>
                                        </div>
                                    </div>
                                </ToolTipComponent>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
