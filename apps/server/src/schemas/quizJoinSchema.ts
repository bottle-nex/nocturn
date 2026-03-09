import { z } from 'zod';

export const quizJoinSchema = z.object({
    code: z.string().min(1, 'Quiz code is required'),
    email: z.email('Invalid email address').optional(),
    name: z
        .string()
        .min(1, 'Name is required')
        .max(16, 'Name must be at most 16 characters')
        .optional(),
});
