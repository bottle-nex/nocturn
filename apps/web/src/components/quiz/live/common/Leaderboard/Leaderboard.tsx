import { cn } from '@/lib/utils';
import Tiers from './Tiers';
import Graph from './Graph';
import Rank from './Rank';
import NotchCard from '@/components/ui/NotchCard';

type HostMode = {
    host: true;
    spectator?: never;
    participant?: never;
};

type SpectatorMode = {
    spectator: true;
    host?: never;
    participant?: never;
};

type ParticipantMode = {
    participant: true;
    host?: never;
    spectator?: never;
};

type LeaderboardMode = HostMode | SpectatorMode | ParticipantMode;

interface BaseProps {
    explanation: string;
    className?: string;
}

type LeaderboardProps = BaseProps & LeaderboardMode;

export default function Leaderboard({
    className,
    explanation,
    host,
    spectator,
    participant,
}: LeaderboardProps) {
    // const { response } = useLiveParticipantsStore();

    return (
        <div className={cn('flex justify-end items-center p-2 text-dark-alpha h-full', className)}>
            <div
                className={cn(
                    'h-full w-210 border border-dark-base rounded-2xl bg-light-alpha/10 backdrop-blur-[2px] shadow-md',
                    'grid grid-cols-4 grid-rows-8',
                    'p-3 gap-3',
                )}
            >
                <Tiers className="col-span-2 row-span-3 border border-dark-base rounded-[10px]" />

                <NotchCard
                    className="col-span-2 row-span-2 border border-dark-base rounded-[10px] px-4 py-3 flex justify-center items-center font-extralight tracking-wide"
                    label={'explanation'}
                >
                    <div>{explanation}</div>
                </NotchCard>

                <Graph
                    className="col-span-2 row-span-2 border border-dark-base rounded-[10px]"
                    points={[10, 1]}
                    label={participant ? 'your progress' : "participant's progress"}
                />

                <NotchCard
                    className="col-span-2 row-span-1 border border-dark-alpha rounded-[10px] h-full min-h-0 flex justify-center items-center "
                    label={'your response'}
                >
                    <div>
                        {host
                            ? "you're the host man, why do wanna respond."
                            : spectator
                              ? "you're a spectator your can't respond, haha!"
                              : ''}
                    </div>
                </NotchCard>

                <Rank className="col-span-4 row-span-4 border border-dark-base rounded-[10px] overflow-hidden" />
            </div>
        </div>
    );
}
