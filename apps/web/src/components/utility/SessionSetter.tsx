'use client';

import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { Session } from 'next-auth';
import { useEffect, useRef } from 'react';
import { INIT_REFRESH_URL, REFRESH_TOKEN_URL } from 'routes/api_routes';
import axios from 'axios';

// Ensure all axios calls include cookies (needed for refresh token fallback)
axios.defaults.withCredentials = true;

const REFRESH_INTERVAL_MS = 12 * 60 * 1000; // 12 minutes

interface SessionSetterProps {
    session: Session | null;
}

async function fetchNewAccessToken(): Promise<string | null> {
    try {
        const response = await fetch(REFRESH_TOKEN_URL, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) return null;

        const result = await response.json();
        if (result?.success && result.data?.token) {
            return result.data.token;
        }
        return null;
    } catch {
        return null;
    }
}

export default function SessionSetter({ session }: SessionSetterProps) {
    const { setSession } = useUserSessionStore();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const hasInitialized = useRef(false);

    // Set the initial session from server
    useEffect(() => {
        setSession(session);
    }, [session, setSession]);

    // On mount: set refresh cookie + immediately get a fresh access token
    useEffect(() => {
        if (!session?.user?.token || hasInitialized.current) return;
        hasInitialized.current = true;

        const initAndRefresh = async () => {
            // Step 1: Set the refresh cookie in the browser (needs Bearer access token)
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
                // silently failing
            }

            // Step 2: Immediately refresh to get a fresh access token
            const newToken = await fetchNewAccessToken();
            if (newToken) {
                setSession({
                    ...session,
                    user: {
                        ...session.user,
                        token: newToken,
                    },
                });
            }
        };

        initAndRefresh();
    }, [session, setSession]);

    // Periodically refresh the access token every 12 minutes
    useEffect(() => {
        if (!session?.user) return;

        const refreshAndUpdate = async () => {
            const newToken = await fetchNewAccessToken();
            if (newToken) {
                setSession({
                    ...session,
                    user: {
                        ...session.user,
                        token: newToken,
                    },
                });
            }
        };

        intervalRef.current = setInterval(refreshAndUpdate, REFRESH_INTERVAL_MS);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [session, setSession]);

    return null;
}
