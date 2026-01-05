'use client';
import { cn } from '@/lib/utils';
import { press } from './Navbar';
import Image from 'next/image';
import Link from 'next/link';

const footerLinks = {
    product: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'FAQ', href: '/faq' },
    ],
    company: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/contact' },
        { label: 'Contributors', href: '/contributors' },
    ],
};

const socials = [
    { label: 'Twitter', href: 'https://twitter.com/nocturnxyz', image: '/socials/x.webp' },
    // { label: "GitHub", href: "https://github.com/nocturnxyz", image: "/socials/github.png" },
];

export default function Footer() {
    return (
        <>
            <div className="w-full">
                <Image
                    src="/images/footer-img.svg"
                    alt="Nocturn Logo"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-full h-auto"
                />
            </div>
            <footer className="relative w-screen bg-black px-12 py-16 h-[55vh] flex flex-col justify-between">
                <div className="grid grid-cols-2">
                    <section>
                        <span className={cn('text-white font-bold text-6xl', press.className)}>
                            Nocturn
                        </span>
                        <section className="w-full mr-40 gap-x-12 my-8">
                            {socials.map((social) => (
                                <Link
                                    key={social.label}
                                    href={social.href}
                                    className="inline-block ml-4"
                                >
                                    <div className="flex items-center justify-center">
                                        <Image
                                            src={social.image}
                                            alt={social.label}
                                            width={40}
                                            height={40}
                                        />
                                    </div>
                                </Link>
                            ))}
                        </section>
                    </section>

                    <section className="gap-x-24 grid grid-cols-2">
                        <div className="flex flex-col gap-y-4">
                            <h4 className="text-neutral-400 text-sm uppercase tracking-wider mb-2">
                                Product
                            </h4>
                            {footerLinks.product.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-white hover:text-neutral-300 transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        <div className="flex flex-col gap-y-4">
                            <h4 className="text-neutral-400 text-sm uppercase tracking-wider mb-2">
                                Company
                            </h4>
                            {footerLinks.company.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="text-white hover:text-neutral-300 transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </section>
                </div>
            </footer>
        </>
    );
}
