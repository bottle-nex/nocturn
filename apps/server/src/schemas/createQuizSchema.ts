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
    options: z.array(z.string().min(1)).min(4),
    correctAnswer: z.number(),
    explanation: z.string().optional(),
    hint: z.string().optional(),
    difficulty: z.number(),
    basePoints: z.number(),
    timeLimit: z.number().min(1).max(600),
    readingTime: z.number().min(1).max(600),
    orderIndex: z.number(),
    imageUrl: z.string().optional(),
    hintLaunched: z.boolean(),
});

// const templateSchema = z.object({
//     id: z.string(),
//     name: z.string(),
//     backgroundColor: z.string(),
//     textColor: z.string(),
//     borderColor: z.string(),
//     accentType: z.string(),
//     accentColor: z.string(),
//     bars: z.array(z.string()),
//     src: z.string(),
//     createdAt: z.coerce.date(),
//     updatedAt: z.coerce.date(),
// });

export const createQuizSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1).max(50),
    description: z.string().optional(),
    templateId: z.string(),
    prizePool: z.coerce.number().nonnegative(),
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
    interactions: z.array(z.enum(Interactions)),
});

export type QuestionType = z.infer<typeof questionSchema>;
export type CreateQuizType = z.infer<typeof createQuizSchema>;
