import { motion } from 'framer-motion';
import Image from 'next/image';
import { JSX } from 'react';
import { FiCheck } from 'react-icons/fi';
import { RxCross2 } from 'react-icons/rx';

export function ManageCardContent(): JSX.Element {
    return (
        <motion.div
            initial="initial"
            whileHover="hover"
            className="w-55 h-55 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-2xl bg-white shrink-0 overflow-hidden"
        >
            <div className="relative p-4 h-full flex items-center justify-center">
                <div className="relative w-full h-[180px]">
                    <UserRow
                        imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-11.jpg"
                        success
                        slots={[0, 2, 1]}
                    />

                    <UserRow
                        imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-13.jpg"
                        success={false}
                        slots={[1, 0, 2]}
                    />

                    <UserRow
                        imgUrl="https://dejbzabt9zak1.cloudfront.net/avatars/avatar-14.jpg"
                        success
                        slots={[2, 1, 0]}
                    />
                </div>
            </div>
        </motion.div>
    );
}

function UserRow({
    success,
    imgUrl,
    slots,
}: {
    success: boolean;
    imgUrl: string;
    slots: number[];
}): JSX.Element {
    const ROW_HEIGHT = 44;
    const ROW_GAP = 10;
    const SLOT = ROW_HEIGHT + ROW_GAP;

    return (
        <motion.div
            className="absolute left-0 right-0"
            variants={{
                initial: {
                    y: slots[0] * SLOT,
                },
                hover: {
                    y: slots.map((s) => s * SLOT),
                },
            }}
            transition={{
                duration: 2,
                ease: [0.22, 1, 0.36, 1],
                repeat: Infinity,
                repeatType: 'loop',
            }}
        >
            <div className="flex items-center gap-3 p-2 bg-light-base rounded-xl ring-1 ring-black/10 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-100 overflow-hidden relative">
                    <Image src={imgUrl} alt="img" fill unoptimized className="object-cover" />
                </div>

                <div className="flex-1 h-1.5 bg-light-base rounded-full overflow-hidden relative">
                    <div
                        className={`absolute left-0 top-0 h-full ${
                            success ? 'bg-indigo-500 w-full' : 'bg-neutral-400/80 w-1/3'
                        }`}
                    />
                </div>

                <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        success ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                    }`}
                >
                    {success ? <FiCheck className="w-3 h-3" /> : <RxCross2 className="w-3 h-3" />}
                </div>
            </div>
        </motion.div>
    );
}
