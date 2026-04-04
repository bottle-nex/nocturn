import { JSX } from "react";
import LandingSectionHeader from "../refactor/LandingSectionHeader";
import GrayscaleHoverImage from "./GrayscaleHoverImage";
import NotFoundDiagonalGrid from "../notFound/NotFoundDiagonalGrid";

export default function AboutHeroSection(): JSX.Element {
    return (
        <main className="h-screen w-full max-w-270 flex flex-col gap-y-3 pt-40 items-center relative">
            <NotFoundDiagonalGrid rotation={0} />
            <div className="relative z-10 flex flex-col items-center gap-y-12">
                <LandingSectionHeader
                    heading="About us"
                    subheading="Discover the journey of Nocturn, from its inception to its mission of empowering creators and revolutionizing the digital landscape."
                />
                <section className="relative">
                    <GrayscaleHoverImage height={500} width={800} className="rounded-xl" src="/images/founders/founders.jpeg" alt="The Nocturn Team" />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-10">
                        <p className="bg-[#C2410C] inline-flex text-light-alpha px-3 py-1 rounded-full text-sm tracking-wide">Rishi Kant</p>
                    </div>
                    <div className="absolute bottom-20 -left-8 z-10">
                        <p className="bg-[#00498A] inline-flex text-light-alpha px-3 py-1 rounded-full text-sm tracking-wide">Anjan Suman</p>
                    </div>
                    <div className="absolute bottom-60 -right-24 z-10">
                        <p className="bg-[#004D40] inline-flex text-light-alpha px-3 py-1 rounded-full text-sm tracking-wide">Piyush Raj</p>
                    </div>
                </section>
            </div>
        </main>
    )
}