import { Request, Response } from "express";
import { prisma, Quiz } from "@nocturn/database";
import ResponseWriter from "../../class/response_writer";
import { createQuizSchema } from "../../schemas/createQuizSchema";

export enum QUIZ_STATUS {
    SAVE_NEW_QUIZ = 'SAVE_NEW_QUIZ',
    UPDATE_QUIZ = 'UPDATE_QUIZ',
    PUBLISH_QUIZ = 'PUBLISH_QUIZ',
    LAUNCH_QUIZ = 'LAUNCH_QUIZ',
}

export default class QuizController {

    public async quiz_controller(req: Request, res: Response) {
        try {

            const user = req.user;
            if(!user || !user.id) {
                ResponseWriter.not_authorized(res, 'user authorization failed');
                return;
            }

            const quiz_id = req.params.quizid;
            if(!quiz_id) {
                ResponseWriter.invalid_data(res, 'quiz is not provided');
                return;
            }

            const parsed = createQuizSchema.safeParse(req.body);

            if(!parsed.success) {
                ResponseWriter.invalid_data(res, 'invalid quiz data provided');
                return;
            }

            const data = parsed.data;

            
        } catch (error) {
            console.error('error in quiz controller: ', error);
            ResponseWriter.system_error(res);
            return;
        }
    }

    public async update_quiz_status(
        res: Response,
        type: QUIZ_STATUS,
        quiz_id: string,

    ) {

    }
    
    private create_quiz(res: Response) {

    }
    
    private update_quiz() {

    }

    

    private async get_quiz(host_id: string, quiz_id: string): Promise<Quiz | null> {
        try {

            const quiz = await prisma.quiz.findUnique({
                where: {
                    id: quiz_id,
                    hostId: host_id,
                },
            });

            return quiz;

        } catch (error) {
            console.error('error in fetching quiz in quiz controller: ', error);
            return null;
        }
    }

}