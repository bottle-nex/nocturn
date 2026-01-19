import z from 'zod';

export const createQuizUsingAISchema = z.object({
    instruction: z.string().min(5).max(200),
});
