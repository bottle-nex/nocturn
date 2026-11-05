'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowUpRight, FiCheck, FiZap } from 'react-icons/fi';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import JoinQuizButton from '../test/JoinQuizButton';
import styles from './LandingHeroSection.module.css';

const answers = ['Venus', 'Mars', 'Jupiter', 'Saturn'];

export default function LandingHeroSection() {
    const [answer, setAnswer] = useState<string | null>(null);
    const { session, setOpenSigninModal } = useUserSessionStore();
    const router = useRouter();

    function handleCreateQuiz() {
        if (!session) {
            setOpenSigninModal(true);
            return;
        }
        router.push('/home');
    }

    return (
        <section className={styles.hero} aria-labelledby="landing-hero-title">
            <div className={styles.content}>
                <div className={styles.copy}>
                    <p className={styles.eyebrow}>
                        <span aria-hidden="true">✳</span> A little curiosity. A lot of fun.
                    </p>
                    <h1 id="landing-hero-title" className={styles.title}>
                        Big ideas.
                        <br />
                        Great quizzes.
                        <br />
                        <span>Everyone’s in.</span>
                    </h1>
                    <p className={styles.description}>
                        Turn what you know into a game everyone wants to play. Create with AI, bring
                        your people together, and make learning the best part of their day.
                    </p>
                    <button type="button" className={styles.cta} onClick={handleCreateQuiz}>
                        Create a quiz <FiArrowUpRight size={22} aria-hidden="true" />
                    </button>
                    <div className={styles.join}>
                        <span>Got a code?</span>
                        <JoinQuizButton />
                    </div>
                </div>

                <div className={styles.playground}>
                    <span className={styles.spark} aria-hidden="true">
                        ✳
                    </span>
                    <div className={styles.sticker} aria-hidden="true">
                        Less boring.
                        <br />
                        More playing.
                    </div>
                    <div className={styles.quiz}>
                        <div className={styles.quizHeader}>
                            <span>
                                <span className={styles.liveDot} /> THE CURIOSITY CLUB
                            </span>
                            <span>01 / 08</span>
                        </div>
                        <div className={styles.quizBody}>
                            <p className={styles.demoLabel}>A tiny quiz. Give it a go.</p>
                            <div className={styles.planet} aria-hidden="true">
                                <span />
                            </div>
                            <h2>Which planet is known as the Red Planet?</h2>
                            <div
                                className={styles.answers}
                                role="group"
                                aria-label="Choose a planet"
                            >
                                {answers.map((option, index) => (
                                    <button
                                        key={option}
                                        type="button"
                                        aria-pressed={answer === option}
                                        onClick={() => setAnswer(option)}
                                        className={`${styles.answer} ${answer === option ? styles.selected : ''}`}
                                    >
                                        <span className={styles.answerLetter}>
                                            {answer === option ? (
                                                <FiCheck aria-hidden="true" />
                                            ) : (
                                                String.fromCharCode(65 + index)
                                            )}
                                        </span>
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <p className={styles.feedback} role="status">
                                {answer === null
                                    ? 'Your next “aha!” moment starts here.'
                                    : answer === 'Mars'
                                      ? 'You got it! Mars gets its red color from iron oxide.'
                                      : 'Good guess! It’s Mars. Try the red planet.'}
                            </p>
                        </div>
                        <div className={styles.quizFooter}>
                            <FiZap aria-hidden="true" /> Small questions. Big energy.
                        </div>
                    </div>
                    <div className={styles.note} aria-hidden="true">
                        Bring your
                        <br />
                        <strong>“I know this!”</strong> energy. ↗
                    </div>
                </div>
            </div>
            <div className={styles.features} aria-label="Ways to use Nocturn">
                <span>Made for curious minds</span>
                <span aria-hidden="true">✳</span>
                <span>Powered by AI</span>
                <span aria-hidden="true">✳</span>
                <span>Better together</span>
                <span aria-hidden="true">✳</span>
                <span>Play it live</span>
            </div>
        </section>
    );
}
