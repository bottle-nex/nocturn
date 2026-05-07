import type { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import z from 'zod';
import { parse } from 'cookie';
import { NOCTURN_COOKIE_NAME } from '../../../../../packages/types/src/const/nocturn.const';
import QuizAction from '../../class/quizAction';
import { USER_TYPE } from '@nocturn/types';
import { prisma, QuizStatus } from '@nocturn/database';

const getLivePrizePoolSchema = z.object({
    quizId: z.string(),
});

export default class GetLivePrizePoolController {
    static async process(req: Request, res: Response) {
        try {
            const parsed = getLivePrizePoolSchema.safeParse(req.params);

            if (!parsed.success) {
                ResponseWriter.invalid_data(res);
                return;
            }

            const cookieHeader = req.headers.cookie;
            const cookies = cookieHeader ? parse(cookieHeader) : {};
            const token = cookies[NOCTURN_COOKIE_NAME];

            if (!token) {
                ResponseWriter.not_authorized(res);
                return;
            }

            const decoded = QuizAction.verifyCookie(token);

            if (
                !decoded ||
                decoded.quizId !== parsed.data.quizId ||
                ![USER_TYPE.HOST, USER_TYPE.PARTICIPANT, USER_TYPE.SPECTATOR].includes(
                    decoded.role as USER_TYPE,
                )
            ) {
                ResponseWriter.not_authorized(res);
                return;
            }

            const { quizId } = parsed.data;

            const quiz = await prisma.quiz.findUnique({
                where: {
                    id: quizId,
                },
                select: {
                    status: true,
                    prizeDistributions: {
                        select: {
                            rank: true,
                            percentage: true,
                            amount: true,
                            amountBaseUnits: true,
                        },
                    },
                },
            });

            if (!quiz || quiz.status !== QuizStatus.LIVE) {
                ResponseWriter.not_found(res, 'Quiz not found or not live');
                return;
            }

            const distributions = quiz.prizeDistributions.map((d) => ({
                ...d,
                amountBaseUnits: d.amountBaseUnits?.toString() ?? null,
            }));

            ResponseWriter.success(res, distributions);
            return;
        } catch (err) {
            console.error('Error occurred while fetching live prize pool:', err);
            ResponseWriter.invalid_data(res);
            return;
        }
    }
}
