import { useEffect, useRef, useCallback } from 'react';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import BackendActions from '@/lib/backend/new/quiz-backend-actions';
import QuizAutoSaveDB from '@/class/QuizAutoSaveDB';
import { create } from 'zustand';

/**
 * Shared auto-save status store so the UI indicator can read it
 * without needing to be a direct child of the hook's host.
 */
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'idle';

interface AutoSaveStatusStore {
    status: SaveStatus;
    setStatus: (status: SaveStatus) => void;
}

export const useAutoSaveStatusStore = create<AutoSaveStatusStore>((set) => ({
    status: 'idle',
    setStatus: (status) => set({ status }),
}));

/** Debounce delay for IndexedDB writes (ms) */
const IDB_DEBOUNCE_MS = 300;

/**
 * useAutoSave
 *
 * Google Docs-style auto-save hook:
 * 1. On mount, recovers any dirty local draft from IndexedDB
 * 2. After recovery, subscribes to store changes and writes to IndexedDB (debounced)
 * 3. Flushes to server on tab switch (visibilitychange) and on page unload (pagehide)
 */
export function useAutoSave() {
    const dbRef = useRef<QuizAutoSaveDB | null>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSyncingRef = useRef<boolean>(false);

    // Gate: IDB writes are blocked until recovery completes.
    // This prevents the initial server data load from overwriting the local draft.
    const recoveryCompleteRef = useRef<boolean>(false);

    const { setStatus } = useAutoSaveStatusStore();

    // Initialize the DB instance once
    useEffect(() => {
        dbRef.current = new QuizAutoSaveDB();
        return () => {
            dbRef.current?.close();
            dbRef.current = null;
        };
    }, []);

    /**
     * Sync the current dirty draft from IndexedDB to the server.
     * Used on visibilitychange / pagehide.
     */
    const syncToServer = useCallback(async () => {
        const db = dbRef.current;
        if (!db || isSyncingRef.current) return;

        const quiz = useNewQuizStore.getState().quiz;
        const token = useUserSessionStore.getState().session?.user.token;
        if (!quiz.id || !token || !quiz.autoSave) return;

        const isDirty = await db.isDirty(quiz.id);
        if (!isDirty) return;

        isSyncingRef.current = true;
        setStatus('saving');

        try {
            const success = await BackendActions.upsertQuizAction(quiz, token);
            if (success) {
                await db.markSynced(quiz.id);
                setStatus('saved');
            } else {
                setStatus('unsaved');
            }
        } catch (error) {
            console.error('[useAutoSave] Server sync failed:', error);
            setStatus('unsaved');
        } finally {
            isSyncingRef.current = false;
        }
    }, [setStatus]);

    /**
     * On mount: attempt recovery FIRST, then enable IDB writes.
     * This runs before the subscription starts writing, so the local
     * draft in IndexedDB won't be overwritten by server data.
     */
    useEffect(() => {
        const attemptRecovery = async () => {
            const db = dbRef.current;
            if (!db) {
                recoveryCompleteRef.current = true;
                return;
            }

            const quiz = useNewQuizStore.getState().quiz;
            if (!quiz.id) {
                recoveryCompleteRef.current = true;
                return;
            }

            try {
                const record = await db.load(quiz.id);

                if (record && record.dirty) {
                    // Compare timestamps — only restore if local draft is newer
                    const serverUpdatedAt = new Date(quiz.updatedAt).getTime();

                    if (record.lastModified > serverUpdatedAt) {
                        // Restore the local draft into the store
                        useNewQuizStore.getState().updateQuiz(record.data);
                        setStatus('unsaved');
                    } else {
                        // Server data is newer, clear the stale local draft flag
                        await db.markSynced(quiz.id);
                        setStatus('saved');
                    }
                } else {
                    setStatus('saved');
                }
            } catch (error) {
                console.error('Recovery check failed:', error);
            } finally {
                // Now allow the subscription to write to IDB
                recoveryCompleteRef.current = true;
            }
        };

        // Delay slightly to ensure the quiz data has loaded from the server
        const recoveryTimer = setTimeout(attemptRecovery, 1500);
        return () => clearTimeout(recoveryTimer);
    }, [setStatus]);

    /**
     * Subscribe to zustand store changes and write to IndexedDB (debounced).
     * IMPORTANT: Writes are gated behind recoveryCompleteRef to prevent
     * the initial server data load from overwriting the local draft.
     */
    useEffect(() => {
        const unsubscribe = useNewQuizStore.subscribe((state) => {
            const { quiz } = state;
            const db = dbRef.current;

            // Don't write to IDB until recovery is done
            if (!recoveryCompleteRef.current) return;
            if (!db || !quiz.id || !quiz.autoSave) return;

            setStatus('unsaved');

            // Debounce the IndexedDB write
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(async () => {
                try {
                    await db.save(quiz.id, quiz);
                } catch (error) {
                    console.error('Failed to write to IndexedDB:', error);
                }
            }, IDB_DEBOUNCE_MS);
        });

        return () => {
            unsubscribe();
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [setStatus]);

    /**
     * Listen to browser lifecycle events for server sync.
     * - visibilitychange: tab switch / minimize (normal async fetch)
     * - pagehide: tab close / navigation (uses keepalive fetch)
     */
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                syncToServer();
            }
        };

        const handlePageHide = () => {
            const quiz = useNewQuizStore.getState().quiz;
            const token = useUserSessionStore.getState().session?.user.token;
            if (!quiz.id || !token || !quiz.autoSave) return;

            const db = dbRef.current;
            if (!db) return;

            try {
                const body = JSON.stringify(quiz);
                const url = `${window.location.origin}/api/proxy/save-quiz/${quiz.id}`;

                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body,
                    keepalive: true,
                }).catch(() => {
                    // Silent fail — draft is safe in IndexedDB
                });
            } catch {
                // Silent fail — draft is safe in IndexedDB
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handlePageHide);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, [syncToServer]);
}
