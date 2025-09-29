'use client';
import Navbar from '../src/components/navbars/Navbar';
import { cn } from '@/lib/utils';
import LandingPage from '@/components/base/LandingPage';
import { Spotlight } from '@/components/ui/Spotlight';
import Beam from '@/components/ui/svg/Beam';
import FeatureBox from '@/components/base/FeatureBox';
import HomeScreenJoinQuizButton from '@/components/base/HomeScreenJoinQuizButton';
import CustomFeatureComponent from '@/components/base/CustomFeatureComponent';
import HomeScreenFooter from '@/components/base/HomeScreenFooter';
import { BiSolidBrain } from 'react-icons/bi';
import { AiFillDollarCircle } from 'react-icons/ai';
import { RiNftFill } from 'react-icons/ri';
import { FaWallet } from 'react-icons/fa';
import Faq from '@/components/base/Faq';

export const mini_descriptions = [
    {
        icon: <AiFillDollarCircle />,
        description: 'Trivia meets tokenomics.',
        color: '#FF6B6B',
    },
    {
        icon: <BiSolidBrain />,
        description: 'Pump.fun energy, but for brains.',
        color: '#4ECDC4',
    },
    {
        icon: <RiNftFill />,
        description: 'NFT trophies minted for champions.',
        color: '#FFD93D',
    },
    {
        icon: <FaWallet />,
        description: 'Wallet-native onboarding.',
        color: '#734aac',
    },
];

export default function Home() {
    return (
        <div
            className={cn(
                'w-full h-full relative',
                'bg-light-base dark:bg-dark-primary flex flex-col gap-y-30',
            )}
        >
            <Spotlight />
            <Navbar />
            <div className="w-full max-w-7xl mx-auto">
                <div className="pt-24 h-full relative">
                    <Beam className="absolute top-40 left-10" />
                    <Beam className="absolute top-90 right-10 rotate-180" />
                    <LandingPage />
                </div>
            </div>
            <div className="relative px-40">
                <FeatureBox />
            </div>

            <div>
                <div className="mx-auto w-fit mt-20 dark:bg-neutral-800 bg-neutral-300 px-6 py-2.5 rounded-md text-sm">
                    More about @Nocturn
                </div>
                <div className="mx-auto w-fit mt-8 rounded-md text-5xl font-light">
                    Many enter, only the winner survives.
                </div>
                <div className="mx-auto w-fit max-w-[50rem] text-center mt-8 font-light">
                    Nocturn is a decentralized quiz platform where participants compete for staked
                    Solana prize pools, spectators can boost rewards, and winners earn exclusive
                    NFTs to prove their victory.
                </div>
                <div className="flex items-center justify-center gap-x-6 w-fit mx-auto mt-12">
                    {mini_descriptions.map((item, index) => (
                        <div
                            style={{ backgroundColor: `${item.color}` }}
                            className="dark:bg-neutral-800 bg-neutral-300 flex items-center justify-center gap-x-3 px-3 py-2 rounded-xl"
                            key={index}
                        >
                            <span className="dark:text-black text-black">{item.icon}</span>
                            <span className="text-sm font-normal dark:text-neutral-800 text-neutral-800">
                                {item.description}
                            </span>
                        </div>
                    ))}
                </div>
                <CustomFeatureComponent />
                <Faq />
            </div>

            <div className="fixed bottom-6 right-8 z-90">
                <HomeScreenJoinQuizButton />
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
            <HomeScreenFooter />
        </div>
    );
}
