import { Request, Response } from 'express';
import ResponseWriter from '../../../class/response_writer';
import { createFolderSchema } from '../../../schemas/quizFolderSchema';
import { prisma, Prisma } from '@nocturn/database';

export default async function updateQuizFolderController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const folderId = req.params;

    const { data, success } = createFolderSchema.safeParse(req.body);
    if (!success) {
        ResponseWriter.invalid_data(res, 'Invalid folder update data');
        return;
    }

    try {
        const folder = await prisma.quizFolder.findUnique({
            where: { id: String(folderId) },
            select: { userId: true },
        });

        if (!folder || folder.userId !== req.user.id) {
            ResponseWriter.not_found(res);
            return;
        }

        const updatedFolder = await prisma.quizFolder.update({
            where: { id: String(folderId) },
            data: { name: data.name },
        });

        ResponseWriter.success(res, updatedFolder, 'Folder name updated successfully');
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                ResponseWriter.error(
                    res,
                    '[FOLDER_ALREADY_EXISTS]',
                    'You already have a fodler with this name',
                    '',
                    409,
                );
                return;
            }
        }
        console.error('Error updating quiz folder:', error);
        ResponseWriter.system_error(res);
        return;
    }
}
