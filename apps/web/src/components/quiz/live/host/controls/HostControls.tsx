import { Button } from '@/components/ui/button';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { MdLeaderboard } from 'react-icons/md';
import { PiDetectiveFill } from 'react-icons/pi';
import { RiMessage3Fill } from 'react-icons/ri';
import { IoMdSettings } from 'react-icons/io';
import { useLiveQuizStore } from '@/store/live-quiz/useLiveQuizStore';

interface HostControlsType {
    tooltip: string;
    icon: React.ReactNode;
    onClick: () => void;
}

interface HostControlsProps {
    onClickPeople: () => void;
    onClickChat: () => void;
    onClickLeaderboard: () => void;
    onClickSettings: () => void;
}

export default function HostControls({
    onClickPeople,
    onClickSettings,
    onClickChat,
    onClickLeaderboard,
}: HostControlsProps) {
    const { quiz } = useLiveQuizStore();
    const allHostControls: HostControlsType[] = [
        {
            tooltip: 'Leaderboard',
            icon: <MdLeaderboard className="" style={{ width: '28px', height: '28px' }} />,
            onClick: onClickLeaderboard,
        },
        {
            tooltip: 'People in Room',
            icon: <PiDetectiveFill className="" style={{ width: '28px', height: '28px' }} />,
            onClick: onClickPeople,
        },
        {
            tooltip: 'Chat with others',
            icon: <RiMessage3Fill style={{ width: '28px', height: '28px' }} />,
            onClick: onClickChat,
        },
        {
            tooltip: 'Settings',
            icon: <IoMdSettings style={{ width: '28px', height: '28px' }} />,
            onClick: onClickSettings,
        },
    ];

    return (
        <div className="flex">
            {allHostControls.map((control, index) => (
                <ToolTipComponent content={control.tooltip} key={index}>
                    <Button
                        style={{ color: quiz.theme.theme?.text_color }}
                        variant="ghost"
                        onClick={control.onClick}
                        className="hover:scale-105 dark:hover:bg-transparent hover:bg-transparent transition-all duration-300 dark:hover cursor-pointer"
                    >
                        {control.icon}
                    </Button>
                </ToolTipComponent>
            ))}
        </div>
    );
}
