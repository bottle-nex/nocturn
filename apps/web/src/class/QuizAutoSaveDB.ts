import { QuizType } from '@nocturn/types';

const DB_NAME = 'nocturn-autosave';
const DB_VERSION = 1;
const STORE_NAME = 'quizDrafts';

export interface QuizDraftRecord {
    quizId: string;
    data: QuizType;
    lastModified: number;
    dirty: boolean;
}

export default class QuizAutoSaveDB {
    private db: IDBDatabase | null = null;
    private dbReady: Promise<IDBDatabase>;

    constructor() {
        this.dbReady = this.open();
    }

    // this runs at start and creates an instance of IDB
    private open(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined') {
                reject(new Error('IndexedDB is not available in this environment'));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'quizId' });
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                resolve(this.db);
            };

            request.onerror = (error) => {
                console.error('Failed to open database:', error);
                reject(new Error('Failed to open IndexedDB'));
            };
        });
    }

    private async getDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;
        return this.dbReady;
    }

    // this saves the quiz in IDB
    async save(quizId: string, data: QuizType): Promise<void> {
        const db = await this.getDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            const record: QuizDraftRecord = {
                quizId,
                data,
                lastModified: Date.now(),
                dirty: true,
            };

            const request = store.put(record);

            request.onsuccess = () => resolve();
            request.onerror = (error) => {
                console.error('Failed to save draft:', error);
                reject(new Error('Failed to save draft to IndexedDB'));
            };
        });
    }

    // this loads back the quiz to the canvas from IDB
    async load(quizId: string): Promise<QuizDraftRecord | null> {
        const db = await this.getDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.get(quizId);

            request.onsuccess = () => {
                resolve((request.result as QuizDraftRecord) ?? null);
            };

            request.onerror = (error) => {
                console.error('Failed to load draft:', error);
                reject(new Error('Failed to load draft from IndexedDB'));
            };
        });
    }

    // this deletes the quiz in IDB
    async delete(quizId: string): Promise<void> {
        const db = await this.getDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const request = store.delete(quizId);

            request.onsuccess = () => resolve();
            request.onerror = (error) => {
                console.error('Failed to delete draft:', error);
                reject(new Error('Failed to delete draft from IndexedDB'));
            };
        });
    }

    // this checks if the quiz is available in IDB
    async hasDraft(quizId: string): Promise<boolean> {
        const record = await this.load(quizId);
        return record !== null;
    }

    // this returns if the quiz is saved to server or not
    // dirty === true means unsaved
    async isDirty(quizId: string): Promise<boolean> {
        const record = await this.load(quizId);
        return record?.dirty ?? false;
    }

    async markSynced(quizId: string): Promise<void> {
        const db = await this.getDB();

        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
            const record = await this.load(quizId);
            if (!record) {
                resolve();
                return;
            }

            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);

            const updatedRecord: QuizDraftRecord = {
                ...record,
                dirty: false,
            };

            const request = store.put(updatedRecord);

            request.onsuccess = () => resolve();
            request.onerror = (event) => {
                console.error('Failed to mark draft as synced:', event);
                reject(new Error('Failed to mark draft as synced'));
            };
        });
    }

    async getLastModified(quizId: string): Promise<number | null> {
        const record = await this.load(quizId);
        return record?.lastModified ?? null;
    }

    // returns all draft records from IDB
    async getAllDrafts(): Promise<QuizDraftRecord[]> {
        const db = await this.getDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                resolve((request.result as QuizDraftRecord[]) ?? []);
            };

            request.onerror = (error) => {
                console.error('Failed to get all drafts:', error);
                reject(new Error('Failed to get all drafts from IndexedDB'));
            };
        });
    }

    // This cleans the quiz in Indexed after 7 days or max storage exceeds
    async cleanup(maxAgeDays: number = 7, maxDrafts: number = 50): Promise<number> {
        const allDrafts = await this.getAllDrafts();
        const now = Date.now();
        const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
        let deletedCount = 0;

        // remove the old drafts
        const toDelete: string[] = [];
        const remaining: QuizDraftRecord[] = [];

        for (const draft of allDrafts) {
            const age = now - draft.lastModified;
            if (!draft.dirty && age > maxAgeMs) {
                toDelete.push(draft.quizId);
            } else {
                remaining.push(draft);
            }
        }

        for (const quizId of toDelete) {
            await this.delete(quizId);
            deletedCount++;
        }

        // if size is still greater than maxDrafts delete until it's less
        if (remaining.length > maxDrafts) {
            const sorted = remaining
                .filter((d) => !d.dirty)
                .sort((a, b) => a.lastModified - b.lastModified);

            const toEvict = sorted.slice(0, remaining.length - maxDrafts);
            for (const draft of toEvict) {
                await this.delete(draft.quizId);
                deletedCount++;
            }
        }

        return deletedCount;
    }

    // closes the instance of IDB
    close(): void {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}
