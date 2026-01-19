'use client';
import OpacityBackground from './OpacityBackground';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { RxCross2 } from 'react-icons/rx';

export default function SigninModal() {
    const { openSigninModal, setOpenSigninModal } = useUserSessionStore();

    if (!openSigninModal) return null;

    function singinHandler(type: 'github' | 'google') {
        signIn(type, { callbackUrl: '/' });
    }

    return (
        <OpacityBackground onBackgroundClick={() => setOpenSigninModal(false)}>
            <motion.section
                exit={{
                    opacity: 0,
                    scale: 0.98,
                    filter: 'blur(10px)',
                }}
                transition={{
                    duration: 0.3,
                    ease: 'easeInOut',
                }}
                className="relative bg-nlighter border-2 border-black w-100 max-w-[90vw] rounded-3xl overflow-hidden shadow-sm"
            >
                <div className="bg-ndarkest border-b-2 border-black flex items-center justify-between h-full w-full">
                    <div className="relative h-30 w-full bg-red-600">
                        <Image
                            src={'/images/landing/buttonPress.jpg'}
                            alt="sign-in image"
                            className="object-cover"
                            fill
                            unoptimized
                        />
                    </div>
                    <motion.button
                        type="button"
                        aria-label="Close modal"
                        onClick={() => setOpenSigninModal(false)}
                        className="text-ndarkest transition-colors cursor-pointer absolute right-3 top-3 bg-nlighter rounded-full p-1 hover:bg-ndarkest hover:text-nlighter shadow-xs transition-colors duration-250"
                    >
                        <RxCross2 size={15} strokeWidth={0.8} className="" />
                    </motion.button>
                </div>

                <div className="p-6 flex flex-col items-center tracking-wide">
                    <div className="font-semibold text-ndarkest px-2 py-px text-sm rounded-[4px] mb-1">
                        NOCTURN
                    </div>
                    <div className="text-ndarkest text-2xl font-bold mb-1">
                        Your next question awaits
                    </div>
                    <p className="text-ndarker text-[14px] mb-5 text-center flex flex-col -space-y-1">
                        Choose your preferred sign in method
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 18,
                        }}
                        className="w-full h-12 rounded-lg border-2 border-ndarkest bg-nprimary text-ndarkest py-6 font-semibold text-base mb-3 flex items-center justify-center cursor-pointer"
                        onClick={() => singinHandler('github')}
                    >
                        <Image
                            src="/socials/github.webp"
                            alt="GitHub"
                            width={22}
                            height={22}
                            className="mr-3 mb-px"
                        />
                        Continue with GitHub
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 18,
                        }}
                        className="w-full h-12 rounded-lg border-2 border-ndarkest bg-nprimary text-ndarkest py-6 font-semibold text-base mb-2 flex items-center justify-center cursor-pointer"
                        onClick={() => singinHandler('google')}
                    >
                        <Image
                            src="/images/google.png"
                            alt="Google"
                            width={25}
                            height={25}
                            className="mr-2"
                        />
                        Continue with Google
                    </motion.button>
                </div>
            </motion.section>
        </OpacityBackground>
    );
}
