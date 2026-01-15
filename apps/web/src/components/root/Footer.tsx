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
            <div className="h-auto w-full bg-black flex flex-col justify-between items-between relative z-40">
                {/* <div className="h-auto w-full relative z-50 flex overflow-x-auto pt-20">
                    <div className='flex gap-x-3'>
                        <div className="h-40 w-40 rounded-full relative overflow-hidden">
                            <Image
                                src={'/images/landing/solCoin.png'}
                                alt=""
                                className="object-contain"
                                fill
                                unoptimized
                            />
                        </div>

                        <div className='h-auto w-auto min-w-fit bg-[#FB4914] flex justify-center items-center px-9 font-bold text-black text-8xl rounded-xl'>
                            SOLANA STAKES
                        </div>

                    </div>

                </div> */}
                <footer className="relative w-screen h-[50vh] flex items-center">
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
                            <div className="bg-nprimary h-full w-full flex justify-between rounded-xl p-7 py-8 noise-bg shadow-sm">
                                <div className="w-[30%] h-full flex flex-col justify-between">
                                    <div className="text-7xl font-bold text-ndarkest tracking-tight">
                                        <div>NOCTURN</div>
                                        <div className="text-xl tracking-normal font-semibold uppercase">
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
                                        <span className="hover:underline cursor-pointer">HOME</span>
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
            </div>
        </>
    );
}
