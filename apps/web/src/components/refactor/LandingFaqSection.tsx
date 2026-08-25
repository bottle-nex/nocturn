'use client';
import { JSX, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingSectionHeader from './LandingSectionHeader';
import RipplingPillStack from '../resources/ai-generation/RipplingPillStack';

interface FaqItem {
    index: number;
    question: string;
    answer: string;
}

const faqItems: FaqItem[] = [
    {
        index: 0,
        question: 'What is Nocturn?',
        answer: 'Nocturn is a powerful and user-friendly task management application designed to help individuals and teams stay organized and productive. It offers a range of features including task creation, project management, collaboration tools, and customizable workflows to streamline your work processes.',
    },
    {
        index: 1,
        question: 'How does Nocturn work?',
        answer: 'Nocturn works by allowing users to create tasks, organize them into projects, and collaborate with team members. Users can set deadlines, assign tasks to specific team members, and track progress in real-time. The application also provides various views such as lists, boards, and calendars to help users visualize their work.',
    },
    {
        index: 2,
        question: 'Is Nocturn free to use?',
        answer: 'Nocturn offers both free and premium plans. The free plan includes basic features suitable for individuals and small teams, while the premium plans provide additional features such as advanced reporting, integrations with other tools, and priority support. You can choose the plan that best fits your needs.',
    },
    {
        index: 3,
        question: 'Can I use Nocturn on mobile devices?',
        answer: 'Yes, Nocturn is available on both iOS and Android platforms. You can download the app from the App Store or Google Play Store to manage your tasks and projects on the go.',
    },
    {
        index: 4,
        question: 'How secure is Nocturn?',
        answer: 'Nocturn takes security seriously and implements industry-standard measures to protect user data. This includes encryption, secure authentication, and regular security audits to ensure that your information is safe.',
    },
    {
        index: 5,
        question: 'Can I integrate Nocturn with other tools?',
        answer: 'Yes, Nocturn offers integrations with a variety of popular tools such as Slack, Google Calendar, and Trello. This allows you to streamline your workflow and keep all your work in sync across different platforms.',
    },
];

const listVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.09,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
    visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
    },
};

export default function LandingFaqSection(): JSX.Element {
    const [selectedFaq, setSelectedFaq] = useState<number>(0);

    return (
        <main className="max-w-270 mx-auto w-full text-dark-alpha select-none py-15">
            <LandingSectionHeader
                heading="Frequently Asked Questions"
                subheading="Find answers to common questions about Nocturn."
            />
            <main className="w-full grid grid-cols-[3fr_2fr] gap-x-10 mt-16 items-start">
                <motion.section
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={listVariants}
                    className="w-full space-y-3"
                >
                    {faqItems.map((item) => {
                        const isOpen = selectedFaq === item.index;

                        return (
                            <motion.div
                                key={item.index}
                                variants={itemVariants}
                                onClick={() => setSelectedFaq(isOpen ? -1 : item.index)}
                                whileHover={{ scale: 1.008 }}
                                whileTap={{ scale: 0.99 }}
                                className="relative overflow-hidden text-lg font-normal text-dark-base/90 rounded-xl cursor-pointer"
                            >
                                {isOpen ? (
                                    <motion.div
                                        layoutId="faq-active-bg"
                                        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
                                        className="absolute inset-0 rounded-xl bg-light-base shadow-[0_0_0_1px_rgba(79,70,229,0.25),0_10px_28px_-10px_rgba(79,70,229,0.4)]"
                                    />
                                ) : (
                                    <div className="absolute inset-0 rounded-xl bg-light-base/70" />
                                )}
                                <section className="relative flex items-center gap-4 px-4 py-4">
                                    <span
                                        className={`text-xs font-mono tracking-widest transition-colors duration-300 ${
                                            isOpen ? 'text-alpha' : 'text-dark-base/30'
                                        }`}
                                    >
                                        {String(item.index + 1).padStart(2, '0')}
                                    </span>
                                    <h3 className="font-normal flex-1">{item.question}</h3>
                                    <motion.div
                                        animate={{
                                            rotate: isOpen ? 135 : 0,
                                            backgroundColor: isOpen
                                                ? 'rgba(79,70,229,1)'
                                                : 'rgba(79,70,229,0)',
                                        }}
                                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                        className="shrink-0 h-7 w-7 rounded-full border border-alpha/40 flex items-center justify-center"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 14 14">
                                            <line
                                                x1="1"
                                                y1="7"
                                                x2="13"
                                                y2="7"
                                                stroke={isOpen ? '#ffffff' : '#4f46e5'}
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                            />
                                            <line
                                                x1="7"
                                                y1="1"
                                                x2="7"
                                                y2="13"
                                                stroke={isOpen ? '#ffffff' : '#4f46e5'}
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    </motion.div>
                                </section>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                            className="relative overflow-hidden px-4"
                                        >
                                            <motion.p
                                                initial={{ y: -8, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ duration: 0.3, delay: 0.05 }}
                                                className="text-base font-normal pb-4 pt-1 leading-relaxed text-dark-base/60"
                                            >
                                                {item.answer}
                                            </motion.p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </motion.section>
                <RipplingPillStack />
            </main>
        </main>
    );
}
