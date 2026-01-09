import { Input } from '@/components/ui/input';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { useLiveSpectatorStore } from '@/store/live-quiz/useLiveQuizUserStore';
import { SpectatorNameChangeEvent } from '@nocturn/types';
import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { IoPencil } from 'react-icons/io5';
import { IoMdCheckmark } from 'react-icons/io';

export default function SpectatorSettingsPanel() {
    const { handleSpectatorNameChangeMessage } = useWebSocket();
    const { spectatorData, updateSpectatorData } = useLiveSpectatorStore();
    const [name, setName] = useState<string>(spectatorData?.nickname || '');
    const [isEditing, setIsEditing] = useState<boolean>(false);

    function handleNameSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!name.trim()) return;

        const finalName = name.startsWith('') ? name : `${name.trim()}`;

        const payload: SpectatorNameChangeEvent = {
            choosenNickname: finalName,
        };
        handleSpectatorNameChangeMessage(payload);

        updateSpectatorData({
            ...spectatorData,
            nickname: finalName,
            isNameChanged: true,
        });

        setIsEditing(false);
    }

    return (
        <div className="flex flex-col h-full justify-between relative">
            {/* spec settings here */}

            <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] flex justify-between items-center 
                           px-5 py-3 rounded-2xl border border-white/20 dark:border-white/10 shadow-lg 
                           bg-white/30 dark:bg-black/30 backdrop-blur-md"
            >
                <div className="flex items-center gap-x-3">
                    {spectatorData?.avatar && (
                        <Image
                            src={spectatorData.avatar}
                            width={32}
                            height={32}
                            alt={`${spectatorData.nickname}'s avatar`}
                            className="rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                        />
                    )}

                    {isEditing && !spectatorData?.isNameChanged ? (
                        <form onSubmit={handleNameSubmit} className="flex items-center gap-x-2">
                            <Input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="py-1 px-2 text-sm"
                                autoFocus
                                onBlur={() => setIsEditing(false)}
                            />
                        </form>
                    ) : (
                        <span className="text-sm dark:text-light-base text-dark-alpha">
                            {spectatorData?.nickname}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-x-3 pr-1">
                    {spectatorData?.isNameChanged ? (
                        <IoMdCheckmark size={22} className="text-green-500" />
                    ) : (
                        <IoPencil
                            size={20}
                            className="cursor-pointer text-dark-alpha dark:text-light-base"
                            onClick={() => setIsEditing(true)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
