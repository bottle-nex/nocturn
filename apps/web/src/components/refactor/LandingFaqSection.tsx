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
    {
        index: 6,
        question: 'How do I get support if I run into an issue?',
        answer: 'Our support team is available through in-app chat and email for all users, with priority response times for premium subscribers. You can also browse our help center for guides and answers to common questions.',
    },
];

export default function LandingFaqSection(): JSX.Element {
    const [selectedFaq, setSelectedFaq] = useState<number>(0);

    return (
        <main className="max-w-270 mx-auto w-full text-dark-alpha select-none py-15">
            <LandingSectionHeader
                heading="Frequently Asked Questions"
                subheading="Find answers to common questions about Nocturn."
            />
            <main className="w-full grid grid-cols-[2fr_3fr] gap-x-10 mt-16 items-start">
                <RipplingPillStack />
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
