'use client';
import { HiArrowNarrowRight } from 'react-icons/hi';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface UserTypeCardData {
    userType: string;
    userRole: string;

    userHeading: string;
    miniDesc: string;
    detailedDesc: string;

    buttonTitle: string;
    buttonIcon: React.ReactElement;
    border: string;

    bgClassname: string;
    textClassname: string;
    buttonClassName: string;

    onClick: () => void;
}

export default function UserTypeCard({
    userType,
    userRole,
    userHeading,
    miniDesc,
    detailedDesc,
    buttonTitle,
    buttonIcon,
    bgClassname,
    textClassname,
    buttonClassName,
    border,
    onClick,
}: UserTypeCardData) {
    return (
        <div
            className={cn(
                'w-full h-full rounded-none flex flex-col p-6 items-center relative noise-bg',
                bgClassname,
            )}
        >
            <div className="flex justify-between text-xl w-full font-semibold">
                <div>{userType}</div>
                <div
                    onClick={onClick}
                    className="flex items-center gap-x-1 hover:underline cursor-pointer"
                >
                    {userRole}
                    <HiArrowNarrowRight className="size-6" />
                </div>
            </div>

            <div
                className={cn(
                    'w-fit flex flex-col items-start h-full justify-center gap-y-8 px-30',
                    textClassname,
                )}
            >
                <div className="text-[6rem] font-semibold leading-20 pt-10">{userHeading}</div>

                <div className={cn('h-px w-full border-t', border)} />

                <div className="text-3xl tracking-wide font-normal">{miniDesc}</div>

                <div className="text-base font-semibold tracking-wide">{detailedDesc}</div>

                <div className={cn('h-px w-full border-t', border)} />

                <Button
                    onClick={onClick}
                    className={cn(
                        'border h-14 text-[18px] flex items-center transition-colors duration-300 rounded-[8px]',
                        buttonClassName,
                    )}
                >
                    {buttonIcon}
                    {buttonTitle}
                </Button>
            </div>
        </div>
    );
}
