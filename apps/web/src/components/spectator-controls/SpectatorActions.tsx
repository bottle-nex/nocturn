'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Message, User } from './specTypes';
import { FcGlobe } from 'react-icons/fc';
import { cn } from '@/lib/utils';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useHandleClickOutside } from '@/hooks/useHandleClickOutside';
import { MdLeaderboard } from 'react-icons/md';
import ExpandablePanel from '../quiz/live/common/ExpandablePanel';
import { useLiveSpectatorStore } from '@/store/live-quiz/useLiveQuizUserStore';
import SpectatorPeoplePanel from '../quiz/live/spectator/SpectatorPeoplePanel';
import SpectatorControls from '../quiz/live/spectator/SpectatorControls';
import { useLiveSpectatorsStore } from '@/store/live-quiz/useLiveSpectatorsStore';

interface SpectatorActionsProps {
    onExpandChange?: (isChatExpanded: boolean, isLeaderBoardExpanded: boolean) => void;
}

export default function SpectatorActions({ onExpandChange }: SpectatorActionsProps) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const spectatorChatRef = useRef<HTMLDivElement>(null);
    const leaderboardChatRef = useRef<HTMLDivElement>(null);
    const spectatorsDisplayRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Record<string, Message[]>>({});
    const [openChatDropdown, setOpenChatDropdown] = useState(false);
    const [isChatExpanded, setIsChatExpanded] = useState(false);

    const [openLeaderBoardDropdown, setOpenLeaderBoardDropDown] = useState(false);
    const [isLeaderBoardExpanded, setIsLeaderBoardExpanded] = useState(false);

    const [openPeopleDropdown, setOpenPeopleDropdown] = useState(false);

    const { quiz } = useLiveQuizStore();

    const { spectatorData } = useLiveSpectatorStore();
    const { spectators } = useLiveSpectatorsStore();

    useEffect(() => {
        onExpandChange?.(isChatExpanded, isLeaderBoardExpanded);
    }, [isChatExpanded, onExpandChange, isLeaderBoardExpanded]);

    useHandleClickOutside([spectatorChatRef], setOpenChatDropdown);
    useHandleClickOutside([spectatorsDisplayRef], setOpenPeopleDropdown);
    useHandleClickOutside([leaderboardChatRef], setOpenLeaderBoardDropDown);

    const users: User[] = useMemo(() => {
        const globalChat: User = {
            id: 'global',
            name: 'Global Chat',
            svg: <FcGlobe style={{ width: '28px', height: '28px' }} />,
        };

        const spectatorUsers: User[] = spectators.map((s) => ({
            id: s.id,
            name: s.nickname || 'Anonymous',
            avatar: s.avatar || '',
            isCurrentUser: spectatorData?.id === s.id,
        }));

        return [globalChat, ...spectatorUsers];
    }, [spectators, spectatorData]);

    const [selectedUser, _setSelectedUser] = useState<User>(users[0]!);
    const newMessage = messages[selectedUser.id];

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [newMessage]);

    const handleSendMessage = (text: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => ({
            ...prev,
            [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage],
        }));

        setTimeout(
            () => {
                const responses = [
                    'Kaise ho g!',
                    'Mai bhi badiya!',
                    'Kuch nahi timepass',
                    'This chat is so fun!',
                    'Keep the good vibes coming!',
                ];

                const response: Message = {
                    id: (Date.now() + 1).toString(),
                    text: responses[Math.floor(Math.random() * responses.length)],
                    sender: 'other',
                    timestamp: new Date(),
                };

                setMessages((prev) => ({
                    ...prev,
                    [selectedUser.id]: [...(prev[selectedUser.id] || []), response],
                }));
            },
            1000 + Math.random() * 2000,
        );
    };

    return (
        <div className="h-full" style={{ color: quiz.theme.theme?.text_color }}>
            <div className={cn(`fixed bottom-3 z-50 flex gap-1 border rounded-3xl p-2 right-4`)}>
                <SpectatorControls
                    onClickPeople={() => {
                        setOpenChatDropdown(false);
                        setOpenLeaderBoardDropDown(false);
                        setOpenPeopleDropdown((prev) => !prev);
                    }}
                    onClickChat={() => {
                        setOpenPeopleDropdown(false);
                        setOpenLeaderBoardDropDown(false);
                        setOpenChatDropdown((prev) => !prev);
                    }}
                    onClickLeaderboard={() => {
                        setOpenChatDropdown(false);
                        setOpenPeopleDropdown(false);
                        setOpenLeaderBoardDropDown((prev) => !prev);
                    }}
                    onClickSettings={() => {}}
                />
            </div>

            {openPeopleDropdown && <SpectatorPeoplePanel ref={spectatorsDisplayRef} />}

            {openChatDropdown && (
                <ExpandablePanel
                    type="chat"
                    ref={spectatorChatRef}
                    bottomRef={bottomRef}
                    data={selectedUser}
                    selectedUser={selectedUser}
                    messages={messages}
                    onToggleExpand={() => setIsChatExpanded((prev) => !prev)}
                    isExpanded={isChatExpanded}
                    onSendMessage={handleSendMessage}
                />
            )}

            {openLeaderBoardDropdown && (
                <ExpandablePanel
                    type="leaderboard"
                    ref={leaderboardChatRef}
                    data={{
                        title: 'Leaderboard',
                        svg: <MdLeaderboard style={{ width: '28px', height: '28px' }} />,
                    }}
                    onToggleExpand={() => setIsLeaderBoardExpanded((prev) => !prev)}
                    isExpanded={isLeaderBoardExpanded}
                />
            )}
        </div>
    );
}
