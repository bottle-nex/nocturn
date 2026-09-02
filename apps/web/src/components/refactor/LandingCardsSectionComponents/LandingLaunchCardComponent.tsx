'use client';
import { MdOutlineRocketLaunch } from 'react-icons/md';
import LandingCardHeader from './LandingCardHeader';
import Image from 'next/image';
import PerspectiveCard from '@/components/utility/PerspectiveCard';

export default function LandingLaunchCardComponent() {
    return (
        <PerspectiveCard
            delay={0.09}
            className="mt-20 relative w-full h-100 rounded-xl bg-[#00AEFF] shadow-[0_8px_30px_rgba(0,0,0,0.05)] overflow-hidden p-6"
        >
            <style>{`
                @keyframes orbit-a {
                    from { transform: translate(-50%, -50%) rotate(0deg) translateX(110px) rotate(0deg); }
                    to   { transform: translate(-50%, -50%) rotate(360deg) translateX(110px) rotate(-360deg); }
                }
                @keyframes orbit-b {
                    from { transform: translate(-50%, -50%) rotate(120deg) translateX(110px) rotate(-120deg); }
                    to   { transform: translate(-50%, -50%) rotate(480deg) translateX(110px) rotate(-480deg); }
                }
                @keyframes orbit-c {
                    from { transform: translate(-50%, -50%) rotate(240deg) translateX(110px) rotate(-240deg); }
                    to   { transform: translate(-50%, -50%) rotate(600deg) translateX(110px) rotate(-600deg); }
                }
            `}</style>

            <LandingCardHeader
                title="Launch quiz"
                description="Configure everything before your quiz goes live"
            />

            <div
                className="h-55 w-55 rounded-full absolute left-1/2 -translate-x-1/2 flex justify-center items-center ring-1 ring-white/10 bg-white/5 shadow-[0_0_35px_rgba(0,0,0,0.03)]"
                style={{ top: '8.25rem' }}
            >
                <div className="h-35 w-35 rounded-full flex justify-center items-center ring-1 ring-white/10 bg-white/8 shadow-[0_0_25px_rgba(0,0,0,0.08)]">
                    <div className="h-15 w-15 rounded-full flex justify-center items-center bg-white/12 ring-1 ring-white/10 shadow-[0_0_15px_rgba(0,0,0,0.10)]">
                        <MdOutlineRocketLaunch className="size-5 text-white" />
                    </div>
                </div>
            </div>

            {[
                {
                    anim: 'orbit-a 16s linear infinite',
                    flip: false,
                    src: '/images/landing/avatar4.png',
                },
                {
                    anim: 'orbit-b 16s linear infinite',
                    flip: false,
                    src: '/images/landing/avatar3.png',
                },
                {
                    anim: 'orbit-c 16s linear infinite',
                    flip: false,
                    src: '/images/landing/avatar5.png',
                },
            ].map(({ anim, flip, src }, i) => (
                <div
                    key={i}
                    className={`rounded-full ring-1 ring-white/20 shadow-[0_0_12px_rgba(0,0,0,0.08)] bg-dark-base overflow-hidden absolute ${flip ? '-scale-x-[1]' : ''}`}
                    style={{
                        width: '2rem',
                        height: '2rem',
                        top: 'calc(8.25rem + 6.875rem)',
                        left: '50%',
                        transformOrigin: '0 0',
                        animation: anim,
                        willChange: 'transform',
                    }}
                >
                    <Image src={src} alt="" className="object-cover" fill unoptimized />
                </div>
            ))}
        </PerspectiveCard>
    );
}
