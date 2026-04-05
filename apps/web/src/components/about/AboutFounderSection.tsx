'use client';
import { JSX, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import GrayscaleHoverImage from './GrayscaleHoverImage';
import LandingSectionHeader from '../refactor/LandingSectionHeader';
import { IconWrapper } from '../ui/IconWrapper';
import Image from 'next/image';
import Link from 'next/link';

function AnimatedParagraph({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    const ref = useRef<HTMLParagraphElement>(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.p
            ref={ref}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.25, delay, ease: 'easeOut' }}
            className="text-base text-dark-base/80 leading-relaxed mt-3.5"
        >
            {children}
        </motion.p>
    );
}

function AnimatedHeading({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLParagraphElement>(null);
    const inView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.p
            ref={ref}
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.p>
    );
}

export default function AboutFounderSection(): JSX.Element {
    return (
        <main>
            <LandingSectionHeader
                heading="The Nocturn Story"
                subheading="Discover the journey of Nocturn, from its inception to its mission of empowering creators and revolutionizing the digital landscape."
            />
            {/* Rishi */}
            <section className="w-full grid grid-cols-[1fr_2fr] gap-x-8 mx-auto max-w-270 mt-16">
                <div className="">
                    <GrayscaleHoverImage
                        height={450}
                        width={420}
                        className="rounded-xl"
                        src="/images/founders/rishi.JPG"
                        alt="Rishi"
                    />
                </div>
                <div className="">
                    <div className="w-full flex items-center justify-between">
                        <AnimatedHeading className="text-3xl text-black">
                            Rishi Kant (Founder and Ceo)
                        </AnimatedHeading>
                        <div className="inline-flex space-x-2">
                            <Link href="https://www.linkedin.com/in/kant-linked/" target="_blank">
                                <IconWrapper>
                                    <Image
                                        src={'/icons/socials/linkedin.webp'}
                                        alt="LinkedIn"
                                        width={32}
                                        height={32}
                                        className=""
                                    />
                                </IconWrapper>
                            </Link>
                            <Link href="https://x.com/khairrishi" target="_blank">
                                <IconWrapper>
                                    <Image
                                        src={'/icons/socials/x.webp'}
                                        alt="X"
                                        width={32}
                                        height={32}
                                        className=""
                                    />
                                </IconWrapper>
                            </Link>
                        </div>
                    </div>
                    <section>
                        <AnimatedParagraph delay={0}>
                            I tried twice to get into Super 30, a six-month bootcamp by{' '}
                            <b>Harkirat Singh</b> focused on nurturing software engineers.
                            Didn&apos;t make it either time.
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.05}>
                            Instead of dwelling on it, I leaned into what I was good at, building
                            products. Around that time, <b>Harkirat</b> mentioned how interesting it
                            would be to have a platform where people could co-quiz with a host,
                            compete with each other, and stake prize pools. That idea stuck with me.
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.1}>
                            I started building the first version from scratch. Soon after, I brought
                            in <b>Anjan Suman</b> and <b>Piyush Raj</b>, and we began shaping it
                            into something real.
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.15}>
                            The product has been built with a strong focus on design and solid
                            engineering. We&apos;ve tackled real challenges across business logic,
                            trust simulation in contracts, and delivering a clean user experience.
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.2}>
                            As a team, we&apos;ve taken the product from zero to one. Now,
                            we&apos;re figuring out distribution and how to bring it to market.
                        </AnimatedParagraph>
                    </section>
                </div>
            </section>

            {/* Anjan */}
            <section className="w-full grid grid-cols-[2fr_1fr] gap-x-8 mx-auto max-w-270 mt-24">
                <div className="">
                    <div className="w-full flex items-center justify-between">
                        <AnimatedHeading className="text-3xl text-black">
                            Anjan Suman (Co-Founder)
                        </AnimatedHeading>
                        <div className="inline-flex space-x-2">
                            <Link href="https://www.linkedin.com/in/anjanstwt/" target="_blank">
                                <IconWrapper>
                                    <Image
                                        src={'/icons/socials/linkedin.webp'}
                                        alt="LinkedIn"
                                        width={32}
                                        height={32}
                                        className=""
                                    />
                                </IconWrapper>
                            </Link>
                            <Link href="https://x.com/anjanstwt" target="_blank">
                                <IconWrapper>
                                    <Image
                                        src={'/icons/socials/x.webp'}
                                        alt="X"
                                        width={32}
                                        height={32}
                                        className=""
                                    />
                                </IconWrapper>
                            </Link>
                        </div>
                    </div>
                    <section>
                        <AnimatedParagraph delay={0}>
                            I started the journey back in 2024 with a question in mind, will I make
                            it or leave it halfway?
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.05}>
                            But you know what they say…{' '}
                            <i>
                                &quot;if you truly desire something with all your heart, the whole
                                universe conspires to help you achieve it.&quot;
                            </i>
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.1}>
                            And then I met <b>Rishi</b> and <b>Piyush</b>, and aah they pushed me to
                            limits, they always say{' '}
                            <i>&quot;do it clean or don&apos;t do it.&quot;</i>
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.15}>
                            At the time, I was building some small projects, didn&apos;t know why.
                            Then in July, we sat in a meeting and Rishi said,{' '}
                            <i>&quot;let&apos;s build something real, something together&quot;</i>.
                            That&apos;s how Nocturn began.
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.2}>
                            From day one, Nocturn was built with a strong focus on user experience,
                            while staying equally committed to developer experience. It wasn&apos;t
                            easy, and still isn&apos;t, but it&apos;s worth it.
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.25}>
                            As a team, we haven&apos;t reached great heights yet, but we&apos;ve
                            built something just as important, trust. And soon, something we&apos;ve
                            been working on will be out in the market.
                        </AnimatedParagraph>
                    </section>
                </div>
                <div className="">
                    <GrayscaleHoverImage
                        height={450}
                        width={420}
                        className="rounded-xl"
                        src="/images/founders/anjan.jpeg"
                        alt="Anjan"
                    />
                </div>
            </section>

            {/* Piyush betichod */}
            <section className="w-full grid grid-cols-[1fr_2fr] gap-x-8 mx-auto max-w-270 mt-24">
                <div className="">
                    <GrayscaleHoverImage
                        height={450}
                        width={420}
                        className="rounded-xl"
                        src="/images/founders/piyush.jpeg"
                        alt="Piyush"
                    />
                </div>
                <div className="">
                    <div className="w-full flex items-center justify-between">
                        <AnimatedHeading className="text-3xl text-black">
                            Piyush Raj (Co-Founder)
                        </AnimatedHeading>
                        <div className="inline-flex space-x-2">
                            <Link href="https://www.linkedin.com/in/piyush-rj/" target="_blank">
                                <IconWrapper>
                                    <Image
                                        src={'/icons/socials/linkedin.webp'}
                                        alt="LinkedIn"
                                        width={32}
                                        height={32}
                                        className=""
                                    />
                                </IconWrapper>
                            </Link>
                            <Link href="https://x.com/PiyushC2P" target="_blank">
                                <IconWrapper>
                                    <Image
                                        src={'/icons/socials/x.webp'}
                                        alt="X"
                                        width={32}
                                        height={32}
                                        className=""
                                    />
                                </IconWrapper>
                            </Link>
                        </div>
                    </div>
                    <section>
                        <AnimatedParagraph delay={0}>
                            It started in my third year of college, when I realised things had to
                            change. That&apos;s when I decided to try a different path and got into
                            development.
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.05}>
                            I started building things, breaking things, and then pretending I meant
                            to do that. But with time, things began to make sense.
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.1}>
                            Around mid-2025, I met <b>Rishi</b> and <b>Anjan</b>. We clicked, and
                            naturally decided to build something together. That&apos;s how Nocturn
                            came to life.
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.15}>
                            We spent a lot of time obsessing over the small stuff, especially the
                            edge cases most people don&apos;t think about. Turns out, that&apos;s
                            where the fun is.
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.2}>
                            I&apos;ve always liked making things feel just right. If a picky person
                            looks at something I made and likes it, I take that as a win.
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.25}>
                            With Nocturn, we tried to keep that same vibe. Clean visuals, thoughtful
                            structure, and attention to the details that quietly matter.
                        </AnimatedParagraph>
                        <AnimatedParagraph delay={0.3}>
                            Us devs have brought it this far together, and honestly, we&apos;re just
                            getting started.
                        </AnimatedParagraph>
                    </section>
                </div>
            </section>
        </main>
    );
}
