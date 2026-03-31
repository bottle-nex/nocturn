'use client';
import PerspectiveCard from '@/components/utility/PerspectiveCard';
import NotFoundDiagonalGrid from '@/components/notFound/NotFoundDiagonalGrid';
import { RiMailFill, RiWallet3Fill, RiCheckboxCircleFill } from 'react-icons/ri';

const steps = [
    {
        num: '01',
        icon: RiMailFill,
        title: 'Check your email',
        body: "Winners receive an email with their rank, prize amount, and a unique claim link. This link is the only way to initiate a claim — it's tied to your result and expires after 7 days.",
        footnote: 'We send reminders before the window closes',
        light: false,
    },
    {
        num: '02',
        icon: RiWallet3Fill,
        title: 'Connect any Solana wallet',
        body: "Click the link and connect a wallet — Phantom, Solflare, or any Solana wallet works. If you don't have one yet, the page walks you through setting one up. It takes under a minute.",
        footnote: 'No wallet needed to play — only to claim',
        light: true,
    },
    {
        num: '03',
        icon: RiCheckboxCircleFill,
        title: 'Receive USDC directly',
        body: 'One click triggers the transfer. The USDC moves from the escrow vault straight to your wallet — no approval from Nocturn, no intermediary holding your funds. The transaction is confirmed on Solana in seconds.',
        footnote: 'Zero fees on claiming · Full amount received',
        light: false,
    },
] as const;

export default function UsdcClaimSection() {
    return (
        <main className="relative py-15 px-5 min-h-175 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <NotFoundDiagonalGrid />
            </div>

            <div className="relative z-10 max-w-270 mx-auto w-full">
                <div className="max-w-md">
                    <p className="text-[11px] tracking-[0.25em] uppercase text-alpha/60 mb-4">
                        Claim flow
                    </p>
                    <h2 className="text-[38px] font-semibold text-dark-base/90 leading-[1.1]">
                        Claiming is easy.
                        <br />
                        <span className="text-dark-base/90">Three steps. That&apos;s it.</span>
                    </h2>
                </div>

                <div className="mt-14 grid grid-cols-3 gap-5">
                    {steps.map((step) => (
                        <PerspectiveCard
                            key={step.num}
                            sticky={false}
                            className={`rounded-2xl ring-1 p-7 flex flex-col h-80 relative overflow-hidden ${
                                step.light
                                    ? 'bg-light-base ring-black/6'
                                    : 'bg-dark-base ring-white/6'
                            }`}
                        >
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-5">
                                    <div
                                        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                            step.light ? 'bg-dark-base/6' : 'bg-white/6'
                                        }`}
                                    >
                                        <step.icon
                                            size={18}
                                            className={
                                                step.light
                                                    ? 'text-dark-base/50'
                                                    : 'text-light-base/50'
                                            }
                                        />
                                    </div>
                                    <span
                                        className={`text-[11px] tracking-[0.15em] uppercase font-semibold ${
                                            step.light ? 'text-dark-base/20' : 'text-light-base/15'
                                        }`}
                                    >
                                        Step {step.num}
                                    </span>
                                </div>

                                <h3
                                    className={`text-[19px] font-semibold tracking-[-0.01em] ${
                                        step.light ? 'text-dark-base/90' : 'text-light-base/90'
                                    }`}
                                >
                                    {step.title}
                                </h3>
                                <p
                                    className={`text-[14px] leading-[1.7] mt-3 ${
                                        step.light ? 'text-dark-base/40' : 'text-light-base/30'
                                    }`}
                                >
                                    {step.body}
                                </p>

                                <div
                                    className={`mt-auto pt-4 text-[12px] ${
                                        step.light ? 'text-dark-base/20' : 'text-light-base/15'
                                    }`}
                                >
                                    {step.footnote}
                                </div>
                            </div>
                        </PerspectiveCard>
                    ))}
                </div>

                <div className="mt-12 max-w-2xl mx-auto text-center">
                    <p className="text-[14px] text-light-base/25 leading-relaxed">
                        If a winner doesn&apos;t claim within 7 days, the funds are returned to the
                        host via a separate reclaim transaction. Nothing is ever stuck — the program
                        handles every outcome automatically.
                    </p>
                </div>
            </div>
        </main>
    );
}
