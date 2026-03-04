import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma, QuizStatus } from '@nocturn/database';

export default async function permanentDeleteSelectedQuiz(req: Request, res: Response) {
    try {
        const user = req.user;

        if (!user) {
            ResponseWriter.not_authorized(res);
            return;
        }

        const { quizIds } = req.body;

        // validate body exists
        if (!quizIds) {
            ResponseWriter.invalid_data(res, 'quizIds is required');
            return;
        }

        // validate array
        if (!Array.isArray(quizIds)) {
            ResponseWriter.invalid_data(res, 'quizIds must be an array');
            return;
        }

        // validate not empty
        if (quizIds.length === 0) {
            ResponseWriter.invalid_data(res, 'quizIds cannot be empty');
            return;
        }

        const allValidStrings = quizIds.every(
            (id) => typeof id === 'string' && id.trim().length > 0,
        );

        if (!allValidStrings) {
            ResponseWriter.invalid_data(res, 'quizIds must contain valid string ids');
            return;
        }

        const result = await prisma.quiz.deleteMany({
            where: {
                id: { in: quizIds },
                hostId: user.id,
                isDeleted: true,
                status: {
                    not: QuizStatus.LIVE,
                },
            },
        });

        ResponseWriter.success(res, {
            message: 'Selected quizzes permanently deleted',
            deletedCount: result.count,
        });
    } catch (error) {
        console.error('error in permanently delete selected quiz controller: ', error);
        ResponseWriter.system_error(res);
    }
}
