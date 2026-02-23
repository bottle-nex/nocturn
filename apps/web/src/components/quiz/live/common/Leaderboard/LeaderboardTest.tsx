'use client';
import { cn } from '@/lib/utils';
import WinnerCard from '../LeaderboardRevamp/WinnerCard';

export default function LeaderboardTest({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'flex justify-center items-center text-dark-alpha h-full w-full p-15',
                className,
            )}
        >
            <div className="w-5xl h-full mx-auto flex flex-col items-center ring-1 ring-dark-base/10 bg-light-base backdrop-blur-xs rounded-xl p-4 shadow-xs shadow-black/10">
                <div className="h-[50%] w-full relative flex flex-col items-center justify-end">
                    <div className="absolute text-[9rem] text-dark-base/10 font-bold tracking-wide leading-none left-1/2 -translate-x-1/2 top-10">
                        {/* CHAMPIONS */}
                    </div>
                    <div className="flex gap-x-15 ">
                        <WinnerCard
                            primaryColor="#e1dee9"
                            imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-11.jpg"
                            points={200}
                            name="Piyush Raj"
                            className="scale-90 mt-10"
                        />

                        <WinnerCard
                            isWinner
                            primaryColor="#fca320"
                            imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-2.jpg"
                            points={300}
                            name="Prakash Pawar"
                            className="scale-105"
                        />

                        <WinnerCard
                            primaryColor="#d58936"
                            imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-3.jpg"
                            points={200}
                            name="Piyush Raj"
                            className="scale-90 mt-10"
                        />
                    </div>
                </div>
                <div className="h-[50%] flex flex-col w-full">
                    <div className="flex justify-between p-2 ring-1 ring-black/10 h-full"></div>
                </div>
            </div>
        </div>
    );
}
