'use client';

import OpacityBackground from './OpacityBackground';
import { Button } from '../ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { signIn } from 'next-auth/react';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';

export default function SigninModal() {
    const { openSigninModal, setOpenSigninModal } = useUserSessionStore();

    if (!openSigninModal) return null;

    function singinHandler(type: 'github' | 'google') {
        signIn(type, { callbackUrl: '/' });
    }

    return (
        <OpacityBackground onBackgroundClick={() => setOpenSigninModal(false)}>
            <section className="relative bg-white border-2 border-black w-105 max-w-[90vw]">
                <div className="bg-[#FF3F7F] border-b-2 border-black px-6 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white tracking-wide">Sign in</h1>
                    <button
                        type="button"
                        title="Close"
                        aria-label="Close modal"
                        onClick={() => setOpenSigninModal(false)}
                        className="text-white hover:text-tprime transition-colors cursor-pointer"
                    >
                        <X size={24} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="mb-2">
                        <span className={cn('text-tprime font-bold text-2xl')}>Nocturn</span>
                    </div>
                    <p className="text-neutral-600 text-sm mb-6">
                        Choose your preferred sign in method
                    </p>

                    <Button
                        className="w-full rounded-none shadow-custom border-2 border-black bg-white hover:bg-neutral-50 text-tprime py-6 font-medium"
                        onClick={() => singinHandler('github')}
                    >
                        <Image
                            src="/socials/github.webp"
                            alt="GitHub"
                            width={20}
                            height={20}
                            className="mr-2"
                        />
                        Continue with GitHub
                    </Button>

                    <Button
                        className="w-full rounded-none shadow-custom border-2 border-black bg-white hover:bg-neutral-50 text-tprime py-6 font-medium"
                        onClick={() => singinHandler('google')}
                    >
                        <Image
                            src="/images/google.png"
                            alt="Google"
                            width={20}
                            height={20}
                            className="mr-2"
                        />
                        Continue with Google
                    </Button>
                </div>
            </section>
        </OpacityBackground>
    );
}
