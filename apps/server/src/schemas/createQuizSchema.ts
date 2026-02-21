import { z } from 'zod';

export enum TemplateEnum {
    CLASSIC = 'CLASSIC',
    MODERN = 'MODERN',
    PASTEL = 'PASTEL',
    NEON = 'NEON',
    YELLOW = 'YELLOW',
    GREEN = 'GREEN',
    BLUE = 'BLUE',
}

export enum Interactions {
    THUMBS_UP = 'THUMBS_UP',
    DOLLAR = 'DOLLAR',
    BULB = 'BULB',
    HEART = 'HEART',
    SMILE = 'SMILE',
}

const questionSchema = z.object({
    question: z.string(),
    options: z.array(z.string()).min(3),
    correctAnswer: z.number(),
    explanation: z.string().nullable().optional(),
    hint: z.string().nullable().optional(),
    difficulty: z.number(),
    basePoints: z.number(),
    timeLimit: z.number().min(1).max(600),
    readingTime: z.number().min(1).max(600),
    orderIndex: z.number(),
    imageUrl: z.string().nullable().optional(),
    hintLaunched: z.boolean(),
});

export const createQuizSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1).max(50),
    description: z.string().nullable().optional(),
    templateId: z.string().optional(),
    prizePool: z.coerce.number().nonnegative().optional().default(0),
    currency: z.string().default('SOL'),
    basePointsPerQuestion: z.coerce.number().optional(),
    pointsMultiplier: z.coerce.number().optional(),
    timeBonus: z.coerce.boolean().optional(),
    eliminationThreshold: z.coerce.number().optional(),
    questionTimeLimit: z.coerce.number().optional(),
    breakBetweenQuestions: z.coerce.number().optional(),
    scheduledAt: z.coerce.date().optional(),
    autoSave: z.coerce.boolean().optional(),
    liveChat: z.coerce.boolean().optional(),
    spectatorMode: z.coerce.boolean().optional(),
    questions: z.array(questionSchema),
    interactions: z.array(z.enum(Interactions)).optional().default([Interactions.THUMBS_UP]),
});

export type QuestionType = z.infer<typeof questionSchema>;
export type CreateQuizType = z.infer<typeof createQuizSchema>;
