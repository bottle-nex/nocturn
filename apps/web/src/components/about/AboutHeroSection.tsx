import { JSX } from 'react';
import LandingSectionHeader from '../refactor/LandingSectionHeader';
import GrayscaleHoverImage from './GrayscaleHoverImage';
import NotFoundDiagonalGrid from '../notFound/NotFoundDiagonalGrid';

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
                    <GrayscaleHoverImage
                        height={500}
                        width={800}
                        className="rounded-xl"
                        src="/images/founders/founders.jpeg"
                        alt="The Nocturn Team"
                    />
                </section>
            </div>
        </main>
    );
}
