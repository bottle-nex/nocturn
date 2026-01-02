import { BsDot } from "react-icons/bs"
import { MdCopyright } from "react-icons/md"

export default function NewFooter() {
    return (
        <div className="bg-[#141414] h-screen h-full w-full flex flex-col items-center pt-25 px-20">

            <div className="flex justify-between w-full h-[90%]">
                <div className="text-5xl max-w-xl font-semibold leading-13 tracking-wide text-[#FDF9F0]">
                    Play quick quizzes that actually make you smarter.
                </div>

                <div className="flex">
                    <div className="flex flex-col border-l border-dashed px-10 text-[#FDF9F0]">
                        <div className="text-[17px] text-light-base/50 tracking-wider mb-4">
                            PLATFORM
                        </div>

                        <div className="flex flex-col gap-y-0.5 text-[21px]">
                            {platformLinks.map((link) => (
                                <a className="hover:underline" href={link.link}>{link.title}</a>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col border-l border-dashed px-10 text-[#FDF9F0]">
                        <div className="text-[17px] text-light-base/50 tracking-wider mb-4">
                            COMPANY
                        </div>

                        <div className="flex flex-col gap-y-0.5 text-[21px]">
                            {companyLinks.map((link) => (
                                <a className="hover:underline" href={link.link}>{link.title}</a>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col border-l border-dashed px-10 text-[#FDF9F0]">
                        <div className="text-[17px] text-light-base/50 tracking-wider mb-4">
                            REACH OUT
                        </div>

                        <div className="flex flex-col gap-y-0.5 text-[21px]">
                            {contactLinks.map((link) => (
                                <a className="hover:underline" href={link.link}>{link.title}</a>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col border-l border-dashed px-10 text-[#FDF9F0]">
                        <div className="text-[17px] text-light-base/50 tracking-wider mb-4">
                            SOCIALS
                        </div>

                        <div className="flex flex-col gap-y-0.5 text-[21px]">
                            {socialLinks.map((link) => (
                                <a className="hover:underline tracking-wide" href={link.link}>{link.title}</a>
                            ))}
                        </div>
                    </div>

                </div>

            </div>

            <div className="w-full border-t border-b border-dashed flex items-center justify-between h-[10%]">
                <div className="flex gap-x-1 items-center text-md text-light-base/50">
                    <MdCopyright /> All rights reserved 2025
                </div>

                <div className="flex gap-x-2 items-center text-md text-light-base/50">
                    <span>Terms</span>
                    <span><BsDot /></span>
                    <span>Privacy</span>
                </div>
            </div>
            <div className="text-[21rem] text-[#fdf9f028] font-bold leading-70 tracking-wide mt-10">
                NOCTURN
            </div>
        </div>
    )
}

const platformLinks = [
    { title: 'Home', link: '' },
    { title: 'Dashboard', link: '' },
    { title: 'Quiz', link: '' },
    { title: 'Documentation', link: '' },
]

const socialLinks = [
    { title: 'Twitter', link: '' },
    { title: 'GitHub', link: '' },
    { title: 'LinkedIn', link: '' },
]

const contactLinks = [
    { title: 'Mail', link: '' },
    { title: 'Blog', links: '' }
]

const companyLinks = [
    { title: 'Security', link: '' },
    { title: 'Founders', link: '' },
    { title: 'Contributors', link: '' },
]