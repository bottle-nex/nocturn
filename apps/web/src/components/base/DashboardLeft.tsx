'use client';

import { cn } from '@/lib/utils';
import { useHomeRendererStore } from '@/store/home/useHomeRendererStore';
import { useSideBarStore } from '@/store/home/useSideBar';
import { HomeRendererEnum } from '@/types/homeRendererTypes';
import { JSX, useEffect, useRef } from 'react';
import { MdRateReview } from 'react-icons/md';
import { FiX } from 'react-icons/fi';
import gsap from 'gsap';

import {
    TbDashboard,
    TbPlus,
    TbTrophy,
    TbChartBar,
    TbWallet,
    TbCrown,
    TbHistory,
    TbSettings,
    TbHelp,
} from 'react-icons/tb';
import AppLogo from '../app/AppLogo';

export default function DashboardLeft(): JSX.Element {
    const { value, setValue } = useHomeRendererStore();
    return (
        <>
            <BigDashboardLeft value={value} setValue={setValue} />
            <SmallDashboardLeft value={value} setValue={setValue} />
        </>
    );
}

function BigDashboardLeft({
    value,
    setValue,
}: {
    value: HomeRendererEnum;
    setValue: (value: HomeRendererEnum) => void;
}): JSX.Element {
    return (
        <div
            className={cn(
                'h-full bg-light-base dark:bg-dark-primary/30 shrink-0 w-[300px]',
                'hidden lg:flex flex-col items-start py-6 pt-[3rem]',
            )}
        >
            {/* <AppLogo className="px-4" /> */}
            <DashboardOptions value={value} setValue={setValue} />
        </div>
    );
}

function SmallDashboardLeft({
    value,
    setValue,
}: {
    value: HomeRendererEnum;
    setValue: (value: HomeRendererEnum) => void;
}): JSX.Element {
    const { appearing, setAppearing } = useSideBarStore();
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (appearing) {
            gsap.fromTo(
                sidebarRef.current,
                {
                    x: -300,
                },
                {
                    x: 0,
                    duration: 0.2,
                    ease: 'power2.inOut',
                },
            );
        }
    }, [appearing]);

    const handleClose = () => {
        gsap.fromTo(
            sidebarRef.current,
            {
                x: 0,
            },
            {
                x: -300,
                duration: 0.2,
                ease: 'power2.inOut',
                onComplete: () => setAppearing(false),
            },
        );
    };

    return (
        <div
            ref={sidebarRef}
            className={cn(
                'h-full xs:w-[300px] w-full bg-light-base dark:bg-dark-base border-r dark:border-dark-base shadow-xl shrink-0 ',
                'lg:hidden flex flex-col justify-start items-center py-6',
                'absolute z-20',
                `${appearing ? '' : 'hidden'}`,
            )}
        >
            <div className="w-full flex items-center justify-between pr-10 ">
                <AppLogo />

                <FiX size={20} onClick={handleClose} className="cursor-pointer" />
            </div>

            <DashboardOptions value={value} setValue={setValue} close={handleClose} />
        </div>
    );
}

function DashboardOptions({
    value,
    setValue,
    close,
}: {
    value: HomeRendererEnum;
    setValue: (value: HomeRendererEnum) => void;
    close?: () => void;
}): JSX.Element {
    const upperDashboardOptions: OptionProps[] = [
        {
            icon: <TbDashboard size={20} />,
            label: 'Dashboard',
            onClick: () => {
                setValue(HomeRendererEnum.DASHBOARD);
                close?.();
            },
            isActive: value === HomeRendererEnum.DASHBOARD,
        },
        {
            icon: <TbTrophy size={20} />,
            label: 'My Quizzes',
            onClick: () => {
                setValue(HomeRendererEnum.MY_QUIZ);
                close?.();
            },
            isActive: value === HomeRendererEnum.MY_QUIZ,
        },
        {
            icon: <TbPlus size={20} />,
            label: 'Create Quiz',
            onClick: () => {
                setValue(HomeRendererEnum.CREATE_QUIZ);
                close?.();
            },
            isActive: value === HomeRendererEnum.CREATE_QUIZ,
        },
        {
            icon: <TbChartBar size={20} />,
            label: 'Analytics',
            onClick: () => {
                setValue(HomeRendererEnum.ANALYTICS);
                close?.();
            },
            isActive: value === HomeRendererEnum.ANALYTICS,
        },
        {
            icon: <TbWallet size={20} />,
            label: 'Wallet',
            onClick: () => {
                setValue(HomeRendererEnum.WALLET);
                close?.();
            },
            isActive: value === HomeRendererEnum.WALLET,
        },
        {
            icon: <TbCrown size={20} />,
            label: 'Leaderboards',
            onClick: () => {
                setValue(HomeRendererEnum.LEADERBOARD);
                close?.();
            },
            isActive: value === HomeRendererEnum.LEADERBOARD,
        },
        {
            icon: <TbHistory size={20} />,
            label: 'History',
            onClick: () => {
                setValue(HomeRendererEnum.HISTORY);
                close?.();
            },
            isActive: value === HomeRendererEnum.HISTORY,
        },
    ];

    const lowerDashboardOptions: OptionProps[] = [
        {
            icon: <MdRateReview size={20} />,
            label: 'Leave a review',
            onClick: () => {
                setValue(HomeRendererEnum.REVIEW);
                close?.();
            },
            isActive: value === HomeRendererEnum.REVIEW,
        },
        {
            icon: <TbSettings size={20} />,
            label: 'Settings',
            onClick: () => {
                setValue(HomeRendererEnum.SETTINGS);
                close?.();
            },
            isActive: value === HomeRendererEnum.SETTINGS,
        },
        {
            icon: <TbHelp size={20} />,
            label: 'Help & Support',
            onClick: () => {
                setValue(HomeRendererEnum.HELP);
                close?.();
            },
            isActive: value === HomeRendererEnum.HELP,
        },
    ];

    return (
        <>
            <div className="mt-8 w-full space-y-1 px-2 flex flex-col gap-y-2">
                {upperDashboardOptions.map((opt, i) => (
                    <NavOption key={i} {...opt} />
                ))}
            </div>
            <div className="mt-auto w-full space-y-1 pl-2">
                {lowerDashboardOptions.map((opt, i) => (
                    <NavOption key={i} {...opt} />
                ))}
            </div>
        </>
    );
}

interface OptionProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    isActive?: boolean;
}

// function LogoOption({ icon, label }: OptionProps) {
//     return (
//         <button className="flex items-center justify-start gap-3 w-full px-4 h-10">
//             <div className="flex items-center justify-center shrink-0">{icon}</div>
//             <span className="text-xl text-dark-base dark:text-light-base font-bold whitespace-nowrap overflow-hidden leading-none">
//                 {label}
//             </span>
//         </button>
//     );
// }

function NavOption({ icon, label, onClick, isActive }: OptionProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center justify-start gap-3 w-full px-4 h-10 hover:bg-light-base dark:hover:bg-dark-primary rounded-lg cursor-pointer transition-colors',
                isActive && 'bg-light-base dark:bg-dark-primary',
            )}
        >
            <div className="flex items-center justify-center shrink-0 w-5 h-5">{icon}</div>
            <span className="text-sm text-dark-primary dark:text-light-base font-normal whitespace-nowrap overflow-hidden leading-none">
                {label}
            </span>
        </div>
    );
}
