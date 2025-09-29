import AppLogo from '@/components/app/AppLogo';
import DarkModeToggle from '@/components/base/DarkModeToggle';
import PurpleFooter from '@/components/base/PurpleFooter';
import { animations } from '@/components/founders/FounderBase';
import ToolTipComponent from '@/components/utility/TooltipComponent';
import { cn } from '@/lib/utils';
import { getAllContributors } from '@/server/get_contributors';
import Image from 'next/image';

export interface Contributor {
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
    id: number;
    type: string;
}

export default async function Page() {
    const contributors = await getAllContributors();

    return (
        <div
            className="relative w-full flex flex-col items-center justify-between 
            bg-gradient-to-b from-[#f4f4f9] to-white text-neutral-900 
            dark:text-white dark:from-[#20163560] dark:to-black 
            select-none overflow-x-hidden"
        >
            <style>{animations}</style>

            <div className="absolute top-0 left-0 w-[140vh] h-[120vh] pointer-events-none overflow-hidden">
                <div
                    className="w-full h-full"
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(149,115,225,0.3) 0%, rgba(149,115,225,0) 60%)',
                        filter: 'blur(120px)',
                        transform: 'rotate(-20deg) translate(-40%, -40%)',
                        transformOrigin: 'top left',
                        animation: 'fadeInLight 1.8s ease-out forwards',
                    }}
                />
            </div>

            <div
                className="absolute h-full w-full max-h-[80px] border-b flex justify-start items-center px-3 sm:px-5
                border-neutral-300 dark:border-neutral-800"
                style={{ animation: 'slideDownFade 1s ease-out forwards' }}
            >
                <AppLogo />
            </div>

            <div className="w-full h-full max-w-4xl xl:max-w-5xl 2xl:max-w-5xl border-l border-r border-neutral-200 dark:border-neutral-800 pt-[80px] flex flex-col mx-auto px-2 sm:px-0">
                <div
                    className="h-16 sm:h-20 w-full border-b border-neutral-200 dark:border-neutral-800 
                    flex p-3 sm:p-6 text-sm sm:text-md items-center justify-between font-light "
                    style={{ animation: 'slideDownFade 1.2s ease-out forwards' }}
                >
                    <div className="text-xs sm:text-sm md:text-[18px] tracking-wider">
                        WALL OF CONTRIBUTORS
                    </div>
                    <div className="text-xs sm:text-sm md:text-[18px] tracking-wider">
                        <DarkModeToggle />
                    </div>
                </div>

                <div className="px-20 py-16 relative">
                    <div
                        className={cn(
                            'absolute inset-0',
                            '[background-size:20px_20px]',
                            '[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]',
                            'dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]',
                        )}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br dark:from-black/30 dark:via-black/50 dark:to-black/70 from-transparent to-[#f7f7fa] z-10 pointer-events-none" />
                    {contributors.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1">
                            <p className="text-gray-500 dark:text-gray-400 text-lg">
                                No contributors found
                            </p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                                Unable to load contributor data at this time
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-8">
                            {contributors.map((contributor: Contributor) => (
                                <ToolTipComponent
                                    key={contributor.id}
                                    content={`${contributor.contributions} commits`}
                                >
                                    <div className="relative group">
                                        <div className="absolute w-32 h-32 dark:bg-white bg-neutral-900 rounded-2xl transition-transform duration-200 ease-in-out group-hover:translate-y-2 group-hover:-translate-x-2" />

                                        <a
                                            href={contributor.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="relative w-32 h-32 flex flex-col items-center 
                                            rounded-2xl transition-transform duration-200 
                                            border-2 border-neutral-300 dark:border-neutral-900 
                                        bg-white/70 dark:bg-white/10 z-10 overflow-hidden"
                                        >
                                            <Image
                                                src={contributor.avatar_url}
                                                alt="user"
                                                fill
                                                className="object-cover"
                                            />

                                            <div
                                                className="absolute inset-x-0 bottom-0 px-2 py-1 text-center text-xs 
      bg-neutral-200 text-neutral-900 
      dark:bg-neutral-950 dark:text-white 
      opacity-0 group-hover:opacity-100 transition-all duration-200 ease-in-out
      translate-y-full group-hover:translate-y-0"
                                            >
                                                {contributor.login}
                                            </div>
                                        </a>
                                    </div>
                                </ToolTipComponent>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full flex items-center justify-center">
                <div
                    className="text-[14rem] font-medium text-center 
                    bg-gradient-to-b from-[rgba(116,74,199,0.3)] via-[rgba(116,74,199,0.1)] 
                    to-white/10 dark:to-[#01011220] bg-clip-text text-transparent"
                >
                    NOCTURN
                </div>
            </div>

            <PurpleFooter />
        </div>
    );
}
