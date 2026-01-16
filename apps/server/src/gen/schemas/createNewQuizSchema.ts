import z from "zod";

const question = z.object({
    title: z.string().min(5).describe('a one liner question'),
    options: z.array(z.string()).length(4),
});

export const create_new_quiz_schema = z.object({
    title: z.string().min(5).describe('5-6 words of title about the quiz'),
    questions: z.array(question).min(8).max(15),
});