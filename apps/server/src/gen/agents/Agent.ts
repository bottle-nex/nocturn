import { RunnableSequence } from '@langchain/core/runnables';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Response } from 'express';
import { create_quiz_planner_prompt, create_quiz_executor_prompt } from '../prompts/createQuizPrompt';
import { create_new_quiz_schema, planner_schema } from '../schemas/createNewQuizSchema';
import { prisma } from '@nocturn/database';
import { QuestionType } from '../../schemas/createQuizSchema';
import { env } from '../../configs/env';
import ResponseWriter from '../../class/response_writer';

export default class Agent {
    private model: ChatGoogleGenerativeAI;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            model: 'gemini-2.5-flash',
            temperature: 0.2,
            apiKey: env.SERVER_GEMINI_API_KEY,
        });
    }

    public async create_new_quiz(res: Response, instruction: string, user_id: string) {
        try {

            // get the chains
            const chains = this.get_chain();
            if(!chains) return;

            const { planner, executor } = chains;

            const plan = await planner.invoke({
                instruction,
            });

            // create the quiz with the title
            let quiz = await prisma.quiz.create({
                data: {
                    hostId: user_id,
                    title: plan.title,
                    prizePool: 0,
                }
            });

            ResponseWriter.stream.write(res, quiz);

            const data = await executor.invoke({
                instruction: plan.description,
            });

            console.log('invoked and got the data: ', data);

            // we'll take time-limit and reading-time by default
            const defaults = {
                timeLimit: 30,
                readingTime: 7,
                basePoints: 20,
            };

            const questions: QuestionType[] = data.questions.map((q, index) => {
                return {
                    ...q,
                    timeLimit: defaults.timeLimit,
                    readingTime: defaults.readingTime,
                    basePoints: defaults.basePoints,
                    orderIndex: index,
                };
            });

            // update the quiz with questions
            quiz = await prisma.quiz.update({
                where: {
                    id: quiz.id,
                },
                data: {
                    description: data.description,
                    questions: {
                        create: questions,
                    },
                },
                include: {
                    questions: true,
                },
            });

            ResponseWriter.stream.write(res, quiz);

        } catch (error) {
            console.error('Error: ', error);
        } finally {
            ResponseWriter.stream.end(res);
        }
    }

    private get_chain() {
        try {

            const planner = RunnableSequence.from([
                create_quiz_executor_prompt,
                this.model.withStructuredOutput(planner_schema),
            ])

            const executor = RunnableSequence.from([
                create_quiz_planner_prompt,
                this.model.withStructuredOutput(create_new_quiz_schema),
            ]);

            return {
                planner,
                executor,
            };
        } catch (error) {
            console.error('error in creating chain: ', error);
            return;
        }
    }

    public create_stream(res: Response): void {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
    }
}
