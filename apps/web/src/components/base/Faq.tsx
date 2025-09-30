import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import FaqChats from './FaqChats';

export default function Faq() {
    const ref = useRef(null);
    const isInView = useInView(ref, {
        once: false,
        amount: 0.09,
    });

    return (
        <motion.div
            id="faq"
            ref={ref}
            className="rounded-4xl h-[300vh] mt-40 w-full"
            style={{ willChange: 'transform, opacity, background-color' }}
            initial={{
                backgroundColor: 'rgb(14, 4, 35)',
                opacity: 0,
                y: 100,
                scale: 0.85,
            }}
            animate={
                isInView
                    ? {
                          backgroundColor: '#584494',
                          opacity: 1,
                          y: 0,
                          scale: 1,
                      }
                    : {}
            }
            transition={{
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                backgroundColor: {
                    duration: 1,
                    ease: 'easeOut',
                },
                y: {
                    duration: 0.6,
                },
            }}
        >
            <motion.div
                className="flex justify-center h-full"
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                    delay: 0.4,
                    duration: 0.6,
                    ease: 'easeOut',
                }}
            >
                <div className="mt-52">
                    <h1 className="text-sm font-normal text-center">You ask, we answer..</h1>
                    <h6 className="font-bold text-7xl max-w-[52rem] mt-8 text-center">
                        Most Common Question
                    </h6>
                    <FaqChats
                        messages={[
                            {
                                text: 'What is @Nocturn?',
                                side: 'left',
                            },
                            {
                                text: 'Nocturn is an innovative, decentralized quiz platform that combines competitive gameplay with blockchain-based rewards. Participants can join quizzes, stake tokens, and compete in multiple elimination rounds, all while learning and testing their knowledge. The platform is powered by smart contracts to ensure transparency and fairness, making every game an engaging and rewarding experience.',
                                side: 'right',
                            },
                            {
                                text: 'Can I win rewards?',
                                side: 'left',
                            },
                            {
                                text: 'Absolutely! Winners of quizzes on Nocturn can earn both NFT and token rewards. The prize pool is staked in advance, and participants compete in elimination rounds to claim it. The smart contracts ensure secure and transparent distribution of rewards, so top performers are recognized not only with tokens but also unique NFTs that celebrate their achievement.',
                                side: 'right',
                            },
                            {
                                text: 'How do I participate in quizzes?',
                                side: 'left',
                            },
                            {
                                text: 'To participate, simply enter the unique quiz code provided by the host. Some quizzes may require a token stake to join, adding an element of strategy and risk to the game. Once inside, participants compete in multiple rounds where speed and correctness determine who advances, making every round exciting and competitive.',
                                side: 'right',
                            },
                            {
                                text: 'What is the role of hosts on Nocturn?',
                                side: 'left',
                            },
                            {
                                text: 'Hosts can create and publish quizzes with pre-staked prize pools using wallet integration. They control the flow of the quiz, approve winners, and ensure a smooth gaming experience for participants. Hosts essentially act as facilitators of the game, leveraging the platform’s tools to engage participants and make each quiz dynamic and fun.',
                                side: 'right',
                            },
                            {
                                text: 'Can spectators join the action?',
                                side: 'left',
                            },
                            {
                                text: 'Yes! Nocturn provides a spectator mode, allowing users who aren’t actively participating to watch the game in real-time. Spectators can learn strategies, observe top performers, and even plan their own participation in future quizzes, creating a vibrant and interactive community.',
                                side: 'right',
                            },
                            {
                                text: 'What makes Nocturn different from other quiz platforms?',
                                side: 'left',
                            },
                            {
                                text: 'Unlike traditional quizzes, Nocturn merges education, strategy, and blockchain technology. Participants aren’t just answering questions—they’re staking tokens, making strategic decisions, and earning real rewards. The platform gamifies learning, encourages engagement, and offers transparent, provable results using smart contracts, which makes it a unique learn-to-earn experience.',
                                side: 'right',
                            },
                        ]}
                        className="mt-12"
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}
