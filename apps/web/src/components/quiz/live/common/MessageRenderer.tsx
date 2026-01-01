import MessageBubble from '@/components/ui/MessageBubble';
import { cn } from '@/lib/utils';
import { InteractionEnum } from '@nocturn/types';
import { ChatMessageType, ChatReactionType } from '@nocturn/types';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function MessagesRenderer({
    messages,
    id,
    onSendReaction,
    onDoubleClick,
    highlight,
}: {
    messages: ChatMessageType[];
    id: string;
    onSendReaction: (chatMessageId: string, reaction: InteractionEnum) => void;
    onDoubleClick: (message: ChatMessageType) => void;
    highlight: ChatMessageType | null;
}) {
    const [hoverMessage, setHoverMessage] = useState<string>('');
    const [activeReactionMessage, setActiveReactionMessage] = useState<string | null>(null);
    const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

    const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages]);

    const messageMap = useMemo(() => {
        return new Map(messages.map((m) => [m.id, m]));
    }, [messages]);

    const handleToggleReaction = (messageId: string) => {
        setActiveReactionMessage((prev) => (prev === messageId ? null : messageId));
    };

    const groupReactionsByType = (messageReactions: ChatReactionType[]) => {
        const grouped: Partial<Record<InteractionEnum, { reactors: string[] }>> = {};
        messageReactions.forEach((reaction) => {
            if (!grouped[reaction.reaction]) {
                grouped[reaction.reaction] = { reactors: [] };
            }
            grouped[reaction.reaction]!.reactors.push(reaction.reactorName);
        });
        return grouped;
    };

    const getEmojiForReaction = (reaction: InteractionEnum): string => {
        switch (reaction) {
            case InteractionEnum.THUMBS_UP:
                return '👍';
            case InteractionEnum.DOLLAR:
                return '💲';
            case InteractionEnum.BULB:
                return '💡';
            case InteractionEnum.HEART:
                return '❤️';
            case InteractionEnum.SMILE:
                return '😀';
            default:
                return '👍';
        }
    };

    const scrollToMessage = (id: string) => {
        const el = messageRefs.current.get(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('transition-colors', 'duration-300', 'bg-gray-800', 'rounded-sm');
            setTimeout(() => el.classList.remove('bg-gray-800'), 1500);
        }
    };

    return (
        <div className="w-full p-3 pt-14 flex flex-col gap-y-1 relative">
            {messages.map((message) => {
                const isOwnMessage = message.senderId === id;
                const groupedReactions = groupReactionsByType(message.chatReactions ?? []);
                const highlighted = highlight?.id === message.id;
                const repliedMessage = message.repliedToId
                    ? messageMap.get(message.repliedToId)
                    : undefined;

                const reactionEntries = Object.entries(groupedReactions);
                const hasReactions = reactionEntries.length > 0;
                const isExpanded = expandedMessage === message.id;
                const visibleReactions = isExpanded
                    ? reactionEntries.slice(0, 5)
                    : reactionEntries.slice(0, 3);
                const extraCount =
                    isExpanded && reactionEntries.length > 5 ? reactionEntries.length - 5 : 0;

                return (
                    <div key={message.id} className="flex flex-col gap-y-2 relative mb-2">
                        <div
                            ref={(el) => {
                                if (el) messageRefs.current.set(message.id, el);
                            }}
                            className={cn(
                                'flex items-end gap-x-2 relative',
                                isOwnMessage ? 'flex-row-reverse' : 'flex-row',
                                highlighted ? 'bg-neutral-950 rounded-lg p-1' : 'p-1',
                            )}
                            onMouseEnter={() => {
                                setHoverMessage(message.id);
                                if (reactionEntries.length > 3) {
                                    setExpandedMessage(message.id);
                                }
                            }}
                            onMouseLeave={() => {
                                setHoverMessage('');
                                setExpandedMessage(null);
                            }}
                            onDoubleClick={() => onDoubleClick(message)}
                        >
                            {!isOwnMessage && (
                                <div className="size-[28px] rounded-full overflow-hidden flex-shrink-0">
                                    <Image
                                        src={message.senderAvatar || ''}
                                        alt={message.senderName}
                                        width={28}
                                        height={28}
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            <MessageBubble
                                message={message.message}
                                messageCreatedAt={message.createdAt}
                                colored={isOwnMessage}
                                hovered={message.id === hoverMessage}
                                isOwnMessage={isOwnMessage}
                                active={activeReactionMessage === message.id}
                                onToggle={() => handleToggleReaction(message.id)}
                                closeOthers={() => setActiveReactionMessage(null)}
                                onReact={(reaction) => onSendReaction(message.id, reaction)}
                                repliedMessage={repliedMessage}
                                scrollToMessage={scrollToMessage}
                                onReplyClick={() => onDoubleClick(message)}
                            />

                            {hasReactions && (
                                <div
                                    className={cn(
                                        'absolute flex items-center overflow-hidden rounded-full transition-all duration-300 ease-in-out space-x-0.5 bg-neutral-800 border px-2 py-0.5',
                                        isOwnMessage
                                            ? 'justify-end right-18'
                                            : 'justify-start left-18',
                                        isExpanded
                                            ? 'max-w-[200px] opacity-100'
                                            : 'max-w-[90px] opacity-90',
                                    )}
                                    style={{
                                        gap: '2px',
                                    }}
                                >
                                    {visibleReactions.map(([reactionType], index) => (
                                        <span key={index} className="text-sm">
                                            {getEmojiForReaction(reactionType as InteractionEnum)}
                                        </span>
                                    ))}
                                    {extraCount > 0 && (
                                        <span className="text-xs text-neutral-400">
                                            +{extraCount}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}
