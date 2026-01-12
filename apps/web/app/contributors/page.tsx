import { cn } from '@/lib/utils';
import { getAllContributors } from '@/server/get_contributors';
import Image from 'next/image';
import Link from 'next/link';
import { Press_Start_2P } from 'next/font/google';

const press = Press_Start_2P({
    weight: '400',
    subsets: ['latin'],
});

export interface Contributor {
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
    id: number;
    type: string;
}

export default async function Page() {
    const contributors = await getAllContributors();
    return (
        <main className="relative bg-[#f5f4f2] min-h-screen w-screen tracking-wider">
            {/* Navbar */}
            <nav className="h-20 bg-black border-b border-black w-full fixed top-0 flex justify-between items-center z-20 pl-12">
                <Link href="/">
                    <span className={cn('text-white font-bold text-2xl', press.className)}>
                        Nocturn
                    </span>
                </Link>
                <Link
                    href="/"
                    className="h-full flex items-center justify-center px-8 bg-[#FF3F7F] hover:bg-white text-tprime text-lg border-l-4 border-black transition-colors"
                >
                    Back to Home
                </Link>
            </nav>

            {/* Hero Section */}
            <section className="pt-20 bg-[#90a7ed] border-b-4 border-black">
                <div className="max-w-6xl mx-auto py-16 px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-6xl font-black text-tprime tracking-tight">
                                Wall of
                                <br />
                                <span className="text-white">Contributors</span>
                            </h1>
                            <p className="text-lg text-tprime/70 mt-4 max-w-md font-medium">
                                The amazing humans who helped build Nocturn. Every commit counts.
                            </p>
                        </div>
                        <div className="hidden md:block">
                            <div
                                className={cn(
                                    'rotate-6 text-3xl font-black text-tprime px-6 py-4 bg-eta',
                                    'border-4 border-black shadow-hard',
                                    'transition-transform duration-200 ease-out',
                                    'hover:translate-x-0.5 hover:translate-y-0.5',
                                )}
                            >
                                THANK YOU!
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 mt-12">
                        <div
                            className={cn(
                                'bg-white border-4 border-black px-8 py-4 shadow-hard',
                                'transition-transform duration-200 ease-out',
                                'hover:translate-x-0.5 hover:translate-y-0.5',
                            )}
                        >
                            <span className="text-4xl font-black text-tprime block">
                                {contributors.length}
                            </span>
                            <span className="text-xs font-bold text-tprime/60 uppercase tracking-wider">
                                Contributors
                            </span>
                        </div>
                        <div
                            className={cn(
                                'bg-[#22a094] border-4 border-black px-8 py-4 shadow-hard',
                                'transition-transform duration-200 ease-out',
                                'hover:translate-x-0.5 hover:translate-y-0.5',
                            )}
                        >
                            <span className="text-4xl font-black text-white block">
                                {contributors.reduce(
                                    (acc: number, c: Contributor) => acc + c.contributions,
                                    0,
                                )}
                            </span>
                            <span className="text-xs font-bold text-tprime/60 uppercase tracking-wider">
                                Total Commits
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="max-w-6xl mx-auto py-16 px-8">
                {contributors.length === 0 ? (
                    <div
                        className={cn(
                            'bg-alpha border-4 border-black p-12 text-center shadow-hard',
                        )}
                    >
                        <p className="text-2xl font-black text-tprime">No contributors found</p>
                        <p className="text-tprime/70 mt-2">
                            Unable to load contributor data at this time
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
                        {contributors.map((contributor: Contributor, idx: number) => (
                            <a
                                key={contributor.id}
                                href={contributor.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group"
                            >
                                <div
                                    className={cn(
                                        'relative border-4 border-black overflow-hidden',
                                        'transition-all duration-200 ease-out shadow-hard',
                                        'hover:translate-x-0.5 hover:translate-y-0.5',
                                        idx % 5 === 0 && 'bg-[#fff200]',
                                        idx % 5 === 1 && 'bg-[#FF3F7F]',
                                        idx % 5 === 2 && 'bg-[#22a094]',
                                        idx % 5 === 3 && 'bg-[#90a7ed]',
                                        idx % 5 === 4 && 'bg-[#FFC400]',
                                    )}
                                >
                                    {/* Avatar */}
                                    <div className="relative w-full aspect-square">
                                        <Image
                                            src={contributor.avatar_url}
                                            alt={contributor.login}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Info overlay */}
                                    <div
                                        className={cn(
                                            'absolute inset-0 bg-black/90 flex flex-col items-center justify-center',
                                            'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
                                        )}
                                    >
                                        <span className="text-white font-bold text-sm truncate max-w-[90%]">
                                            {contributor.login}
                                        </span>
                                        <span className="text-[#fff200] font-black text-lg mt-1">
                                            {contributor.contributions} commits
                                        </span>
                                    </div>
                                </div>

                                {/* Name badge */}
                                <div
                                    className={cn(
                                        'mt-2 bg-black text-white px-3 py-1.5 text-xs font-bold',
                                        'truncate text-center uppercase tracking-wider',
                                    )}
                                >
                                    {contributor.login}
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </section>

            {/* CTA Section */}
            <section className="bg-eta border-t-4 border-black py-16">
                <div className="max-w-4xl mx-auto text-center px-8">
                    <h2 className="text-4xl font-black text-tprime mb-4">Want to Contribute?</h2>
                    <p className="text-lg text-tprime/70 mb-8">
                        Join our community and help make Nocturn even better.
                    </p>
                    <a
                        href="https://github.com/bottle-nex/nocturn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                            'inline-block bg-black text-white px-10 py-5',
                            'font-black text-lg uppercase tracking-wider',
                            'border-4 border-black shadow-custom',
                            'transition-all duration-200 ease-out',
                            'hover:bg-alpha hover:text-tprime',
                        )}
                    >
                        View on GitHub
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black py-8 px-12">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <span className={cn('text-white font-bold text-xl', press.className)}>
                        Nocturn
                    </span>
                    <span className="text-white/60 text-sm">Built with love by the community</span>
                </div>
            </footer>
        </main>
    );
}
