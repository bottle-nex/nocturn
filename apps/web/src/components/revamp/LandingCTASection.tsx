'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import RiveComponent from '../ui/Rives/RIveComponent';

export default function LandingCTASection() {
    return (
        <section className="h-160 w-full relative p-6">
            <div className="relative h-full rounded-3xl overflow-hidden flex justify-between p-8 gap-8 ring-1 ring-black/10 shadow-xs shadow-black/5 bg-[#FFE65C]">
                <div className="h-full w-full bg-light-alpha p-10 flex justify-between rounded-[10px]">
                    <article className="w-[50%] h-full flex flex-col justify-between">
                        <div className="flex gap-x-2">
                            <div className="bg-dark-base text-light-base w-fit text-[26px] font-normal px-9 h-17 flex items-center rounded-full">
                                Start creating your first noc
                            </div>

                            <div className="relative h-18 w-18 rounded-full overflow-hidden">
                                <Image
                                    src="/images/landing/smilingCat.png"
                                    alt=""
                                    fill
                                    unoptimized
                                    className="object-contain"
                                />
                            </div>
                        </div>

                        <p className="text-4xl text-dark-base">
                            Stake-based quiz platform transforms learning into a competitive and
                            rewarding experience.
                        </p>

                        <div className="flex flex-wrap gap-5">
                            <RedirectButton name="Create quiz" redirectUrl="/home" />
                            <RedirectButton name="Join quiz" redirectUrl="/home" />
                            <RedirectButton name="My Quizzes" redirectUrl="/home" />
                            <RedirectButton name="Chat with AI" redirectUrl="/home" />
                        </div>
                    </article>

                    <aside className="relative h-full w-[50%] bg-light-alpha flex flex-col p-10 gap-y-3">
                        <div className="absolute -bottom-101 left-1/2 -translate-x-1/2 h-300 w-300">
                            <RiveComponent
                                url="/rive/meeples.riv"
                                animationName={['Clouds', 'Meeples']}
                            />
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}

interface RedirectButtonProps {
    name: string;
    redirectUrl: string;
}

function RedirectButton({ name, redirectUrl }: RedirectButtonProps) {
    const { session } = useUserSessionStore();
    const router = useRouter();

    const handleClick = () => {
        if (!session?.user.token) return;
        router.push(redirectUrl);
    };

    return (
        <Button
            onClick={handleClick}
            className={cn(
                'text-2xl h-14 px-7 rounded-full',
                'bg-dark-base/5 hover:bg-light-base text-dark-base',
                'hover:-translate-y-0.5 transition-all transform duration-250 active:scale-95',
                'ring-1 ring-black/5 shadow-sm shadow-black/5',
            )}
        >
            {name}
        </Button>
    );
}
