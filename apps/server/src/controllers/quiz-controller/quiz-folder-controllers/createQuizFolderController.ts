import { Request, Response } from 'express';
import ResponseWriter from '../../../class/response_writer';
import { createFolderSchema } from '../../../schemas/quizFolderSchema';
import { prisma } from '@nocturn/database';

export default async function createQuizFolderController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const parsed = createFolderSchema.safeParse(req.body);
    if (!parsed.success) {
        ResponseWriter.invalid_data(res, 'Invalid folder name');
        return;
    }

    const { name } = parsed.data;

    try {
        const folder = await prisma.quizFolder.create({
            data: {
                userId: req.user.id,
                name,
            },
        });

        ResponseWriter.success(res, folder, 'Folder created successfully');
        return;
    } catch (error: any) {
        console.error('Error creating quiz folder:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
