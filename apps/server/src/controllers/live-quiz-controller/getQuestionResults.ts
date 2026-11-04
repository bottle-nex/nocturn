import { Request, Response } from 'express';
import { HostScreen, prisma } from '@nocturn/database';
import { LiveGameTokenPayload, NOCTURN_COOKIE_NAME } from '@nocturn/types';
import { parse } from 'cookie';
import QuizAction from '../../class/quizAction';
import ResponseWriter from '../../class/response_writer';

export default async function getQuestionResults(req: Request, res: Response) {
    try {
        const token = parse(req.headers.cookie ?? '')[NOCTURN_COOKIE_NAME];
        const user = token ? (QuizAction.verifyCookie(token) as LiveGameTokenPayload | null) : null;
        if (!user) return ResponseWriter.not_authorized(res);
        const { quizId, questionId } = { ...req.query, ...req.body };
        if (quizId !== user.quizId || typeof questionId !== 'string')
            return ResponseWriter.not_authorized(res);
        const session = await prisma.gameSession.findUnique({ where: { id: user.gameSessionId } });
        if (
            !session ||
            (session.currentQuestionId === questionId &&
                session.hostScreen !== HostScreen.QUESTION_RESULTS &&
                session.hostScreen !== HostScreen.QUIZ_RESULTS)
        )
            return ResponseWriter.not_authorized(res);
        const question = await prisma.question.findFirst({
            where: { id: questionId, quizId: user.quizId, isAsked: true },
        });
        if (!question) return ResponseWriter.not_found(res);
        const responses = await prisma.response.findMany({
            where: { questionId, gameSessionId: user.gameSessionId },
            select: {
                id: true,
                participantId: true,
                questionId: true,
                answer: true,
                selectedAnswer: true,
                isCorrect: true,
                pointsEarned: true,
            },
        });
        return ResponseWriter.success(res, {
            responses,
            correctAnswer: question.correctAnswer,
            answerConfig: question.answerConfig,
            questionType: question.questionType,
            explanation: question.explanation,
        });
    } catch (error) {
        console.error('Failed to fetch question results: ', error);
        return ResponseWriter.system_error(res);
    }
}
