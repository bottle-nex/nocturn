import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function getAllTemplatesController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        const templates = await prisma.template.findMany({
            where: {
                OR: [{ userId: null }, { userId: req.user.id }],
            },
            select: {
                id: true,
                name: true,
                backgroundColor: true,
                textColor: true,
                borderColor: true,
                itemsColor: true,
                accentType: true,
                accentColor: true,
                itemsColor: true,
                bars: true,
                src: true,
                userId: true,
            },
        });

        if (!templates) {
            ResponseWriter.not_found(res, 'Templates not found');
            return;
        }

        ResponseWriter.success(res, templates, 'Fetched templates successfully');
        return;
    } catch (error) {
        console.error('Error in fetching templates:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
