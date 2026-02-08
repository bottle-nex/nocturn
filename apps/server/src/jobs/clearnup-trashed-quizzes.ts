import { prisma } from '@nocturn/database';

export default async function cleanupTrashedQuizzes() {
    try {
        const THRITY_DAYS_AGO = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        await prisma.quiz.deleteMany({
            where: {
                isDeleted: true,
                deletedAt: {
                    lt: THRITY_DAYS_AGO,
                },
            },
        });
    } catch (error) {
        console.error('Trashed quiz deletion job failed: ', error);
        return;
    }
}
