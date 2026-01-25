import { RunnableSequence } from '@langchain/core/runnables';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Response } from 'express';
import {
    difficulty_asker_prompt,
    executor_prompt,
    planner_prompt,
    reviser_prompt,
    text_to_number_difficulty_prompt,
} from '../prompts/createQuizPrompt';
import {
    executor_schema,
    difficulty_asker_schema,
    planner_schema,
    reviser_schema,
    text_to_number_difficulty_schema,
} from '../schemas/createNewQuizSchema';
import { prisma } from '@nocturn/database';
import { env } from '../../configs/env';
import ResponseWriter from '../../class/response_writer';
import { AgentStep, AiMessageElement, AiQuizChatRole } from '@nocturn/types';
import { STREAM } from '../types/stream.type';

export default class Chain {
    private model: ChatGoogleGenerativeAI;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            model: 'gemini-2.5-flash',
            temperature: 0.2,
            apiKey: env.SERVER_GEMINI_API_KEY,
        });
    }

    public async start(
        res: Response,
        user_id: string,
        session_id: string,
        step: AgentStep,
        user_instruction: string,
        difficulty_instruction: string,
    ) {
        // create the stream
        this.create_stream(res);

        switch (step) {
            case AgentStep.START: {
                // ask for difficulty
                await this.ask_difficulty(res, user_instruction, session_id);
                return;
            }
            case AgentStep.WAIT_DIFFICULTY: {
                // difficulty found change it from text to number
                const difficulty = await this.compute_text_difficulty(
                    session_id,
                    difficulty_instruction,
                );

                // plan the quiz creation
                const { plan, quiz_id } = await this.plan(
                    res,
                    user_id,
                    session_id,
                    user_instruction,
                    difficulty,
                );

                // execute the plan
                await this.executor(res, user_id, session_id, quiz_id, plan);
            }
        }
    }

    private async ask_difficulty(res: Response, instruction: string, session_id: string) {
        try {
            const { difficulty_asker } = this.get_chain();

            const response = await difficulty_asker.invoke({
                instruction: instruction,
            });

            // update the session step and add agent and system message
            const { agentic_message, system_message } = await prisma.$transaction(async (tx) => {
                await tx.aiQuizChatSession.update({
                    where: {
                        id: session_id,
                    },
                    data: {
                        step: AgentStep.WAIT_DIFFICULTY,
                    },
                });
                const agentic_message = await tx.aiQuizMessage.create({
                    data: {
                        aiQuizChatSessionId: session_id,
                        role: AiQuizChatRole.AGENT,
                        content: response.userResponse,
                    },
                });

                const system_message = await tx.aiQuizMessage.create({
                    data: {
                        aiQuizChatSessionId: session_id,
                        role: AiQuizChatRole.SYSTEM,
                        content: '',
                        element: AiMessageElement.DIFFICULTY,
                    },
                });

                return {
                    agentic_message,
                    system_message,
                };
            });

            ResponseWriter.success(
                res,
                {
                    agenticMessage: agentic_message,
                    systemMessage: system_message,
                },
                'asking for difficulty',
            );

            return;
        } catch (error) {
            console.error('Error while asking difficulty: ', error);
            return;
        }
    }

    private async compute_text_difficulty(
        session_id: string,
        text_difficulty: string,
    ): Promise<number> {
        const { text_to_number_difficulty } = this.get_chain();

        const conversion = await text_to_number_difficulty.invoke({
            instruction: text_difficulty,
        });

        var l = ['fas', 'fas'];
        l.length = 0;
        console.log(l);

        // update the session with difficulty
        await prisma.aiQuizChatSession.update({
            where: {
                id: session_id,
            },
            data: {
                difficulty: conversion.difficulty,
            },
        });

        return conversion.difficulty;
    }

    private async plan(
        res: Response,
        user_id: string,
        session_id: string,
        instruction: string,
        difficulty: number,
    ): Promise<{ plan: string; quiz_id: string }> {
        const { planner } = this.get_chain();

        const response = await planner.invoke({
            instruction,
            difficulty,
        });

        // create the quiz
        const { quiz, agentic_message, system_message } = await prisma.$transaction(async (tx) => {
            const quiz = await tx.quiz.create({
                data: {
                    title: response.title,
                    hostId: user_id,
                    prizePool: 0,
                },
            });

            const agentic_message = await tx.aiQuizMessage.create({
                data: {
                    aiQuizChatSessionId: session_id,
                    role: AiQuizChatRole.AGENT,
                    content: response.userResponse,
                },
            });
            // create the system's title message
            const system_message = await tx.aiQuizMessage.create({
                data: {
                    aiQuizChatSessionId: session_id,
                    role: AiQuizChatRole.SYSTEM,
                    content: response.title,
                    element: AiMessageElement.TITLE,
                },
            });

            return {
                quiz,
                agentic_message,
                system_message,
            };
        });

        // send the user response
        ResponseWriter.stream.write(res, {
            type: STREAM.MESSAGE,
            data: agentic_message,
        });

        // send the title of the quiz
        ResponseWriter.stream.write(res, {
            type: STREAM.MESSAGE,
            data: system_message,
        });

        return {
            plan: response.description,
            quiz_id: quiz.id,
        };
    }

    private async executor(
        res: Response,
        user_id: string,
        session_id: string,
        quiz_id: string,
        plan: string,
    ) {
        const { executor } = this.get_chain();

        const response = await executor.invoke({
            instruction: plan,
        });

        const parsed_questions = response.questions.map((q, i) => {
            return {
                ...q,
                basePoints: 20,
                timeLimit: 30,
                readingTime: 7,
                orderIndex: i,
                isAsked: false,
            };
        });

        const quiz = await prisma.quiz.update({
            where: {
                id: quiz_id,
            },
            data: {
                questions: {
                    create: parsed_questions,
                },
                description: response.description,
            },
            select: {
                id: true,
                title: true,
                description: true,
                theme: true,
                basePointsPerQuestion: true,
                pointsMultiplier: true,
                timeBonus: true,
                eliminationThreshold: true,
                questions: true,
            },
        });

        ResponseWriter.stream.write(res, {
            type: STREAM.QUIZ,
            data: quiz,
        });
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
            planner_prompt,
            this.model.withStructuredOutput(planner_schema),
        ]);

        const executor = RunnableSequence.from([
            executor_prompt,
            this.model.withStructuredOutput(executor_schema),
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

    private create_stream(res: Response): void {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
    }
}
