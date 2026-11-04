import { z } from 'zod';

export const quizJoinSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, 'Quiz code is required')
        .transform((code) => (code.length === 6 ? code.toUpperCase() : code)),
    email: z.email('Invalid email address').optional(),
    name: z
        .string()
        .min(1, 'Name is required')
        .max(16, 'Name must be at most 16 characters')
        .optional(),
    force: z.boolean().optional(),
});
