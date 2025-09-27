import ToolTipComponent from '@/components/utility/TooltipComponent';
import { cn } from '@/lib/utils';
import { USER_TYPE } from '@/types/prisma-types';
import { CheckIcon, CopyIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface JoinQuizCodeTickerProps {
    spectatorCode?: string;
    participantCode?: string;
    link?: string;
    user?: USER_TYPE[];
    position?: 'r' | 'l' | 't' | 'b' | 'tr' | 'tl' | 'br' | 'bl' | 'center';
    copyCode?: string;
}

export default function JoinQuizCodeTicker({
    spectatorCode,
    participantCode,
    link,
    user,
    position = 't',
    copyCode,
}: JoinQuizCodeTickerProps) {
    const [copiedSpectator, setCopiedSpectator] = useState<boolean>(false);
    const [copiedParticipant, setCopiedParticipant] = useState<boolean>(false);
    const [copiedLink, setCopiedLink] = useState<boolean>(false);

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

    function copySpectatorCodeHandler() {
        if (spectatorCode) {
            navigator.clipboard.writeText(addHyphen(spectatorCode));
            setCopiedSpectator(true);
        }
    }

    function copyParticipantCodeHandler() {
        if (participantCode) {
            navigator.clipboard.writeText(addHyphen(participantCode));
            setCopiedParticipant(true);
        }
    }

    function copyLinkHandler() {
        if (!link) return;
        navigator.clipboard.writeText(link);
        setCopiedLink(true);
    }

    function getPosition(): string {
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
    }

    function addHyphen(str: string): string {
        return str.match(/.{1,3}/g)?.join('-') ?? str;
    }

    return (
        <div
            className={cn(
                'bg-neutral-200 px-3 py-1.5 rounded-md font-light z-50 w-fit',
                'flex items-center justify-center gap-x-2 cursor-pointer',
                'whitespace-nowrap text-center',
                'absolute',
                getPosition(),
            )}
        >
            <span className="text-sm text-dark-base">Spectators | Use code</span>
            <ToolTipComponent
                content={`The code lets your audience join the presentation and expires in 2 days`}
            >
                <div
                    onClick={copySpectatorCodeHandler}
                    className="bg-dark-base text-light-base py-0.5 px-2 rounded-sm tracking-widest flex items-center justify-center gap-x-1 group"
                >
                    {!copiedSpectator ? (
                        <CopyIcon
                            className="max-w-0 group-hover:max-w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden"
                            size={12}
                        />
                    ) : (
                        <CheckIcon
                            className="max-w-0 group-hover:max-w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden"
                            size={12}
                        />
                    )}
                    <span>{spectatorCode ? `${addHyphen(spectatorCode)}` : 'Click to Copy'}</span>
                </div>
            </ToolTipComponent>
            
            {link && (
                <>
                    <span className="text-sm text-dark-base">or copy this </span>
                    <ToolTipComponent content="Share this link with your spectators">
                        <div
                            onClick={copyLinkHandler}
                            className="bg-dark-base text-light-base py-0.5 px-2 rounded-sm tracking-widest flex items-center justify-center gap-x-1 group"
                        >
                            {!copiedLink ? (
                                <CopyIcon
                                    className="max-w-0 group-hover:max-w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden"
                                    size={12}
                                />
                            ) : (
                                <CheckIcon
                                    className="max-w-0 group-hover:max-w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden"
                                    size={12}
                                />
                            )}
                            <span>link</span>
                        </div>
                    </ToolTipComponent>
                </>
            )}
            
            <span className="text-sm text-dark-base"> | Participants code</span>
            <ToolTipComponent
                content={`The code lets your participants join the quiz and expires in 2 days`}
            >
                <div
                    onClick={copyParticipantCodeHandler}
                    className="bg-dark-base text-light-base py-0.5 px-2 rounded-sm tracking-widest flex items-center justify-center gap-x-1 group"
                >
                    {!copiedParticipant ? (
                        <CopyIcon
                            className="max-w-0 group-hover:max-w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden"
                            size={12}
                        />
                    ) : (
                        <CheckIcon
                            className="max-w-0 group-hover:max-w-3 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden"
                            size={12}
                        />
                    )}
                    <span>code</span>
                </div>
            </ToolTipComponent>
        </div>
    );
}