import { z } from 'zod';

export const quizJoinSchema = z.object({
    code: z.string().min(1, 'Quiz code is required'),
    email: z.email('Invalid email address').optional(),
});
