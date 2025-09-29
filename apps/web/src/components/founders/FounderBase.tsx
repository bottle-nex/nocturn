'use client';
import DeveloperCard from '@/components/founders/DeveloperCard';
import AppLogo from '../app/AppLogo';
import { cn } from '@/lib/utils';
import { FaXTwitter } from 'react-icons/fa6';
import { FaGithub } from 'react-icons/fa';
import PurpleFooter from '../base/PurpleFooter';
import DarkModeToggle from '../base/DarkModeToggle';

export const animations = `
  @keyframes fadeInLight {
    0% { opacity: 0; filter: blur(100px); }
    100% { opacity: 1; filter: blur(80px); }
  }
  @keyframes slideDownFade {
    0% { opacity: 0; transform: translateY(-20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
`;

export default function FounderBase() {
    return (
        <div className="relative w-full flex flex-col items-center justify-between dark:text-white text-gray-900 dark:bg-gradient-to-b dark:from-[#20163560] dark:to-black bg-gradient-to-b from-gray-50 to-[#f7fafc] select-none overflow-x-hidden">
            <style>{animations}</style>

            {/* Dark mode background gradient - preserved original */}
            <div className="absolute top-0 left-0 w-[140vh] h-[120vh] pointer-events-none overflow-hidden dark:block hidden">
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

            {/* Light mode background gradient */}
            <div className="absolute top-0 left-0 w-[140vh] h-[120vh] pointer-events-none overflow-hidden dark:hidden block">
                <div
                    className="w-full h-full"
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(149,115,225,0.12) 0%, rgba(149,115,225,0.05) 40%, rgba(149,115,225,0) 70%)',
                        filter: 'blur(120px)',
                        transform: 'rotate(-20deg) translate(-40%, -40%)',
                        transformOrigin: 'top left',
                        animation: 'fadeInLight 1.8s ease-out forwards',
                    }}
                />
            </div>

            <div
                className="absolute h-full w-full max-h-[80px] dark:border-b border-b dark:border-gray-700 border-gray-200 flex justify-start items-center px-3 sm:px-5"
                style={{ animation: 'slideDownFade 1s ease-out forwards' }}
            >
                <AppLogo />
            </div>

            <div className="w-full max-w-4xl xl:max-w-5xl 2xl:max-w-5xl dark:border-l dark:border-r border-l border-r dark:border-gray-700 border-gray-200 pt-[80px] flex flex-col mx-auto px-2 sm:px-0">
                <div
                    className="h-16 sm:h-20 w-full dark:border-b border-b dark:border-gray-700 border-gray-200 flex p-3 sm:p-6 text-sm sm:text-md items-center justify-between font-light"
                    style={{ animation: 'slideDownFade 1.2s ease-out forwards' }}
                >
                    <div className="text-xs sm:text-sm md:text-[18px] tracking-wider dark:text-white text-gray-800">
                        MEET THE FOUNDERS
                    </div>
                    <div className="flex gap-x-0.5">
                        <span
                            className={cn(
                                'social-item flex justify-center items-center',
                                'h-8 w-8 sm:h-9 sm:w-9 rounded-[12px] font-sans transition duration-200',
                                'dark:text-white text-gray-700 dark:hover:bg-gray-800/50 hover:bg-gray-200/50',
                            )}
                        >
                            <FaXTwitter className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
                        </span>
                        <span
                            className={cn(
                                'social-item flex justify-center items-center',
                                'h-8 w-8 sm:h-9 sm:w-9 rounded-[12px] font-sans transition duration-200',
                                'dark:text-white text-gray-700 dark:hover:bg-gray-800/50 hover:bg-gray-200/50',
                            )}
                        >
                            <FaGithub className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
                        </span>
                        <div className="text-xs sm:text-sm md:text-[18px] tracking-wider ml-6">
                            <DarkModeToggle />
                        </div>
                    </div>
                </div>

                <DeveloperCard
                    name="Rishi Kant"
                    role="FullStack Developer"
                    image="/images/founders/rishi.jpg"
                    twitterUrl="https://x.com/khairrishi"
                    linkedinUrl="https://www.linkedin.com/in/kant-linked/"
                    githubUrl="https://github.com/kant-github"
                    githubUsername="kant-github"
                    className="dark:border-b border-b dark:border-gray-700 border-gray-200"
                />
                <DeveloperCard
                    name="Anjan Suman"
                    role="FullStack Developer"
                    image="/images/founders/anjan.jpg"
                    twitterUrl="https://x.com/AnjanSuman8"
                    linkedinUrl="https://www.linkedin.com/in/anjansuman/"
                    githubUrl="https://github.com/Anjansuman"
                    githubUsername="Anjansuman"
                    className="dark:border-b border-b dark:border-gray-700 border-gray-200"
                />
                <DeveloperCard
                    name="Piyush Raj"
                    role="FullStack Developer"
                    image="/images/founders/piyush.jpg"
                    twitterUrl="https://x.com/PiyushC2P"
                    linkedinUrl="https://www.linkedin.com/in/piyush-raj-07a318260/"
                    githubUrl="https://github.com/piyush-rj"
                    githubUsername="piyush-rj"
                    className="dark:border-b border-b dark:border-gray-700 border-gray-200"
                />
                <DeveloperCard
                    name="Dipanshu Raj"
                    role="FullStack Developer"
                    image="/images/founders/dipanshu.jpg"
                    twitterUrl="https://x.com/DipTheBeginner"
                    linkedinUrl="https://www.linkedin.com/in/dipthebeginner/"
                    githubUrl="https://github.com/DipTheBeginner"
                    githubUsername="DipTheBeginner"
                />
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
