import { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import UtilityCard from '../utility/UtilityCard';
import { AnimatePresence, motion } from 'motion/react';
import { IoMdCheckmark } from 'react-icons/io';
import { Button } from '../ui/button';
import { MdOutlineChevronRight, MdOutlineSegment } from 'react-icons/md';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { LEARNING_JOURNEY_URL } from 'routes/api_routes';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';

interface ParagraphSection {
    title: string;
    paragraph: string;
}

interface GetToKnowUsCardProps {
    id: number;
    title: string;
    description: string;
    paragraphs: ParagraphSection[];
}

const cards: GetToKnowUsCardProps[] = [
    {
        id: 1,
        title: 'What is Nocturn?',
        description:
            'Nocturn is a task management application designed to help individuals and teams organize their work, increase productivity, and achieve their goals efficiently.',
        paragraphs: [
            {
                title: 'The Platform',
                paragraph:
                    'Nocturn is a next-generation live quiz platform built for educators, content creators, and teams who want to make learning interactive and engaging. Whether you are running a classroom trivia session, hosting a company-wide knowledge challenge, or streaming a live quiz to thousands of participants, Nocturn gives you the tools to create, manage, and deliver quizzes in real time.',
            },
            {
                title: 'Key Features',
                paragraph:
                    'With features like AI-powered quiz generation, real-time leaderboards, collaborative editing, and even Solana-based prize pools, Nocturn transforms passive learning into an exciting, competitive experience.',
            },
            {
                title: 'Built for You',
                paragraph:
                    'The platform is designed from the ground up to be fast, reliable, and beautiful — so you can focus on your content while we handle the rest.',
            },
        ],
    },
    {
        id: 2,
        title: 'Create a Quiz',
        description:
            'Our intuitive interface allows you to create quizzes effortlessly, making it easy to engage your audience and gather valuable insights.',
        paragraphs: [
            {
                title: 'Get Started Easily',
                paragraph:
                    'Creating a quiz on Nocturn is as simple as writing a few questions — or even simpler with our AI assistant. Start from scratch using our rich text editor powered by TipTap, which supports images, code blocks, and formatted text so your questions look exactly the way you want.',
            },
            {
                title: 'AI-Powered Generation',
                paragraph:
                    'If you are short on time, let our AI generate an entire quiz for you based on a topic or description you provide. You can customize question types, set time limits per question, add explanations for correct answers, and organize questions into sections.',
            },
            {
                title: 'Draft & Publish',
                paragraph:
                    'Every quiz you create is saved as a draft that you can revisit, refine, and publish whenever you are ready. The creation experience is designed to be flexible enough for power users while remaining approachable for first-timers.',
            },
        ],
    },
    {
        id: 3,
        title: 'Invite Your Team',
        description:
            'Easily invite your team members to collaborate on quizzes, track progress, and achieve your goals together.',
        paragraphs: [
            {
                title: 'Built for Collaboration',
                paragraph:
                    'Nocturn is built for collaboration. When you are putting together a quiz, you do not have to do it alone — invite teammates, co-teachers, or fellow creators to work on the same quiz in real time.',
            },
            {
                title: 'Role-Based Access',
                paragraph:
                    'Our collaboration system supports multiple roles including Host, Editor, and Viewer, so you have full control over who can make changes and who can just observe.',
            },
            {
                title: 'Real-Time Editing',
                paragraph:
                    "Collaborators can simultaneously edit questions, add new content, and leave suggestions, all synced instantly through our WebSocket-powered real-time engine. You will see each other's cursors and changes as they happen, making the editing process feel seamless and natural. This is especially powerful for teams building large question banks or organizations standardizing their training materials across departments.",
            },
        ],
    },
    {
        id: 4,
        title: 'Live your Quiz',
        description:
            'Go live with your quiz and share it with your audience. Monitor responses in real-time and analyze results to gain valuable insights.',
        paragraphs: [
            {
                title: 'Go Live Instantly',
                paragraph:
                    'Going live is where Nocturn truly shines. Once your quiz is ready, hit publish and launch a live session that participants can join instantly using a unique quiz code.',
            },
            {
                title: 'Host Controls',
                paragraph:
                    'As the host, you control the pace of the quiz — advancing through questions, pausing for discussion, or letting the timer run down for maximum suspense. Behind the scenes, our real-time WebSocket infrastructure ensures that every answer submission, leaderboard update, and phase transition happens with minimal latency, even with thousands of concurrent participants.',
            },
            {
                title: 'Analytics & Insights',
                paragraph:
                    'You get a live dashboard showing response distributions, accuracy rates, and a dynamic leaderboard that updates after every question. After the quiz ends, detailed analytics help you understand how your audience performed, which questions were the hardest, and where knowledge gaps exist.',
            },
        ],
    },
    {
        id: 5,
        title: 'Join a Quiz',
        description:
            'Participate in quizzes created by others, test your knowledge, and compete with friends or colleagues in a fun and engaging way.',
        paragraphs: [
            {
                title: 'Instant Access',
                paragraph:
                    'Joining a quiz on Nocturn is instant and frictionless. All you need is a quiz code shared by the host — enter it on the platform and you are in.',
            },
            {
                title: 'Compete & Engage',
                paragraph:
                    'Once the quiz goes live, questions appear on your screen in real time and you race against the clock to select the correct answer. The faster you answer correctly, the more points you earn, adding a thrilling competitive edge to every session. You can see your rank on the live leaderboard after each question, chat with other participants, and even react to questions as they come up.',
            },
            {
                title: 'Review Your Performance',
                paragraph:
                    'Whether you are a student testing your knowledge before an exam, an employee participating in a team-building activity, or just someone who loves trivia, the experience is designed to be fast, fun, and addictive. After the quiz wraps up, you can review your performance and see detailed breakdowns of your answers.',
            },
        ],
    },
];

export default function GetToKnowUs(): JSX.Element {
    const [openCard, setOpenCard] = useState<number | null>(null);
    const [learntCards, setLearntCards] = useState<Set<number>>(new Set());
    const { session } = useUserSessionStore();
    const selectedFeature = cards.find((f) => f.id === openCard);
    const timeout = useRef<NodeJS.Timeout | null>(null);
    const learntCardsRef = useRef(learntCards);
    learntCardsRef.current = learntCards;

    const width = useMemo(() => {
        return (learntCards.size / cards.length) * 100;
    }, [learntCards]);

    const hasViewed = useCallback(
        (id: number) => {
            return learntCards.has(id);
        },
        [learntCards],
    );

    function handleCardClick(id: number) {
        if (openCard === id) {
            setOpenCard(null);
            setLearntCards((prev) => new Set(prev).add(id));
        } else {
            setOpenCard(id);
            setLearntCards((prev) => new Set(prev).add(id));
        }
        if (timeout.current) {
            clearTimeout(timeout.current);
        }
        timeout.current = setTimeout(() => {
            timeout.current = null;
            makeBackendCall();
        }, 5000);
    }

    useEffect(() => {
        if (!session?.user.token) return;
        async function fetchLearningJourney() {
            try {
                const res = await axios.get(LEARNING_JOURNEY_URL, {
                    headers: {
                        Authorization: `Bearer ${session?.user.token}`,
                    },
                });
                const steps: number[] = res.data?.data?.learningJourneyStep;
                if (Array.isArray(steps) && steps.length > 0) {
                    setLearntCards(new Set(steps));
                }
            } catch (err) {
                console.error('Error fetching learning journey', err);
            }
        }
        fetchLearningJourney();
    }, [session?.user.token]);

    async function makeBackendCall() {
        if (!session?.user.token) return;
        try {
            await axios.post(
                LEARNING_JOURNEY_URL,
                {
                    learningJourneyStep: Array.from(learntCardsRef.current),
                },
                {
                    headers: {
                        Authorization: `Bearer ${session?.user.token}`,
                    },
                },
            );
        } catch (err) {
            console.error('Error updating learning journey', err);
        }
    }

    return (
        <section className="w-full">
            <div className="flex items-center justify-start gap-x-3">
                <h3 className="text-base tracking-wide">Get to know Nocturn</h3>
                <span className="h-1.25 w-36 bg-neutral-300 rounded-full">
                    <span
                        className={cn(
                            'h-1.25 rounded-full block',
                            width > 0 ? `bg-nprimary` : 'bg-transparent',
                        )}
                        style={{ width: width ? `${width}%` : undefined }}
                    />
                </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {cards.map((card) => (
                    <UtilityCard
                        onClick={() => handleCardClick(card.id)}
                        layoutId={`get-to-know-us-card-${card.id}`}
                        key={card.id}
                        className={cn(
                            'cursor-pointer shadow-none p-0 overflow-hidden',
                            'w-49 h-32 flex flex-col items-start justify-center px-4',
                            'border-2 border-transparent dark:border-transparent rounded-beta transition-colors duration-300',
                            hasViewed(card.id)
                                ? 'bg-green-100/60 dark:bg-green-950/30 hover:border-green-600 border-transparent'
                                : 'bg-alpha/8 dark:bg-[#e1d8ff] hover:border-alpha border-transparent',
                        )}
                    >
                        {hasViewed(card.id) ? (
                            <IoMdCheckmark className="ml-2 size-5 text-green-600 dark:text-green-400" />
                        ) : (
                            <MdOutlineSegment className="rotate-180 ml-2 size-5 text-alpha" />
                        )}
                        <h4
                            className={cn(
                                'text-base text-center px-2',
                                hasViewed(card.id)
                                    ? 'text-green-700 dark:text-green-400'
                                    : 'text-alpha',
                            )}
                        >
                            {card.title}
                        </h4>
                        <p className="line-clamp-1 text-[13px] text-neutral-600 dark:text-neutral-400 ml-2">
                            {card.description}
                        </p>
                    </UtilityCard>
                ))}
            </div>
            <KnowUsBigCard
                handleCardClick={handleCardClick}
                openCard={openCard}
                setOpenCard={setOpenCard}
                selectedFeature={selectedFeature}
            />
        </section>
    );
}

interface KnowUsBigCardProps {
    openCard: number | null;
    selectedFeature: GetToKnowUsCardProps | undefined;
    setOpenCard: (id: number | null) => void;
    handleCardClick: (id: number) => void;
}

function KnowUsBigCard({
    openCard,
    setOpenCard,
    selectedFeature,
    handleCardClick,
}: KnowUsBigCardProps) {
    return (
        <AnimatePresence>
            {openCard && selectedFeature && (
                <>
                    <motion.div
                        key="backdrop"
                        className="fixed inset-0 bg-black/50 dark:bg-neutral-600/50 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpenCard(null)}
                    />
                    <UtilityCard
                        layoutId={`get-to-know-us-card-${openCard}`}
                        className={cn(
                            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
                            'w-[calc(100%-2rem)] max-w-190 h-200 flex flex-col justify-between px-5 py-6 sm:px-12 sm:py-8',
                            'border-0 shadow-2xl bg-light-alpha dark:bg-dark-alpha rounded-xl',
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <section
                            data-lenis-prevent
                            className="relative w-full flex flex-col items-start justify-start gap-y-4 overflow-y-auto min-h-0 custom-scrollbar"
                        >
                            <h4 className="text-xl font mb-2">{selectedFeature.title}</h4>
                            <section className="w-full h-80 shrink-0 rounded-lg relative bg-blue-500"></section>
                            <section className="space-y-6">
                                {selectedFeature.paragraphs.map((section, index) => (
                                    <div key={index}>
                                        <h5 className="text-base font-semibold mb-1">
                                            {section.title}
                                        </h5>
                                        <p className="text-[15px] text-dark-base/70">
                                            {section.paragraph}
                                        </p>
                                    </div>
                                ))}
                            </section>
                        </section>
                        <section className="w-full flex justify-between shrink-0 pt-4">
                            <Button
                                onClick={() => setOpenCard(null)}
                                className="rounded-full bg-transparent! shadow-none text-dark-alpha dark:text-light-alpha text-sm"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={() =>
                                    selectedFeature.id >= cards.length
                                        ? setOpenCard(null)
                                        : handleCardClick(selectedFeature.id + 1)
                                }
                                className={cn(
                                    'rounded-full text-sm py-5 px-5! gap-x-1',
                                    'bg-dark-base hover:bg-dark-alpha  dark:bg-light-base hover:dark:bg-light-alpha',
                                )}
                            >
                                {selectedFeature.id >= cards.length ? 'Done' : 'Learn Next'}
                                {selectedFeature.id < cards.length && <MdOutlineChevronRight />}
                            </Button>
                        </section>
                    </UtilityCard>
                </>
            )}
        </AnimatePresence>
    );
}
