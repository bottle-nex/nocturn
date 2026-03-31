'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingSectionHeader from '@/components/refactor/LandingSectionHeader';
import LandingFaqFloatingBubbleComponent from '@/components/refactor/LandingFaqFloatingBubbleComponent';

const faqItems = [
    {
        index: 0,
        question: 'What is USDC?',
        answer: 'USDC is a digital dollar.each token is backed 1:1 by US dollars held in reserve. It runs on Solana, which means transfers settle in under a second and cost fractions of a cent. Unlike volatile cryptocurrencies, 1 USDC is always worth $1.',
    },
    {
        index: 1,
        question: 'Do I need a Solana wallet to play?',
        answer: "No. You can join and play any quiz without a wallet. A wallet is only needed when you want to claim a prize. If you win and don't have one yet, the claim page will guide you through setting up a wallet like Phantom or Solflare.it takes under a minute.",
    },
    {
        index: 2,
        question: "What happens if I don't claim in time?",
        answer: 'Winners have a 7-day window to claim. This deadline is enforced by the automated program on Solana.not by Nocturn. After the window closes, the host can reclaim the unclaimed funds through a separate transaction. We send email reminders before the deadline.',
    },
    {
        index: 3,
        question: 'Is there a fee?',
        answer: 'The platform takes a 1% fee from the prize pool when the host stakes. This is deducted upfront.99% goes into the escrow, 1% goes to Nocturn. There are zero fees on claiming. Winners receive exactly the amount shown.',
    },
    {
        index: 4,
        question: 'Can the host take the money back during a quiz?',
        answer: "No. Once the USDC is deposited into the escrow account, the funds are locked by an automated program on Solana. The program's rules are fixed.it will only release funds to verified winners after the quiz is sealed, or back to the host after the 7-day claim window expires.",
    },
    {
        index: 5,
        question: 'What does "sealed" mean?',
        answer: 'After a quiz ends, the platform writes each winner\'s claim to Solana and then "seals" the quiz. Sealing means the results become immutable.no one can change who won, alter prize amounts, or add new winners. It also starts the 7-day claim countdown.',
    },
];

export default function UsdcFaqSection() {
    const [selectedFaq, setSelectedFaq] = useState<number>(0);

    return (
        <main className="max-w-270 mx-auto w-full text-dark-alpha select-none py-15">
            <LandingSectionHeader
                heading="Common Questions"
                subheading="Everything you need to know about prize pools on Nocturn."
            />
            <main className="w-full grid grid-cols-[2fr_3fr] gap-x-10 mt-16 items-start">
                <LandingFaqFloatingBubbleComponent />
                <section className="w-full space-y-2">
                    {faqItems.map((item) => (
                        <motion.div
                            key={item.index}
                            onClick={() =>
                                setSelectedFaq(selectedFaq === item.index ? -1 : item.index)
                            }
                            className="bg-light-base/70 text-lg font-normal text-dark-base/90 rounded-xl cursor-pointer"
                        >
                            <section className="flex items-center justify-between px-4 py-4">
                                <h3 className="font-normal">{item.question}</h3>
                                <motion.svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    className="shrink-0"
                                    animate={{
                                        rotateX: selectedFaq === item.index ? 180 : 0,
                                        rotateY: selectedFaq === item.index ? 180 : 0,
                                    }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                >
                                    <motion.line
                                        x1="1"
                                        y1="7"
                                        x2="13"
                                        y2="7"
                                        stroke="#4f46e5"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                    <motion.line
                                        x1="7"
                                        y1="1"
                                        x2="7"
                                        y2="13"
                                        stroke="#4f46e5"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        animate={{ scaleY: selectedFaq === item.index ? 0 : 1 }}
                                        transition={{ duration: 0.1, ease: 'easeInOut' }}
                                        style={{ originX: '50%', originY: '50%' }}
                                    />
                                </motion.svg>
                            </section>
                            <AnimatePresence initial={false}>
                                {selectedFaq === item.index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                                        className="overflow-hidden bg-light-alpha px-4"
                                    >
                                        <p className="text-base font-normal pt-3 leading-relaxed text-dark-base/60">
                                            {item.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </section>
            </main>
        </main>
    );
}
