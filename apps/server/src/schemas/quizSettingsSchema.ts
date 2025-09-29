import z from 'zod';

export const quizSettingsSchema = z.object({
    liveChat: z.boolean().optional(),
    interactionMode: z.boolean().optional(),
    watchLeaderBoard: z.boolean().optional(),
    allowNewSpectator: z.boolean().optional(),
});

export type QuizSetting = z.infer<typeof quizSettingsSchema>;
