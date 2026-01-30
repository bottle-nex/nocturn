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
import { AiQuizMessage, prisma } from '@nocturn/database';
import { env } from '../../configs/env';
import ResponseWriter from '../../class/response_writer';
import { AgentStep, AiMessageElement, AiQuizChatRole, STREAM } from '@nocturn/types';

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
        console.log('step to continue: ', step);
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

                console.log('difficulty: ', difficulty);

                // plan the quiz creation
                const { plan, quiz_id } = await this.plan(
                    res,
                    user_id,
                    session_id,
                    user_instruction,
                    difficulty,
                );

                console.log('plan: ', plan);

                // execute the plan
                await this.executor(res, user_id, session_id, quiz_id, plan);
            }
        }
    }

    private async ask_difficulty(res: Response, instruction: string, session_id: string) {
        try {
            console.log('sending the session id: ', session_id);

            ResponseWriter.stream.write(res, {
                type: STREAM.ID,
                data: session_id,
            });

            const { difficulty_asker } = this.get_chain();

            console.log('difficulty chain hit');

            const response = await difficulty_asker.invoke({
                instruction: instruction,
            });

            console.log('response of difficulty chain: ', response);

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

            const messages: AiQuizMessage[] = [agentic_message, system_message];

            ResponseWriter.stream.write(res, {
                type: STREAM.MESSAGES,
                data: messages,
            });

            return;
        } catch (error) {
            console.error('Error while asking difficulty: ', error);
            return;
        } finally {
            ResponseWriter.stream.end(res);
        }
    }

    private async compute_text_difficulty(
        session_id: string,
        text_difficulty: string,
    ): Promise<number> {
        const { text_to_number_difficulty } = this.get_chain();

        console.log('compute text difficulty chain hit');

        const conversion = await text_to_number_difficulty.invoke({
            instruction: text_difficulty,
        });

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

        console.log('plan chain hit');

        const response = await planner.invoke({
            instruction,
            difficulty,
        });

        console.log('plan response: ', response.userResponse);

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
        try {
            const { executor } = this.get_chain();

            console.log('executor chain hit');

            const response = await executor.invoke({
                instruction: plan,
            });

            console.log('executor response: ', response);

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

            const { messages, quiz } = await prisma.$transaction(async (tx) => {
                const agentic_message = await tx.aiQuizMessage.create({
                    data: {
                        aiQuizChatSessionId: session_id,
                        role: AiQuizChatRole.AGENT,
                        content: response.userResponse,
                    },
                });

                const quiz = await tx.quiz.update({
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

                const system_message = await tx.aiQuizMessage.create({
                    data: {
                        aiQuizChatSessionId: session_id,
                        role: AiQuizChatRole.SYSTEM,
                        content: quiz.id,
                        element: AiMessageElement.QUIZ,
                    },
                });

                const messages: AiQuizMessage[] = [agentic_message, system_message];

                return {
                    messages,
                    quiz,
                };
            });

            ResponseWriter.stream.write(res, {
                type: STREAM.MESSAGES,
                data: messages,
            });

            ResponseWriter.stream.write(res, {
                type: STREAM.QUIZ,
                data: quiz,
            });

        } catch (error) {
            console.error('error in executor: ', error);
        } finally {
            ResponseWriter.stream.end(res);
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
