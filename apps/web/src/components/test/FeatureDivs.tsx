'use client';
import { FaThumbsUp } from 'react-icons/fa6';
import { IoIosHeart, IoIosPeople } from 'react-icons/io';
import VoiceIcon from '../ui/svg/VoiceIcon';
import Image from 'next/image';

export function Collaborators() {
    return (
        <div className="absolute left-1/2 -translate-x-1/2 -top-37 text-dark-base ring-1 ring-black/10 shadow-md shadow-black/5 w-50 h-15 text-xl rounded-xl bg-light-alpha flex items-center justify-center gap-x-3">
            <div className="w-8.5 h-8.5 aspect-square flex justify-center items-center rounded-[3rem] relative overflow-hidden ring-1 ring-alpha shadow-md shadow-black/5 bg-alpha/30">
                <IoIosPeople className="text-alpha size-5.5" />
            </div>
            <div className="flex flex-col -space-y-1.5">
                <div>Collaborators</div>
                <div className="text-xs text-dark-base/50 tracking-wide">BUILD IN TEAM</div>
            </div>
        </div>
    );
}

export function Interactions() {
    return (
        <div className="absolute -right-0 -bottom-37 text-dark-base ring-1 ring-black/10 shadow-md shadow-black/5 rounded-xl w-46 h-14 text-xl bg-light-alpha flex items-center justify-center gap-x-3">
            <div className="w-8.5 h-8.5 aspect-square flex justify-center items-center rounded-[3rem] relative overflow-hidden ring-1 ring-[#FEC41E] shadow-md shadow-black/5 bg-[#FEC41E30]">
                <FaThumbsUp className="text-[#ffac11] size-5" />
            </div>
            <div className="flex flex-col -space-y-1.5">
                <div>Interactions</div>
                <div className="text-xs text-dark-base/50 tracking-wide">KEEP IT FUN</div>
            </div>
        </div>
    );
}

export function ThemedQuizzes() {
    return (
        <div className="absolute -right-110 top-30 text-dark-base ring-1 ring-black/10 shadow-md shadow-black/5 rounded-xl w-59 h-15 text-xl bg-light-alpha flex items-center justify-center gap-x-3">
            <div className="flex -space-x-1.5">
                <div className="h-5 w-5 bg-alpha rounded-full shadow-xs" />
                <div className="h-5 w-5 bg-[#09C92F] rounded-full shadow-xs" />
                <div className="h-5 w-5 bg-[#FF6D38] rounded-full shadow-xs" />
            </div>
            <div className="flex flex-col -space-y-1.5">
                <div>Themed Quizzes</div>
                <div className="text-xs text-dark-base/50 tracking-wide">CHOOSE YOUR VIBE</div>
            </div>
        </div>
    );
}

export function AudiencePoll() {
    return (
        <div className="absolute -right-70 -top-5 text-dark-base ring-1 ring-black/10 shadow-md shadow-black/5 rounded-xl w-50 h-14 text-xl bg-light-alpha flex items-center justify-center gap-x-3">
            <div className="w-8.5 h-8.5 aspect-square flex justify-center items-center rounded-[3rem] relative overflow-hidden ring-1 ring-pink-500/80 shadow-md shadow-black/5 bg-pink-500/30">
                <IoIosHeart className="text-pink-500" />
            </div>
            <div className="flex flex-col -space-y-1.5">
                <div>Audience Poll</div>
                <div className="text-xs text-dark-base/50 tracking-wide">LIFE SAVERS</div>
            </div>
        </div>
    );
}

export function AIPoweredGeneration() {
    return (
        <div className="absolute -left-107 top-60 text-dark-base ring-1 ring-black/10 shadow-md shadow-black/5 w-70 h-15 text-xl rounded-xl bg-light-alpha flex items-center justify-center gap-x-3">
            <div className="w-8.5 h-8.5 aspect-square flex justify-center items-center rounded-[3rem] relative overflow-hidden ring-1 ring-black/10 shadow-md shadow-black/5">
                <VoiceIcon />
            </div>
            <div className="flex flex-col -space-y-1.5">
                <div>AI-powered Generation</div>
                <div className="text-xs text-dark-base/50 tracking-wide">
                    YOU CAN PROCASTINATE !
                </div>
            </div>
        </div>
    );
}

export function SolanaStaking() {
    return (
        <div className="absolute -left-74 top-10 text-dark-base ring-1 ring-black/10 shadow-md shadow-black/5 w-52 h-15 text-xl rounded-xl bg-light-alpha flex items-center justify-center gap-x-3">
            <div className="w-8.5 h-8.5 aspect-square flex justify-center items-center rounded-[3rem] relative overflow-hidden ring-1 ring-black/10 shadow-md shadow-black/5 bg-dark-alpha">
                <Image
                    src="/images/SOLANA.svg"
                    alt="logo"
                    fill
                    unoptimized
                    className="object-contain p-2"
                />
            </div>
            <div className="flex flex-col -space-y-1.5">
                <div>Solana staking</div>
                <div className="text-xs text-dark-base/50 tracking-wide">EASY MONEY</div>
            </div>
        </div>
    );
}
