/**
 * QuizAutoSaveDB
 *
 * A class that manages all IndexedDB communication for quiz draft auto-saving.
 * Stores quiz snapshots locally so changes are never lost, even if the tab
 * crashes or the network goes down. Server syncs happen on lifecycle events.
 */

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

    /**
     * Opens (or creates) the IndexedDB database.
     * Returns a promise that resolves with the ready database instance.
     */
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

    /**
     * Returns the ready database instance, waiting for init if needed.
     */
    private async getDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;
        return this.dbReady;
    }

    /**
     * Saves a quiz snapshot to IndexedDB and marks it as dirty (unsynced with server).
     */
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

    /**
     * Loads a saved quiz draft from IndexedDB.
     * Returns null if no draft exists for this quizId.
     */
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

    /**
     * Deletes a draft from IndexedDB (e.g. after successful server sync or quiz deletion).
     */
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

    /**
     * Checks if a local draft exists for this quiz.
     */
    async hasDraft(quizId: string): Promise<boolean> {
        const record = await this.load(quizId);
        return record !== null;
    }

    /**
     * Returns whether the local draft has unsaved changes vs the server.
     */
    async isDirty(quizId: string): Promise<boolean> {
        const record = await this.load(quizId);
        return record?.dirty ?? false;
    }

    /**
     * Marks a draft as synced (not dirty) after a successful server save.
     * Keeps the data in IndexedDB for crash recovery but marks it as clean.
     */
    async markSynced(quizId: string): Promise<void> {
        const db = await this.getDB();

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
                console.error('[QuizAutoSaveDB] Failed to mark draft as synced:', event);
                reject(new Error('Failed to mark draft as synced'));
            };
        });
    }

    /**
     * Returns the lastModified timestamp for a draft, or null if no draft exists.
     */
    async getLastModified(quizId: string): Promise<number | null> {
        const record = await this.load(quizId);
        return record?.lastModified ?? null;
    }

    /**
     * Closes the database connection.
     */
    close(): void {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}
