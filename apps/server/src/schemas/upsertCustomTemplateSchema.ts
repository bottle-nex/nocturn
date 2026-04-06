import z from 'zod';

export const upsertCustomTemplateSchema = z.object({
    id: z.string().optional(),
    backgroundColor: z.string(),
    textColor: z.string(),
    borderColor: z.string(),
    accentType: z.string(),
    accentColor: z.string(),
    itemsColor: z.string(),
    bars: z.array(z.string()),
    src: z.string().optional(),
});
