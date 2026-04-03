import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';
import { upsertCustomTemplateSchema } from '../../schemas/upsertCustomTemplateSchema';

export default async function upsertCustomTemplateController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const parseBody = upsertCustomTemplateSchema.safeParse(req.body);
    if (!parseBody.success) {
        ResponseWriter.invalid_data(res, 'Invalid request body provided.');
        return;
    }

    const { id, backgroundColor, textColor, borderColor, accentType, accentColor, bars, src } =
        parseBody.data;

    try {
        let template;

        if (id && id !== 'NEW_CUSTOM') {
            // Check if template exists and belongs to the user
            const existingTemplate = await prisma.template.findUnique({
                where: { id },
            });

            if (existingTemplate && existingTemplate.userId === req.user.id) {
                template = await prisma.template.update({
                    where: { id },
                    data: {
                        backgroundColor,
                        textColor,
                        borderColor,
                        accentType,
                        accentColor,
                        bars,
                        src: src || 'custom-template',
                    },
                });
            } else {
                // If it doesn't exist or doesn't belong to user, create a new one instead of failing
                template = await prisma.template.create({
                    data: {
                        name: 'CUSTOM',
                        backgroundColor,
                        textColor,
                        borderColor,
                        accentType,
                        accentColor,
                        bars,
                        src: src || 'custom-template',
                        userId: req.user.id,
                    },
                });
            }
        } else {
            // Create a brand new custom template
            template = await prisma.template.create({
                data: {
                    name: 'CUSTOM',
                    backgroundColor,
                    textColor,
                    borderColor,
                    accentType,
                    accentColor,
                    bars,
                    src: src || 'custom-template',
                    userId: req.user.id,
                },
            });
        }

        ResponseWriter.success(res, template, 'Custom template saved successfully');
        return;
    } catch (error) {
        console.error('Error in upserting custom template:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
