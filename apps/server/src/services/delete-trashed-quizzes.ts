import { prisma, Prisma, QuizStatus } from '@nocturn/database';

export default async function deleteTrashedQuizzes(where: Prisma.QuizWhereInput) {
    const quizzes = await prisma.quiz.findMany({
        where: { ...where, isDeleted: true },
        select: { id: true },
    });
    const deletedIds: string[] = [];
    const failedIds: string[] = [];

    for (const quiz of quizzes) {
        try {
            const result = await prisma.quiz.deleteMany({
                where: {
                    ...where,
                    id: quiz.id,
                    isDeleted: true,
                    status: { not: QuizStatus.LIVE },
                },
            });
            if (result.count === 1) {
                deletedIds.push(quiz.id);
            } else {
                failedIds.push(quiz.id);
            }
        } catch (error) {
            console.error('Failed to permanently delete trashed quiz:', quiz.id, error);
            failedIds.push(quiz.id);
        }
    }

    return { deletedIds, failedIds };
}
