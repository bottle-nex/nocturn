import { Request, Response } from 'express';
import ResponseWriter from '../../class/response_writer';
import { createQuizUsingAISchema } from '../../schemas/createQuizUsingAISchema';

export default async function createQuizUsingAIController(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!user) {
            ResponseWriter.not_authorized(res, 'user not found');
            return;
        }

        const parsed_data = createQuizUsingAISchema.safeParse(req.body);
        if (!parsed_data.success) {
            ResponseWriter.invalid_data(res, 'Invalid data');
            return;
        }

        // send the instruction to the AI
        // await chain.start(
        //     res,
        // )
    } catch (error) {
        console.error('error in start with AI controller: ', error);
        ResponseWriter.system_error(res);
        return;
    }
}
