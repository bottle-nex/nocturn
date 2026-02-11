'use client';
import { FaGithub, FaRegCopyright, FaXTwitter } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { useRouter } from 'next/navigation';
import SigninModal from '../utility/SigninModal';

export default function Footer() {
    const { session, openSigninModal, setOpenSigninModal } = useUserSessionStore();
    const router = useRouter();

    function handleCreateQuizClick() {
        if (!session || !session.user.token) {
            setOpenSigninModal(true);
            return;
        }
        router.push('/home');
    }

    return (
        <>
            <div className="h-auto w-full flex flex-col justify-between items-between relative z-40">
                <footer className="relative w-screen h-[50vh] flex items-center bg-white">
                    <div className="w-full h-full flex p-4">
                        <div className="w-[13%] h-full p-2 flex flex-col gap-y-2">
                            <motion.div
                                className="h-full w-full rounded-xl bg-[#1b1b1b] flex justify-center items-center text-white cursor-pointer shadow-sm"
                                whileHover={{ scale: 0.95 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 20,
                                }}
                            >
                                <a href="">
                                    <FaXTwitter className="size-20" />
                                </a>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 0.95 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 300,
                                    damping: 20,
                                }}
                                className="h-full w-full rounded-xl bg-[#1b1b1b] flex justify-center items-center text-white hover:scale-95 cursor-pointer shadow-sm"
                            >
                                <a
                                    href="https://github.com/bottle-nex/nocturn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaGithub className="size-20" />
                                </a>
                            </motion.div>
                        </div>

                        <div className="w-[87%] h-full p-2 flex justify-between">
                            <div className="bg-nprimary h-full w-full flex justify-between rounded-xl p-7 py-8 noise-bg shadow-sm">
                                <div className="w-[30%] h-full flex flex-col justify-between">
                                    <div className="text-7xl font-bold text-light-base tracking-tight">
                                        <div>NOCTURN</div>
                                        <div className="text-xl tracking-wide font-normal text-light-base/80 uppercase">
                                            Smart people love this app
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-x-1.5 text-base text-ndarkest font-semibold tracking-tight">
                                        <FaRegCopyright className="mb-0.5 size-4.5" />
                                        <span>2025 All right reserved</span>
                                    </div>
                                </div>

                                <div className="w-[15%] h-full flex flex-col justify-between text-ndarkest">
                                    <div className="flex flex-col items-start gap-y-1 text-xl font-semibold">
                                        <span
                                            onClick={handleCreateQuizClick}
                                            className="hover:underline cursor-pointer"
                                        >
                                            HOME
                                        </span>
                                        <span className="hover:underline cursor-pointer">
                                            GET STARTED
                                        </span>
                                        <span className="hover:underline cursor-pointer">
                                            FOUNDERS
                                        </span>
                                        <span className="hover:underline cursor-pointer">
                                            GUIDE
                                        </span>
                                        <span className="hover:underline cursor-pointer">
                                            CONTACT
                                        </span>
                                    </div>

                                    <div className="text-base text-ndarkest font-semibold flex flex-col">
                                        <div className="hover:underline cursor-pointer">BRAND</div>
                                        <div className="hover:underline cursor-pointer">
                                            PRIVACY NOTICE
                                        </div>
                                        <div className="hover:underline cursor-pointer">
                                            TERMS OF SERVICE
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
                {openSigninModal && <SigninModal />}
            </div>
        </>
    );
}
