'use client';
import { useEffect } from 'react';
import axios from 'axios';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { COMPLETE_TUTORIAL_URL } from 'routes/api_routes';

export default function HomeTour() {
    const { session, setTutorialComplete } = useUserSessionStore();

    useEffect(() => {
        const driverObj = driver({
            showProgress: true,
            allowClose: false,
            overlayOpacity: 0.6,
            smoothScroll: true,
            stagePadding: 12,
            popoverClass: 'nocturn-tour',
            disableActiveInteraction: true,
            showButtons: ['previous', 'next'],

            nextBtnText: 'Next',
            prevBtnText: 'Back',
            doneBtnText: 'Finish',

            onPopoverRender: (popover, { driver }) => {
                const footer = popover.footer;
                if (!footer) return;

                if (!footer.querySelector('.tour-skip-text')) {
                    const skipText = document.createElement('span');
                    skipText.innerText = 'Skip';
                    skipText.className = 'tour-skip-text';

                    skipText.onclick = () => {
                        driver.destroy();
                    };

                    footer.prepend(skipText);
                }
            },

            steps: [
                {
                    popover: {
                        title: 'Welcome to Nocturn',
                        description:
                            "Let's take a quick tour to help you get started with creating and managing your AI-powered quizzes here.",
                    },
                },
                {
                    element: '#tour-new-quiz',
                    popover: {
                        title: 'Create Your First Quiz',
                        description:
                            'Click here to start generating a new quiz using AI. You can customize the topic, difficulty, and add PDF materials.',
                        side: 'bottom',
                        align: 'start',
                    },
                },
                {
                    element: '#tour-my-quizzes',
                    popover: {
                        title: 'Manage Your Workspace',
                        description:
                            "Access all the quizzes you've created. You can review, edit, share, or delete them from this dashboard seamlessly.",
                        side: 'right',
                    },
                },
                {
                    element: '#tour-shared-with-me',
                    popover: {
                        title: 'Shared with You',
                        description:
                            'Find all the quizzes that others have shared with you here. You can jump directly into collaborating and taking quizzes.',
                        side: 'right',
                    },
                },
                {
                    element: '#tour-favourites',
                    popover: {
                        title: 'Quick Access',
                        description:
                            'Star your most important quizzes to keep them handy and find them quickly in your favourites section.',
                        side: 'right',
                    },
                },
                {
                    element: '#tour-trash',
                    popover: {
                        title: 'Trash Can',
                        description:
                            'Accidentally deleted a quiz? You can find and easily restore your recently deleted items here before they are gone permanently.',
                        side: 'right',
                    },
                },
            ],

            onDestroyed: async () => {
                try {
                    const { data } = await axios.post(
                        COMPLETE_TUTORIAL_URL,
                        {},
                        {
                            headers: {
                                Authorization: `Bearer ${session?.user.token}`,
                            },
                        },
                    );

                    if (data.success && session?.user) {
                        setTutorialComplete(true);
                    }
                } catch (err) {
                    console.error(err);
                }
            },
        });

        driverObj.drive();

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                driverObj.moveNext();
            }
        };

        window.addEventListener('keydown', handleKey);

        return () => {
            window.removeEventListener('keydown', handleKey);
        };
    }, [session?.user, setTutorialComplete]);

    return null;
}
