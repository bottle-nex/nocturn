import z from 'zod';

const question_schema = z.object({
    question: z.string().min(5).describe('a one liner question'),
    options: z.array(z.string()).length(4),
    correctAnswer: z.int().min(0).max(3),
    explanation: z
        .string()
        .min(1)
        .max(100)
        .describe('a short explanation about why the correct option is correct'),
    hint: z.string().min(1).max(100).describe('a little hint to get near to correct option'),
    difficulty: z.int().min(1).max(5).describe('how tuff the question is'),
});

export const create_new_quiz_schema = z.object({
    description: z.string().min(10).max(200).describe('description what this quiz is about'),
    questions: z.array(question_schema).min(8).max(15),
});

export const planner_schema = z.object({
    userResponse: z.string().min(5).max(200).describe('give a user response like you are doing the job'),
    title: z.string().min(5).describe('5-6 words of title about the quiz'),
    description: z.string().min(100).describe('a detailed description about the user instruction to send to another llm to create quiz '),
});

export const difficulty_asker_schema = z.object({
    userResponse: z.string().min(5).describe('give a good response to the user, and ask for difficulty of the quiz'),
})