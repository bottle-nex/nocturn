import Image from 'next/image';
import { HiOutlinePlusSmall } from 'react-icons/hi2';
import VoiceIcon from '../ui/svg/VoiceIcon';

export default function LandingCardChatArea() {
    return (
        <div className="col-span-4 shadow-[inset_0_1px_1px_rgba(0,0,0,0.08)] bg-light-alpha ring-1 ring-black/10 rounded-beta h-92.5 w-full flex flex-col p-3 gap-y-4 relative ">
            <div className="w-full flex justify-end items-start gap-x-2">
                <div className="w-fit max-w-38 h-fit bg-light-base rounded-l-beta rounded-br-beta ring-1 ring-black/10 shadow-sm shadow-black/5 p-2 px-2.5 tracking-normal text-dark-base text-xs mt-3 flex flex-col">
                    <div>Create a quiz around rust language, keep difficulty as hard.</div>
                    <div className="text-[10px] text-dark-base tracking-wide flex justify-end w-full">
                        10:00 AM
                    </div>
                </div>
                <div className="relative h-7 w-7 rounded-full overflow-hidden ring-1 ring-black/5 shadow-xs shadow-black/5">
                    <Image
                        src={'https://dejbzabt9zak1.cloudfront.net/avatars/avatar-1.jpg'}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                    />
                </div>
            </div>

            <div className="w-full flex justify-start items-start gap-x-2">
                <div className="relative h-7 w-7 rounded-full overflow-hidden ring-1 ring-black/10 shadow-sm shadow-black/5 bg-dark-base">
                    <Image
                        src={'/images/cat.png'}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover mt-1 ml-1"
                    />
                </div>
                <div className="w-fit max-w-38 h-fit bg-[#4F46E5] rounded-r-beta rounded-bl-beta ring-1 ring-black/10 shadow-xs shadow-black/5 p-2 px-2.5 tracking-normal text-light-base text-xs mt-3 flex flex-col">
                    <div>Thats an excellent choice, I will create a quiz around rust language.</div>
                    <div className="text-[10px] text-light-base tracking-wide w-full flex justify-end">
                        10:00 AM
                    </div>
                </div>
            </div>

            <div className="w-full flex justify-start items-start gap-x-2 ml-[37px]">
                <div className="w-fit max-w-38 h-fit bg-[#4F46E5] rounded-r-beta rounded-bl-beta ring-1 ring-black/10 shadow-xs shadow-black/5 p-2 px-2.5 tracking-normal text-light-base text-xs flex flex-col">
                    <div>
                        Created a quiz for you around rust language with difficulty level as hard.
                    </div>
                    <div className="h-2.5"></div>
                    <div className="flex">
                        <span className="tracking-wide">Title</span>: Rust as a language
                    </div>
                    <div className="text-[10px] text-light-base tracking-wide w-full flex justify-end mt-px">
                        10:00 AM
                    </div>
                </div>
            </div>

            {/* <div className='w-full relative'>
                                        <EmptyCanvas
                                            className="aspect-video max-w-50 cursor-auto rounded-alpha ring-1 ring-black/10 shadow-sm shadow-black/5 ml-[37px]"
                                            template={activeTemplate}
                                        />

                                        <div className='absolute text-dark-base top-9.5 left-23 flex items-center gap-x-1 bg-light-alpha px-2 py-1 ring-1 ring-black/10 shadow-xs shadow-black/10 text-sm rounded-alpha cursor-pointer'>
                                            <PiPresentationChart className="size-5" />
                                            <div>
                                                Preview
                                            </div>
                                        </div>
                                    </div> */}

            <div className="ring-1 ring-black/10 shadow-sm shadow-black/5 text-dark-base w-[92%] h-8 rounded-full flex justify-between items-center px-1.5 bg-light-alpha absolute bottom-2 -translate-x-1/2 left-1/2">
                <div className="flex items-center gap-x-2">
                    <div className="h-5 w-5 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-full flex justify-center items-center bg-light-base text-dark-base">
                        <HiOutlinePlusSmall className="size-4" />
                    </div>
                    <div className="text-dark-base/50 text-[9px]">enter your prompt here..</div>
                </div>

                <div className="h-5 w-5 ring-1 ring-black/10 shadow-xs shadow-black/5 rounded-full flex justify-center items-center bg-light-base text-dark-base">
                    <VoiceIcon className="size-3.5" />
                </div>
            </div>
        </div>
    );
}
