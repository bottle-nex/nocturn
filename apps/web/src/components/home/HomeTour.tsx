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
            showProgress: false,
            allowClose: false,
            overlayOpacity: 0.25,
            smoothScroll: true,
            stagePadding: 8,
            popoverClass: 'vercel-tour',
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
                    element: '#tour-new-quiz',
                    popover: {
                        title: 'New Quiz',
                        description: 'Create a new quiz.',
                        side: 'bottom',
                        align: 'start',
                    },
                },
                {
                    element: '#tour-my-quizzes',
                    popover: {
                        title: 'My Quizzes',
                        description: 'All your quizzes live here.',
                        side: 'right',
                    },
                },
                {
                    element: '#tour-shared-with-me',
                    popover: {
                        title: 'Shared',
                        description: 'Quizzes shared with you.',
                        side: 'right',
                    },
                },
                {
                    element: '#tour-favourites',
                    popover: {
                        title: 'Favourites',
                        description: 'Quick access to saved quizzes.',
                        side: 'right',
                    },
                },
                {
                    element: '#tour-trash',
                    popover: {
                        title: 'Trash',
                        description: 'Deleted quizzes appear here.',
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
