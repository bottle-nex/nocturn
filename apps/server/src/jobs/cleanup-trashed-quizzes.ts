import deleteTrashedQuizzes from '../services/delete-trashed-quizzes';

export default async function cleanupTrashedQuizzes() {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const result = await deleteTrashedQuizzes({
            deletedAt: { lte: thirtyDaysAgo },
        });
        if (result.failedIds.length > 0) {
            console.error('Trashed quiz cleanup could not delete:', result.failedIds);
        }
    } catch (error) {
        console.error('Trashed quiz deletion job failed: ', error);
        return;
    }
}
