import { prisma } from '@nocturn/database';

export default async function cleanupTrashedQuizzes() {
    try {
        const THRITY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const result = await prisma.quiz.deleteMany({
            where: {
                isDeleted: true,
                deletedAt: {
                    lt: THRITY_DAYS_AGO,
                },
            },
        });

        if (result.count > 0) {
            console.info(`Deleted ${result.count} trashed quizzes successfully`);
        } else {
            console.info(`No trashed quizzes found`);
        }
    } catch (error) {
        console.error('Trashed quiz deletion job failed: ', error);
        return;
    }
}
