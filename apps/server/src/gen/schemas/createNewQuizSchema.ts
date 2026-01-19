import z from 'zod';

const question_schema = z.object({
    question: z.string().min(5).describe('a one liner question'),
    options: z.array(z.string()).length(4),
    correctAnswer: z.int().min(1).max(4),
    explanation: z
        .string()
        .min(1)
        .max(100)
        .describe('a short explanation about why the correct option is correct'),
    hint: z.string().min(1).max(100).describe('a little hint to get near to correct option'),
    difficulty: z.int().min(1).max(5).describe('how tuff the question is'),
});

export const create_new_quiz_schema = z.object({
    title: z.string().min(5).describe('5-6 words of title about the quiz'),
    description: z.string().min(10).max(200).describe('description what this quiz is about'),
    questions: z.array(question_schema).min(8).max(15),
});
