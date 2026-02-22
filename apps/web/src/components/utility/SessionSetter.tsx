'use client';

import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { Session } from 'next-auth';
import { useEffect, useRef } from 'react';
import { INIT_REFRESH_URL, REFRESH_TOKEN_URL } from 'routes/api_routes';

const REFRESH_INTERVAL_MS = 12 * 60 * 1000; // 12 minutes

interface SessionSetterProps {
    session: Session | null;
}

export default function SessionSetter({ session }: SessionSetterProps) {
    const { setSession } = useUserSessionStore();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const hasInitialized = useRef(false);

    // Set the initial session from server
    useEffect(() => {
        setSession(session);
    }, [session, setSession]);

    // On first mount with a session, call init-refresh to set the httpOnly cookie
    useEffect(() => {
        if (!session?.user?.token || hasInitialized.current) return;
        hasInitialized.current = true;

        const initRefreshCookie = async () => {
            try {
                await fetch(INIT_REFRESH_URL, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.user.token}`,
                    },
                });
            } catch {
                // silently failing the fetch to not show it on the client
            }
        };

        initRefreshCookie();
    }, [session]);

    // Periodically refresh the access token
    useEffect(() => {
        if (!session?.user) return;

        const refreshAccessToken = async () => {
            try {
                const response = await fetch(REFRESH_TOKEN_URL, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (!response.ok) return;

                const result = await response.json();
                if (result?.success && result.data?.token) {
                    setSession({
                        ...session,
                        user: {
                            ...session.user,
                            token: result.data.token,
                        },
                    });
                }
            } catch {
                // silently failing the fetch to not show it on the client
            }
        };

        intervalRef.current = setInterval(refreshAccessToken, REFRESH_INTERVAL_MS);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [session, setSession]);

    return null;
}
