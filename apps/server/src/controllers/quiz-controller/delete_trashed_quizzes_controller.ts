import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import deleteTrashedQuizzes from '../../services/delete-trashed-quizzes';

export default async function delete_trashed_quizzes_controller(req: Request, res: Response) {
    const user = req.user;

    if (!user || !user.id) {
        ResponseWriter.not_authorized(res);
        return;
    }

    try {
        const result = await deleteTrashedQuizzes({ hostId: user.id });

        ResponseWriter.success(res, result, 'Trash deletion completed');
        return;
    } catch (error) {
        console.error('Error in clearing trash: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
