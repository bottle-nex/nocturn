import z from 'zod';

export const favouriteQuizSchema = z.object({
    quizId: z.string(),
    isFavourite: z.boolean(),
});
