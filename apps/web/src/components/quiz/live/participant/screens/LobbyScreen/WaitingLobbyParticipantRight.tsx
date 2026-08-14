import { TbClockHour3Filled } from 'react-icons/tb';
import Image from 'next/image';
import { ChevronRight, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';
import { useLiveParticipantStore } from '@/store/live-quiz/useLiveQuizUserStore';
import { FormEvent, useState } from 'react';
import { useWebSocket } from '@/hooks/sockets/useWebSocket';
import { ParticipantNameChangeEvent } from '@nocturn/types';

export default function WaitingLobbyParticipantRight() {
    const { quiz } = useLiveQuizStore();
    const { handleParticipantNameChangeMessage } = useWebSocket();
    const { participantData } = useLiveParticipantStore();
    const [name, setName] = useState(participantData?.nickname);

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

    return (
        <div className="w-full max-w-[32vw] h-full flex flex-col justify-between bg-light-base dark:bg-neutral-900 rounded-l-xl border-l dark:border-neutral-700 border-neutral-200 z-[20] shadow-2xl px-6 py-6 dark:text-neutral-300 text-dark-alpha">
            <div className="flex-shrink-0">
                <h2 className="text-lg font-bold mb-2"># Quiz Details</h2>
                <div className="text-sm font-normal tracking-wide mt-3">{quiz?.title}</div>
                <div className="mt-12">
                    <div className="flex items-center justify-between mx-4">
                        <div className="text-sm flex items-center justify-start gap-x-3">
                            <TbClockHour3Filled size={18} />
                            30 mins
                        </div>
                    </div>
                </div>
                <div className="border dark:border-neutral-600 border-neutral-300 rounded-xl shadow-md px-4 py-2 mt-4 flex items-center justify-between">
                    <div className="flex items-center justify-start gap-x-3">
                        {quiz?.host?.image && (
                            <Image
                                src={quiz.host.image}
                                width={32}
                                height={32}
                                alt={`${quiz.host.name}'s avatar`}
                                className="rounded-full object-cover border border-neutral-300 dark:border-neutral-700"
                            />
                        )}
                        <div className="flex flex-col">
                            <span className="text-sm">{quiz?.host?.name}</span>
                            <span className="text-[11px] dark:text-neutral-400 text-neutral-500">
                                {quiz?.host?.email}
                            </span>
                        </div>
                    </div>
                    <span className="font-sans text-sm">host</span>
                </div>
            </div>
            <div className="w-full flex items-center justify-center">
                {participantData?.avatar && (
                    <div className="w-full flex flex-col items-center justify-center gap-y-4">
                        <Image
                            src={participantData.avatar}
                            width={200}
                            height={100}
                            priority
                            unoptimized={true}
                            className="rounded-full"
                            alt="user"
                        />
                        {participantData?.isNameChanged && (
                            <div className="flex flex-col gap-y-4 items-center justify-center">
                                <div className="text-[29px]">
                                    Get ready to play{' '}
                                    {participantData.nickname?.split(' ')[0]?.toLowerCase() ??
                                        'player'}
                                    !
                                </div>
                                <div className="text-sm font-normal text-neutral-500">
                                    Answer fast to get more points!
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div>
                {!participantData?.isNameChanged && (
                    <div className="mb-4 flex flex-col space-y-4">
                        <div className="bg-neutral-800 dark:bg-neutral-200 rounded-xl border border-neutral-300 dark:border-neutral-700 p-4 shadow-lg dark:text-neutral-900 text-neutral-300 ">
                            <label className="block text-sm font-medium mb-2">
                                Choose your display name
                            </label>
                            <p className="text-xs mb-3">
                                This name will be visible to other participants
                            </p>
                            <form onSubmit={handleSubmit} className="relative mt-8">
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    type="text"
                                    placeholder="Choose your name"
                                    className="w-full px-5 py-5 text-base rounded-xl border border-neutral-300 dark:border-neutral-400 bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-neutral-300"
                                />

                                <Button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 text-white rounded-full p-0 flex items-center justify-center shadow-md"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </form>
                        </div>
                    </div>
                )}
                <div className="p-4 bg-neutral-300 dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-300 ">
                    <div className="flex items-start gap-x-3">
                        <Info size={16} className="mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium mb-1">Before you join</h4>
                            <ul className="text-xs space-y-1">
                                <li>• Make sure you have a stable internet connection</li>
                                <li>• Keep this tab active during the quiz</li>
                                <li>• Your answers will be submitted automatically</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
