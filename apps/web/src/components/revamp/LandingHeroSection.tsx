import Image from 'next/image';
import { BsFillEmojiLaughingFill } from 'react-icons/bs';
import { FaLocationArrow } from 'react-icons/fa6';
import { FiPlus } from 'react-icons/fi';
import { MdQuiz } from 'react-icons/md';
import { PiPencilSimpleLineFill } from 'react-icons/pi';

export default function LandingHeroSection() {
    return (
        <div className="flex flex-col mt-42 gap-y-10 items-center h-full max-h-screen w-full relative">
            <div className="flex flex-col -space-y- max-w-[40rem] text-center">
                <div className="text-[#1b1b1b] text-[75px] font-semibold flex flex-col">
                    {/* The fastest way to turn knowledge into SOL */}
                    Outthink the room
                </div>

                <div className="text-[#1b1b1b]/95 text-[22px] tracking-wide leading-7">
                    A real-time quiz platform powered by Solana. Stake SOL, answer live questions,
                    and earn rewards instantly.
                </div>
            </div>
            <div className="absolute inset-0 pointer-events-none">
                <svg
                    viewBox="0 0 1600 400"
                    className="w-full h-full"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M-200 260 C 200 60, 600 460, 1000 240 C 1200 120, 1500 360, 1800 260"
                        stroke="#d6e95b"
                        strokeWidth="3"
                        fill="none"
                    />

                    <path
                        d="M-200 300 C 300 120, 700 480, 1100 260 C 1300 140, 1600 420, 2000 300"
                        stroke="#d6e95b"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.7"
                    />
                </svg>
            </div>

            <div className="bg-[#EBEEEB] h-80 w-143 rounded-3xl relative p-10">
                <div className="absolute top-40 right-15 -rotate-90 z-10">
                    <FaLocationArrow className="size-10 text-[#0FA655]" />
                </div>
                <div className="bg-[#0FA655] px-3 py-2.5 absolute top-46 -right-16 z-10 rounded-full text-base tracking-wide flex items-center gap-x-2">
                    <div className="h-7 w-7 rounded-full overflow-hidden relative">
                        <Image
                            src={'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-1.jpg'}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                        />
                    </div>
                    <span>Piyush Raj</span>
                </div>

                {/* lines */}
                <div className="h-0.5 w-full left-0 bottom-17 absolute bg-white" />
                <div className="h-full w-0.5 left-25 top-0 absolute bg-white" />
                <div className="h-full w-0.5 left-50 top-0 absolute bg-white" />
                <div className="h-full w-0.5 left-75 top-0 absolute bg-white" />
                <div className="h-full w-0.5 left-100 top-0 absolute bg-white" />

                <div className="flex gap-x-2.5 relative z-10">
                    <div className="bg-white  text-black h-13 w-13 flex justify-center items-center rounded-full shadow-xs">
                        <FiPlus className="size-8 text-[#4433c3]" />
                    </div>
                    <div className="bg-white text-black h-13 w-13 flex justify-center items-center rounded-full shadow-xs">
                        <PiPencilSimpleLineFill className="size-7 text-[#0FA655]" />
                    </div>
                    <div className="bg-white text-black h-13 w-13 flex justify-center items-center rounded-full shadow-xs">
                        <BsFillEmojiLaughingFill className="size-7 text-[#FB4914]" />
                    </div>
                    <div className="bg-white text-black h-13 w-13 flex justify-center items-center rounded-full shadow-xs">
                        <MdQuiz className="size-7 text-[#1f82ec]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
