'use client';
import { FaGithub, FaRegCopyright, FaXTwitter } from 'react-icons/fa6';
import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <>
            {/* <div className="w-full -mt-16 z-30 relative">
                <Image
                    src="/images/footer-img.svg"
                    alt="Nocturn Logo"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-auto"
                />
            </div> */}
            <footer className="relative w-screen bg-black h-[50vh] flex items-center rounded-t-xl">
                <div className="w-full h-full flex p-4">
                    <div className="w-[13%] h-full p-2 flex flex-col gap-y-2">
                        <motion.div
                            className="h-full w-full rounded-xl bg-white flex justify-center items-center text-black cursor-pointer shadow-sm"
                            whileHover={{ scale: 0.95 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 20,
                            }}
                        >
                            <FaXTwitter className="size-20" />
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 0.95 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 20,
                            }}
                            className="h-full w-full rounded-xl bg-white flex justify-center items-center text-black hover:scale-95 cursor-pointer shadow-sm"
                        >
                            <FaGithub className="size-20" />
                        </motion.div>
                    </div>

                    <div className="w-[87%] h-full p-2 flex justify-between">
                        <div className="bg-[#8DD362] h-full w-full flex justify-between rounded-xl p-7 py-8 noise-bg shadow-sm">
                            <div className="w-[30%] h-full flex flex-col justify-between">
                                <div className="text-7xl font-bold text-tprime tracking-tight">
                                    <div>NOCTURN</div>
                                    <div className="text-xl tracking-normal font-semibold uppercase">
                                        Smart people love this app
                                    </div>
                                </div>

                                <div className="flex items-center gap-x-1.5 text-base text-tprime font-semibold tracking-tight">
                                    <FaRegCopyright className="mb-0.5 size-4.5" />
                                    <span>2025 All right reserved</span>
                                </div>
                            </div>

                            <div className="w-[15%] h-full flex flex-col justify-between text-tprime">
                                <div className="flex flex-col items-start gap-y-1 text-xl font-semibold">
                                    <span className="hover:underline cursor-pointer">HOME</span>
                                    <span className="hover:underline cursor-pointer">
                                        GET STARTED
                                    </span>
                                    <span className="hover:underline cursor-pointer">FOUNDERS</span>
                                    <span className="hover:underline cursor-pointer">GUIDE</span>
                                    <span className="hover:underline cursor-pointer">CONTACT</span>
                                </div>

                                <div className="text-base text-tprime font-semibold flex flex-col">
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
        </>
    );
}
