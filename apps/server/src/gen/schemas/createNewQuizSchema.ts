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
    difficulty: z.int().min(1).max(5).describe('how tough the question is'),
});

export const executor_schema = z.object({
    description: z.string().min(10).max(200).describe('description what this quiz is about'),
    questions: z.array(question_schema).min(8).max(25),
    userResponse: z.string().min(5).max(100).describe('write about what you have done'),
});

export const text_to_number_difficulty_schema = z.object({
    difficulty: z.int().min(1).max(5).describe('how tough the question is'),
});

export const planner_schema = z.object({
    userResponse: z
        .string()
        .min(5)
        .max(200)
        .describe('give a user response like you are doing the job act normal, no need of much appraisal'),
    title: z.string().min(5).describe('5-6 words of title about the quiz'),
    description: z
        .string()
        .min(100)
        .describe(
            'a detailed description about the user instruction to send to another llm to create quiz ',
        ),
});

export const difficulty_asker_schema = z.object({
    userResponse: z
        .string()
        .min(5)
        .describe('give a good response to the user, and ask for difficulty of the quiz'),
});

export const reviser_schema = z.object({
    userResponse: z
        .string()
        .min(5)
        .max(200)
        .describe('give a user response like you are doing the job'),
    questions: z.array(question_schema).min(8).max(25),
});
