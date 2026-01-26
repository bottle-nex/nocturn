import { Request, Response } from 'express';
import ResponseWriter from '../../../class/response_writer';
import { deleteFolderSchema } from '../../../schemas/quizFolderSchema';
import { prisma } from '@nocturn/database';

export default async function deleteQuizFolderController(req: Request, res: Response) {
    if (!req.user?.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    const { data, success } = deleteFolderSchema.safeParse(req.body);
    if (!success) {
        ResponseWriter.invalid_data(res, 'Invalid folder credentials');
        return;
    }

    try {
        const existing_folder = await prisma.quizFolder.findUnique({
            where: {
                id: data.folderId,
            },
        });

        if (!existing_folder || existing_folder.userId !== req.user.id) {
            ResponseWriter.not_found(res);
            return;
        }

        await prisma.quizFolder.delete({
            where: {
                id: data.folderId,
            },
        });

        ResponseWriter.success(res, 'Folder deleted successfuly');
        return;
    } catch (error) {
        console.error('Error in deleting quiz folder: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
