import { JSX } from "react";
import GrayscaleHoverImage from "./GrayscaleHoverImage";
import LandingSectionHeader from "../refactor/LandingSectionHeader";

export default function AboutFounderSection(): JSX.Element {
    return (
        <main>
            <LandingSectionHeader
                heading="The Nocturn Story"
                subheading="Discover the journey of Nocturn, from its inception to its mission of empowering creators and revolutionizing the digital landscape."
            />
            {/* Rishi - Image Left */}
            <section className="w-full grid grid-cols-[1fr_2fr] gap-x-8 mx-auto max-w-270 mt-16">
                <div className="">
                    <GrayscaleHoverImage height={450} width={420} className="rounded-xl" src="/images/founders/rishi.JPG" alt="Rishi" />
                </div>
                <div className="">
                    <p className="text-3xl text-black">Rishi Kant (Founder and Ceo)</p>
                    <section>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            I tried twice to get into Super 30, a six-month bootcamp by <b>Harkirat Singh</b> focused on nurturing software engineers. Didn&apos;t make it either time.
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            Instead of dwelling on it, I leaned into what I was good at, building products. Around that time, <b>Harkirat</b> mentioned how interesting it would be to have a platform where people could co-quiz with a host, compete with each other, and stake prize pools. That idea stuck with me.
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            I started building the first version from scratch. Soon after, I brought in <b>Anjan Suman</b> and <b>Piyush Raj</b>, and we began shaping it into something real.
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            The product has been built with a strong focus on design and solid engineering. We&apos;ve tackled real challenges across business logic, trust simulation in contracts, and delivering a clean user experience.
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            As a team, we&apos;ve taken the product from zero to one. Now, we&apos;re figuring out distribution and how to bring it to market.
                        </p>
                    </section>
                </div>
            </section>

            {/* Anjan - Image Right */}
            <section className="w-full grid grid-cols-[2fr_1fr] gap-x-8 mx-auto max-w-270 mt-24">
                <div className="">
                    <p className="text-3xl text-black">Anjan Suman (Co-Founder)</p>
                    <section>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            I started the journey back in 2024 with a question in mind, will I make it or leave it halfway?
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            But you know what they say… <i>&quot;if you truly desire something with all your heart, the whole universe conspires to help you achieve it.&quot;</i>
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            And then I met <b>Rishi</b> and <b>Piyush</b>, and aah they pushed me to limits, they always say <i>&quot;do it clean or don&apos;t do it.&quot;</i>
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            At the time, I was building some small projects, didn&apos;t know why. Then in July, we sat in a meeting and Rishi said, <i>&quot;let&apos;s build something real, something together&quot;</i>. That&apos;s how Nocturn began.
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            From day one, Nocturn was built with a strong focus on user experience, while staying equally committed to developer experience. It wasn&apos;t easy, and still isn&apos;t, but it&apos;s worth it.
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            As a team, we haven&apos;t reached great heights yet, but we&apos;ve built something just as important, trust. And soon, something we&apos;ve been working on will be out in the market.
                        </p>
                    </section>
                </div>
                <div className="">
                    <GrayscaleHoverImage height={450} width={420} className="rounded-xl" src="/images/founders/anjan.jpeg" alt="Anjan" />
                </div>
            </section>

            {/* Piyush - Image Left */}
            <section className="w-full grid grid-cols-[1fr_2fr] gap-x-8 mx-auto max-w-270 mt-24">
                <div className="">
                    <GrayscaleHoverImage height={450} width={420} className="rounded-xl" src="/images/founders/piyush.jpeg" alt="Piyush" />
                </div>
                <div className="">
                    <p className="text-3xl text-black">Piyush Raj (Co-Founder)</p>
                    <section>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            It started in my third year of college, when I realised things had to change. That&apos;s when I decided to try a different path and got into development.
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            I started building things, breaking things, and then pretending I meant to do that. But with time, things began to make sense.
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            Around mid-2025, I met <b>Rishi</b> and <b>Anjan</b>. We clicked, and naturally decided to build something together. That&apos;s how Nocturn came to life.
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            We spent a lot of time obsessing over the small stuff, especially the edge cases most people don&apos;t think about. Turns out, that&apos;s where the fun is.
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            I&apos;ve always liked making things feel just right. If a picky person looks at something I made and likes it, I take that as a win.
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            With Nocturn, we tried to keep that same vibe. Clean visuals, thoughtful structure, and attention to the details that quietly matter.
                        </p>
                        <p className="text-base text-dark-base/80 leading-relaxed mt-3.5">
                            Us devs have brought it this far together, and honestly, we&apos;re just getting started.
                        </p>
                    </section>
                </div>
            </section>
        </main>
    )
}