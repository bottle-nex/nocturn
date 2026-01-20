import { RunnableSequence } from '@langchain/core/runnables';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Response } from 'express';
import { create_quiz_prompt } from '../prompts/createQuizPrompt';
import { create_new_quiz_schema } from '../schemas/createNewQuizSchema';
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
            // get the chain
            const chain = this.get_chain();
            if (!chain) return;

            console.log('got the chain');

            const data = await chain.invoke({
                instruction,
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

            // create the quiz
            const quiz = await prisma.quiz.create({
                data: {
                    hostId: user_id,
                    title: data.title,
                    prizePool: 0,
                    questions: {
                        create: questions,
                    },
                },
                include: {
                    questions: true,
                },
            });

            ResponseWriter.success(res, { quiz }, 'quiz created successfully', 201);
            return;
        } catch (error) {
            console.error('Error: ', error);
        }
    }

    private get_chain() {
        try {
            const chain = RunnableSequence.from([
                create_quiz_prompt,
                this.model.withStructuredOutput(create_new_quiz_schema),
            ]);

            return chain;
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
