'use client';
import Joyride, { Step, STATUS, CallBackProps } from 'react-joyride';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { COMPLETE_TUTORIAL_URL } from 'routes/api_routes';

export default function HomeTour() {
    const { session, setTutorialComplete } = useUserSessionStore();
    const [run, setRun] = useState<boolean>(true);
    const [isDark, setIsDark] = useState<boolean>(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const steps: Step[] = [
        {
            target: '#tour-new-quiz',
            content: 'Create a new quiz from here.',
            placement: 'bottom',
        },
        {
            target: '#tour-my-quizzes',
            content: 'Access all your quizzes here.',
            placement: 'right',
        },
        {
            target: '#tour-shared-with-me',
            content: 'Quizzes shared with you appear here.',
            placement: 'right',
        },
        {
            target: '#tour-favourites',
            content: 'Save quizzes you love for quick access.',
            placement: 'right',
        },
        {
            target: '#tour-trash',
            content: 'Deleted quizzes go to the trash.',
            placement: 'right',
        },
    ];

    const handleCallback = async (data: CallBackProps) => {
        const { status } = data;

        if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
            setRun(false);

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
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showSkipButton
            showProgress
            spotlightClicks={false}
            scrollToFirstStep
            disableOverlayClose
            callback={handleCallback}
            spotlightPadding={8}
            styles={{
                options: {
                    zIndex: 10000,
                    backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
                    textColor: isDark ? '#fafafa' : '#0a0a0a',
                    arrowColor: isDark ? '#0a0a0a' : '#ffffff',
                    primaryColor: isDark ? '#fafafa' : '#0a0a0a',
                },

                tooltip: {
                    borderRadius: '6px',
                    padding: '14px 16px',
                    maxWidth: '280px',
                    border: isDark
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: isDark
                        ? '0 10px 30px rgba(0,0,0,0.6)'
                        : '0 10px 25px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    textAlign: 'left',
                },

                tooltipContent: {
                    padding: '0',
                    marginBottom: '10px',
                    textAlign: 'left',
                },

                tooltipFooter: {
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '18px',
                },

                buttonNext: {
                    backgroundColor: isDark ? '#fafafa' : '#0a0a0a',
                    color: isDark ? '#0a0a0a' : '#ffffff',
                    borderRadius: '4px',
                    fontSize: '12px',
                    padding: '6px 12px',
                    fontWeight: 500,
                },

                buttonBack: {
                    color: isDark ? '#a1a1aa' : '#525252',
                    fontSize: '12px',
                },

                buttonSkip: {
                    color: isDark ? '#71717a' : '#737373',
                    fontSize: '12px',
                },

                buttonClose: {
                    width: '10px',
                    height: '10px',
                },

                overlay: {
                    pointerEvents: 'auto',
                },
            }}
        />
    );
}
