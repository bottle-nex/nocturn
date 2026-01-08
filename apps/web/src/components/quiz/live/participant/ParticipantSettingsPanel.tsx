import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { useLiveParticipantStore } from '@/store/live-quiz/useLiveQuizUserStore';
import { ParticipantNameChangeEvent } from '@nocturn/types';
import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { IoMdSettings } from 'react-icons/io';

export default function ParticipantSettingPanel() {
    const { handleParticipantNameChangeMessage } = useWebSocket();
    const { participantData } = useLiveParticipantStore();
    const [name, setName] = useState<string | undefined>(participantData?.nickname);
    const [enableNameChange, setEnableNameChange] = useState<boolean>(false);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!name || name.trim() === '') {
            return;
        }
        const payload: ParticipantNameChangeEvent = {
            choosenNickname: name,
        };
        handleParticipantNameChangeMessage(payload);
    }

    function handleNameChange(checked: boolean) {
        setEnableNameChange(checked);
    }

    return (
        <div className="flex flex-col h-full justify-between relative z-[200]">
            <section className="px-4">
                <div className="w-full px-2 mt-6">
                    <div className="flex items-center justify-start gap-x-1">
                        <span className="text-sm font-normal text-dark-prime dark:text-light-base">
                            Name
                        </span>
                        <ToolTipComponent content="you can only change your name once">
                            <AiOutlineQuestionCircle size={15} />
                        </ToolTipComponent>
                    </div>

                    <div className="flex w-full items-center justify-between mt-2">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            Change your name
                        </span>
                        <Switch
                            disabled={participantData?.isNameChanged}
                            className="cursor-pointer"
                            checked={enableNameChange}
                            onCheckedChange={handleNameChange}
                        />
                    </div>

                    {enableNameChange && !participantData?.isNameChanged && (
                        <form onSubmit={handleSubmit} className="flex flex-col space-y-2 mt-4">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                choose your new name
                            </span>

                            <Input
                                min={1}
                                type="text"
                                placeholder={participantData?.nickname}
                                disabled={participantData?.isNameChanged}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="py-5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none dark:text-light-base text-dark-prime"
                            />
                        </form>
                    )}
                </div>
            </section>
            <div className="flex justify-between items-center px-7 py-4 border-t">
                <div className="flex items-center gap-x-3">
                    {participantData?.avatar && (
                        <Image
                            src={participantData.avatar}
                            width={32}
                            height={32}
                            alt={`${participantData.nickname}'s avatar`}
                            className="rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                        />
                    )}
                    <span className="text-sm dark:text-light-base text-dark-prime">
                        {participantData?.nickname}
                    </span>
                </div>
                <IoMdSettings
                    size={24}
                    className="cursor-pointer text-dark-prime dark:text-light-base"
                />
            </div>
        </div>
    );
}
