import cron from 'node-cron';
import cleanupTrashedQuizzes from '../jobs/cleanup-trashed-quizzes';

cron.schedule('0 2 * * *', async () => {
    await cleanupTrashedQuizzes();
});
