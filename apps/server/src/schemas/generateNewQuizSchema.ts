import z from 'zod';

export const generateNewQuizSchema = z.object({
    instruction: z.string().trim().min(1).max(4000),
    sessionId: z.string().optional(),
});
