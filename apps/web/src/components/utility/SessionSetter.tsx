'use client';

import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
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

    // Re-read billing state for open tabs as well as after returning to the app.
    useEffect(() => {
        if (!session?.user?.id) return;
        let active = true;
        const refreshSubscription = async () => {
            try {
                const latest = await getSession();
                const current = useUserSessionStore.getState().session;
                if (active && latest?.user && current?.user && current.user.id === latest.user.id) {
                    setSession({ ...latest, user: { ...latest.user, token: current.user.token } });
                }
            } catch (error) {
                console.error('Failed to refresh subscription:', error);
            }
        };
        void refreshSubscription();
        const interval = setInterval(refreshSubscription, 60_000);
        window.addEventListener('focus', refreshSubscription);
        return () => {
            active = false;
            clearInterval(interval);
            window.removeEventListener('focus', refreshSubscription);
        };
    }, [session?.user?.id, setSession]);

    // Pick up X-Access-Token from any axios response (set by auth middleware when
    // the access token has expired and the server auto-recovered via the refresh cookie)
    useEffect(() => {
        const interceptorId = axios.interceptors.response.use((response) => {
            const newToken = response.headers['x-access-token'];
            if (newToken) {
                const { session: current, setSession: set } = useUserSessionStore.getState();
                if (current?.user) {
                    set({ ...current, user: { ...current.user, token: newToken } });
                }
            }
            return response;
        });

        return () => {
            axios.interceptors.response.eject(interceptorId);
        };
    }, []);

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
                const current = useUserSessionStore.getState().session;
                if (current?.user) {
                    setSession({ ...current, user: { ...current.user, token: newToken } });
                }
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
                const current = useUserSessionStore.getState().session;
                if (current?.user) {
                    setSession({ ...current, user: { ...current.user, token: newToken } });
                }
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
