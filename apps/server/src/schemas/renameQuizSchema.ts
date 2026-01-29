import z from 'zod';

export const renameQuizSchema = z.object({
    quizId: z.string(),
    name: z.string().min(1).max(50),
});
