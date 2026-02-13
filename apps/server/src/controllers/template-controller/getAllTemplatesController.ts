import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { prisma } from '@nocturn/database';

export default async function getAllTemplatesController(req: Request, res: Response) {
    if (!req.user.id) {
        ResponseWriter.not_authorized(res);
        return;
    }
    console.log('controller hit');

    try {
        const templates = await prisma.template.findMany({
            select: {
                id: true,
                name: true,
                theme: true,
            },
        });
        console.log('templates in db are: ', templates);

        if (!templates) {
            ResponseWriter.not_found(res, 'Templates not found');
            return;
        }

        console.log('templates are: ', templates);
        ResponseWriter.success(res, templates, 'Fetched templates successfully');
        return;
    } catch (error) {
        console.error('Error in fetchinf templates: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
