'use client';
import Image from 'next/image';
import LandingHeaderComponent from './LandingHeaderComponent';
import PerspectiveCard from '@/components/utility/PerspectiveCard';

export default function LandingPublishCardComponent() {
    return (
        <PerspectiveCard 
        delay={0.04}
        className="mt-20 relative w-full h-100 rounded-xl bg-[#ffd670] shadow-xs shadow-black/5 overflow-hidden p-6">
            <LandingHeaderComponent
                title="Publish quiz"
                description="Configure everything before your quiz goes live"
            />

            <div className="absolute h-70 w-80 rounded-2xl ring-1 ring-black/10 -bottom-5 -right-20 bg-light-alpha/20" />
            <div className="absolute h-70 w-80 rounded-2xl ring-1 ring-black/10 -bottom-8 -right-15 z-10 bg-light-alpha/80" />

            <div className="absolute h-70 w-80 rounded-2xl ring-1 ring-black/10 -bottom-11 -right-10 z-20 bg-light-alpha overflow-hidden">
                <div className="absolute inset-0 pointer-events-none backdrop-blur-[1px]" />

                <div className="h-10 w-36 ring-1 ring-black/5 shadow-xs shadow-black/5 absolute top-3 left-1/2 -translate-x-1/2 rounded-sm bg-light-alpha flex items-center justify-between px-1">
                    <div className="h-8 w-8 relative rounded-xs overflow-hidden shrink-0">
                        <Image
                            src={'/images/landing/avatar1.png'}
                            alt=""
                            className="object-contain"
                            fill
                            unoptimized
                        />
                    </div>
                    <div className="flex flex-col gap-1 pr-1">
                        <div className="h-3 w-24 bg-light-base rounded-xs" />
                        <div className="h-2 w-20 bg-light-base rounded-xs" />
                    </div>
                </div>
            </div>
        </PerspectiveCard>
    );
}
