import { z } from 'zod';

export const getUnAskedQuestionSchema = z.object({
    quizId: z.string(),
    after: z.coerce.number().int().min(0).optional(),
    before: z.coerce.number().int().min(0).optional(),
});
