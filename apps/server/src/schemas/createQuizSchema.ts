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
    TUMBS_UP = 'THUMBS_UP',
    DOLLAR = 'DOLLAR',
    BULB = 'BULB',
    HEART = 'HEART',
    SMILE = 'SMILE',
}

const questionSchema = z.object({
    question: z.string(),
    options: z.array(z.string().min(1)).min(3).default(['', '', '']),
    correctAnswer: z.number(),
    explanation: z.string().optional(),
    hint: z.string().optional(),
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
    title: z.string().min(1).max(50).optional().default('Quiz title goes here'),
    description: z.string().optional(),
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
    questions: z
        .array(questionSchema)
        .optional()
        .default([
            {
                question: 'Ask your first question!',
                options: ['option 1', 'option 2', 'option 3', 'option 4'],
                correctAnswer: 0,
                difficulty: 1,
                basePoints: 100,
                timeLimit: 30,
                readingTime: 4,
                orderIndex: 0,
                imageUrl: null,
                hintLaunched: false,
            },
        ]),
    interactions: z.array(z.enum(Interactions)).optional().default([]),
});

export type QuestionType = z.infer<typeof questionSchema>;
export type CreateQuizType = z.infer<typeof createQuizSchema>;
