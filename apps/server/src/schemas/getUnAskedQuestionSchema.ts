import z from 'zod';

export const getUnAskedQuestionSchema = z.object({
    quizId: z.uuid(),
    after: z
        .string()
        .transform(Number)
        .refine((v) => Number.isInteger(v) && v >= 0)
        .optional(),
});
