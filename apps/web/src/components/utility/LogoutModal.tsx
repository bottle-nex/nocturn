'use client';
import OpacityBackground from './OpacityBackground';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RxCross2 } from 'react-icons/rx';

export default function LogoutModal() {
    const { openLogoutModal, setOpenLogoutModal } = useUserSessionStore();

    if (!openLogoutModal) return null;

    function handleLogout() {
        signOut({ callbackUrl: '/' });
    }

    return (
        <OpacityBackground onBackgroundClick={() => setOpenLogoutModal(false)}>
            <section className="relative bg-nlighter border-2 border-black max-w-85 w-full rounded-md overflow-hidden shadow-sm">
                <div className="bg-ndarkest border-b-2 border-black flex items-center justify-between h-full w-full">
                    <div className="relative h-30 w-full bg-red-600">
                        <Image
                            src={'/images/landing/buttonPressRed.png'}
                            alt="sign-in image"
                            className="object-cover"
                            fill
                            unoptimized
                        />
                    </div>
                    <motion.button
                        type="button"
                        aria-label="Close modal"
                        onClick={() => setOpenLogoutModal(false)}
                        className="text-ndarkest transition-colors cursor-pointer absolute right-3 top-3 bg-nlighter rounded-full p-1 hover:bg-ndarkest hover:text-nlighter shadow-sm"
                    >
                        <RxCross2 size={15} strokeWidth={0.8} className="" />
                    </motion.button>
                </div>

                <div className="p-6 flex flex-col ">
                    <div className="font-semibold text-ndarkest px-2 py-px text-sm rounded-[4px] mb-1 text-center">
                        NOCTURN
                    </div>
                    <div className="text-ndarkest text-2xl font-bold mb-1 text-center">
                        Leaving already?
                    </div>
                    <div className="text-ndarker text-[14px] mb-5 text-center flex flex-col -space-y-1 flex flex-col items-center">
                        Your progress is saved. Come back anytime!
                    </div>
                    {/* <div className="mb-2">
                        <span className={cn('text-tprime font-bold text-2xl')}>Nocturn</span>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-neutral-50 border-2 border-black">
                        <div className="w-12 h-12 bg-[#FFC400] border-2 border-black flex items-center justify-center">
                            <LogOut size={24} className="text-tprime" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-tprime">Leaving so soon?</h2>
                            <p className="text-neutral-600 text-sm">
                                Your progress is saved. Come back anytime!
                            </p>
                        </div>
                    </div>

                    <p className="text-neutral-500 text-sm text-center">
                        Are you sure you want to sign out of your account?
                    </p> */}

                    <div className="flex gap-3">
                        <motion.button
                            className="flex justify-center items-center w-full h-12 rounded-[8px] border-2 border-ndarkest bg-nlighter hover:bg-[#eae8f3] transition-colors transform duration-300 text-ndarkest py-6 font-medium cursor-pointer shadow-xs"
                            onClick={() => setOpenLogoutModal(false)}
                        >
                            Cancel
                        </motion.button>

                        <motion.button
                            className="flex justify-center items-center w-full h-12 rounded-[8px] border-2 border-ndarkest bg-[#CD0E0F] hover:bg-[#c50e0e] text-white py-6 font-medium cursor-pointer shadow-xs"
                            onClick={handleLogout}
                        >
                            <LogOut size={18} className="mr-2" />
                            Sign out
                        </motion.button>
                    </div>
                </div>
            </section>
        </OpacityBackground>
    );
}
