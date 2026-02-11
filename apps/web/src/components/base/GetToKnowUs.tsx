import { JSX, useCallback, useMemo, useRef, useState } from 'react';
import UtilityCard from '../utility/UtilityCard';
import { AnimatePresence, motion } from 'motion/react';
import { IoMdCheckmark } from 'react-icons/io';
import { Button } from '../ui/button';
import { MdOutlineChevronRight, MdOutlineSegment } from 'react-icons/md';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { LEARNING_JOURNEY_URL } from 'routes/api_routes';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';

interface GetToKnowUsCardProps {
    id: number;
    title: string;
    description: string;
}

const cards: GetToKnowUsCardProps[] = [
    {
        id: 1,
        title: 'What is Nocturn?',
        description:
            'Nocturn is a task management application designed to help individuals and teams organize their work, increase productivity, and achieve their goals efficiently.',
    },
    {
        id: 2,
        title: 'Create a Quiz',
        description:
            'Our intuitive interface allows you to create quizzes effortlessly, making it easy to engage your audience and gather valuable insights.',
    },
    {
        id: 3,
        title: 'Invite Your Team',
        description:
            'Easily invite your team members to collaborate on quizzes, track progress, and achieve your goals together.',
    },
    {
        id: 4,
        title: 'Live your Quiz',
        description:
            'Go live with your quiz and share it with your audience. Monitor responses in real-time and analyze results to gain valuable insights.',
    },
    {
        id: 5,
        title: 'Join a Quiz',
        description:
            'Participate in quizzes created by others, test your knowledge, and compete with friends or colleagues in a fun and engaging way.',
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
        console.log("clicked card with id", id);
        if (timeout.current) {
            clearTimeout(timeout.current);

        } else {
            console.log("clearing the timeout");
            const newTimeout = setTimeout(() => {
                makeBacendCall();
            }, 5000);
            timeout.current = newTimeout;
        }
    }

    async function makeBacendCall() {
        try {
            console.log("amking the backend call");
            const { data } = await axios.post(LEARNING_JOURNEY_URL, {
                learningJourneyStep: Array.from(learntCardsRef.current),
            }, {
                headers: {
                    Authorization: `Bearer ${session?.user.token}`,
                }
            })
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
                            'w-200 h-160 flex flex-col justify-between px-12 py-8',
                            'border-0 shadow-2xl bg-light-alpha dark:bg-dark-alpha rounded-xl',
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <section className="relative w-full h-56">
                            <h4 className="text-xl font mb-2">{selectedFeature.title}</h4>
                        </section>
                        <section className="w-full flex justify-between">
                            <Button
                                onClick={() => setOpenCard(null)}
                                className="rounded-full bg-transparent! shadow-none text-dark-alpha dark:text-light-alpha text-sm"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={() => handleCardClick(selectedFeature.id + 1)}
                                className={cn(
                                    'rounded-full text-sm py-5 px-5! gap-x-1',
                                    'bg-dark-base hover:bg-dark-alpha  dark:bg-light-base hover:dark:bg-light-alpha',
                                )}
                            >
                                Learn Next
                                <MdOutlineChevronRight />
                            </Button>
                        </section>
                    </UtilityCard>
                </>
            )}
        </AnimatePresence>
    );
}
