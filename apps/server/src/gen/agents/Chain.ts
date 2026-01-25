import { RunnableSequence } from '@langchain/core/runnables';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Response } from 'express';
import {
    create_quiz_planner_prompt,
    create_quiz_executor_prompt,
    difficulty_asker_prompt,
    reviser_prompt,
    text_to_number_difficulty_prompt,
} from '../prompts/createQuizPrompt';
import {
    create_new_quiz_schema,
    difficulty_asker_schema,
    planner_schema,
    reviser_schema,
    text_to_number_difficulty_schema,
} from '../schemas/createNewQuizSchema';
import { prisma } from '@nocturn/database';
import { QuestionType } from '../../schemas/createQuizSchema';
import { env } from '../../configs/env';
import ResponseWriter from '../../class/response_writer';

export default class Chain {
    private model: ChatGoogleGenerativeAI;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            model: 'gemini-2.5-flash',
            temperature: 0.2,
            apiKey: env.SERVER_GEMINI_API_KEY,
        });
    }

    public async invoke_difficulty_asker() {
        
    }

    public async ask_difficulty(res: Response) {
        try {
        } catch (error) {
            console.error('Error while asking difficulty: ', error);
            return;
        }
    }

    public get_chain() {
        const difficulty_asker = RunnableSequence.from([
            difficulty_asker_prompt,
            this.model.withStructuredOutput(difficulty_asker_schema),
        ]);

        const text_to_number_difficulty = RunnableSequence.from([
            text_to_number_difficulty_prompt,
            this.model.withStructuredOutput(text_to_number_difficulty_schema),
        ]);

        const planner = RunnableSequence.from([
            create_quiz_executor_prompt,
            this.model.withStructuredOutput(planner_schema),
        ]);

        const executor = RunnableSequence.from([
            create_quiz_planner_prompt,
            this.model.withStructuredOutput(create_new_quiz_schema),
        ]);

        const reviser = RunnableSequence.from([
            reviser_prompt,
            this.model.withStructuredOutput(reviser_schema),
        ]);

        return {
            difficulty_asker,
            text_to_number_difficulty,
            planner,
            executor,
            reviser,
        };
    }

    public create_stream(res: Response): void {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
    }
}
