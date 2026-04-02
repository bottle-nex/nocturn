import { useEffect, useRef, useCallback } from 'react';
import { useNewQuizStore } from '@/store/new-quiz/useNewQuizStore';
import { useUserSessionStore } from '@/store/user/useUserSessionStore';
import BackendActions from '@/lib/backend/new/quiz-backend-actions';
import QuizAutoSaveDB from '@/class/QuizAutoSaveDB';
import { create } from 'zustand';

export enum SAVE_STATUS {
    SAVED = "SAVED",
    SAVING = "SAVING",
    UNSAVED = "UNSAVED",
    IDLE = "IDLE",
}

interface AutoSaveStatusStore {
    status: SAVE_STATUS;
    setStatus: (status: SAVE_STATUS) => void;
}

export const useAutoSaveStatusStore = create<AutoSaveStatusStore>((set) => ({
    status: SAVE_STATUS.IDLE,
    setStatus: (status) => set({ status }),
}));

// deboucing of writing chnages in IndexedDB
const IDB_DEBOUNCE_MS = 300;

export function useAutoSave() {
    const dbRef = useRef<QuizAutoSaveDB | null>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isSyncingRef = useRef<boolean>(false);

    // This is used to prevent any conflict in server sent quiz and IndexedDB quiz
    const recoveryCompleteRef = useRef<boolean>(false);

    const { setStatus } = useAutoSaveStatusStore();

    useEffect(() => {
        dbRef.current = new QuizAutoSaveDB();

        // call cleanup just after initialization
        dbRef.current.cleanup(7, 50).then((deleted) => {
            if (deleted > 0) {
                console.info(`Cleaned up ${deleted} old draft(s) from IndexedDB`);
            }
        }).catch(() => {});

        return () => {
            dbRef.current?.close();
            dbRef.current = null;
        };
    }, []);

    // this is used ot sync the changes from IndexedDB to server
    const syncToServer = useCallback(async () => {
        const db = dbRef.current;
        if (!db || isSyncingRef.current) return;

        const quiz = useNewQuizStore.getState().quiz;
        const token = useUserSessionStore.getState().session?.user.token;
        if (!quiz.id || !token || !quiz.autoSave) return;

        const isDirty = await db.isDirty(quiz.id);
        if (!isDirty) return;

        isSyncingRef.current = true;
        setStatus(SAVE_STATUS.SAVING);

        try {
            const success = await BackendActions.upsertQuizAction(quiz, token);
            if (success) {
                await db.markSynced(quiz.id);
                setStatus(SAVE_STATUS.SAVED);
            } else {
                setStatus(SAVE_STATUS.UNSAVED);
            }
        } catch (error) {
            console.error('Server sync failed:', error);
            setStatus(SAVE_STATUS.UNSAVED);
        } finally {
            isSyncingRef.current = false;
        }
    }, [setStatus]);

    // when the new page refreshes or loads then load the quiz from server then compare the updated timestamp
    // and if the updated timestamp of IDB is newer than server then update quiz from IDB
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
                    const serverUpdatedAt = new Date(quiz.updatedAt).getTime();

                    if (record.lastModified > serverUpdatedAt) {
                        useNewQuizStore.getState().updateQuiz(record.data);
                        setStatus(SAVE_STATUS.UNSAVED);
                    } else {
                        await db.markSynced(quiz.id);
                        setStatus(SAVE_STATUS.SAVED);
                    }
                } else {
                    setStatus(SAVE_STATUS.SAVED);
                }
            } catch (error) {
                console.error('Recovery check failed:', error);
            } finally {
                recoveryCompleteRef.current = true;
            }
        };

        // delay is added to avoid conflict in timing of server sent quiz and IDB quiz
        const recoveryTimer = setTimeout(attemptRecovery, 1500);
        return () => clearTimeout(recoveryTimer);
    }, [setStatus]);

    // This is most critical thing
    // In zustand, we can subscribe to any store to check if change in state occurs
    useEffect(() => {
        const unsubscribe = useNewQuizStore.subscribe((state) => {
            const { quiz } = state;
            const db = dbRef.current;

            if (!recoveryCompleteRef.current || !db || !quiz.id || !quiz.autoSave) return;

            setStatus(SAVE_STATUS.UNSAVED);

            // Debounce the IDB write
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

    // this is to detect changes in tab or browser switch
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
                }).catch(() => {});
            } catch {}
        };

        // this is used to check the visibility of the current screen
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // this is used when tab is closed of changed
        window.addEventListener('pagehide', handlePageHide);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, [syncToServer]);
}
