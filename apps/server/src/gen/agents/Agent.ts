import { prisma } from '@nocturn/database';
import { model } from '../../services/init.services';
import { QuizAgentState, QuizAgentStateAnnotation } from '../state/quiz-agent.state';
import { StateGraph } from '@langchain/langgraph';
import { AgentStep, AiMessageElement, AiQuizChatRole, STREAM } from '@nocturn/types';
import { generated_question_type } from '../types/createNewQuizType';
import { TemplateEnum } from '../../schemas/createQuizSchema';
import { NODE, INTENT } from '../types/agentEnums';
import { Response } from 'express';

export default class Agent {
    static create_graph() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const graph: any = new StateGraph(QuizAgentStateAnnotation);

        // nodes of graph
        graph.addNode(NODE.TOP_LEVEL_AGENT, Agent.top_level_node);
        graph.addNode(NODE.DIFFICULTY_ASKER, Agent.difficulty_asker_node);
        graph.addNode(NODE.COMPUTE_DIFFICULTY, Agent.compute_difficulty_node);
        graph.addNode(NODE.PLANNER, Agent.planner_node);
        graph.addNode(NODE.EXECUTOR, Agent.executor_node);

        // entrypoint
        graph.addEdge('__start__', NODE.TOP_LEVEL_AGENT);

        // routing from top level agent
        graph.addConditionalEdges(NODE.TOP_LEVEL_AGENT, Agent.route_from_top_level_agent, {
            [NODE.DIFFICULTY_ASKER]: NODE.DIFFICULTY_ASKER,
            [NODE.COMPUTE_DIFFICULTY]: NODE.COMPUTE_DIFFICULTY,
            [NODE.PLANNER]: NODE.PLANNER,
            __end__: '__end__',
        });

        // other edges
        graph.addEdge(NODE.DIFFICULTY_ASKER, '__end__');
        graph.addEdge(NODE.COMPUTE_DIFFICULTY, NODE.PLANNER);
        graph.addEdge(NODE.PLANNER, NODE.EXECUTOR);
        graph.addEdge(NODE.EXECUTOR, '__end__');

        return graph.compile();
    }

    static async top_level_node(state: QuizAgentState): Promise<Partial<QuizAgentState>> {
        const response = await model.top_level_agent.invoke({
            instruction: state.instruction,
            conversationHistory: state.conversationHistory || '',
            step: state.currentStep,
            hasQuiz: state.existingQuizId ? 'yes' : 'no',
            originalTopic: state.originalTopic || 'none',
        });

        // if irrelevant, save agent's response to db and send sse
        if (response.intent === INTENT.IRRELEVANT) {
            const agentMessage = await prisma.aiQuizMessage.create({
                data: {
                    aiQuizChatSessionId: state.sessionId,
                    role: AiQuizChatRole.AGENT,
                    content: response.response,
                },
            });

            return {
                intent: response.intent,
                agentResponse: response.response,
                sseMessages: [{ type: STREAM.MESSAGE, data: agentMessage }],
            };
        }

        return {
            intent: response.intent,
            agentResponse: response.response,
        };
    }

    static async difficulty_asker_node(state: QuizAgentState): Promise<Partial<QuizAgentState>> {
        const response = await model.difficulty_asker.invoke({
            instruction: state.instruction,
        });

        const { agentic_message, system_message } = await prisma.$transaction(async (tx) => {
            await tx.aiQuizChatSession.update({
                where: { id: state.sessionId },
                data: { step: AgentStep.WAIT_DIFFICULTY },
            });

            const agentic_message = await tx.aiQuizMessage.create({
                data: {
                    aiQuizChatSessionId: state.sessionId,
                    role: AiQuizChatRole.AGENT,
                    content: response.userResponse,
                },
            });

            const system_message = await tx.aiQuizMessage.create({
                data: {
                    aiQuizChatSessionId: state.sessionId,
                    role: AiQuizChatRole.SYSTEM,
                    content: '',
                    element: AiMessageElement.DIFFICULTY,
                },
            });

            return { agentic_message, system_message };
        });

        return {
            sseMessages: [{ type: STREAM.MESSAGES, data: [agentic_message, system_message] }],
        };
    }

    static async compute_difficulty_node(state: QuizAgentState): Promise<Partial<QuizAgentState>> {
        const conversion = await model.text_to_number_difficulty.invoke({
            instruction: state.instruction,
        });

        await prisma.aiQuizChatSession.update({
            where: { id: state.sessionId },
            data: { difficulty: conversion.difficulty },
        });

        return {
            difficulty: conversion.difficulty,
        };
    }

    static async planner_node(state: QuizAgentState): Promise<Partial<QuizAgentState>> {
        const topicInstruction = state.originalTopic || state.instruction;
        const difficulty = state.difficulty ?? 3;

        const response = await model.planner.invoke({
            instruction:
                state.intent === INTENT.CHANGE_REQUEST
                    ? `${topicInstruction}\n\nUser's revision request: ${state.instruction}`
                    : topicInstruction,
            difficulty,
        });

        // For change requests, delete old quiz questions
        if (state.intent === INTENT.CHANGE_REQUEST && state.existingQuizId) {
            await prisma.$transaction(async (tx) => {
                await tx.question.deleteMany({
                    where: { quizId: state.existingQuizId! },
                });

                await tx.aiQuizMessage.create({
                    data: {
                        aiQuizChatSessionId: state.sessionId,
                        role: AiQuizChatRole.AGENT,
                        content: response.userResponse,
                    },
                });
            });

            return {
                plan: response.description,
                quizTitle: response.title,
                plannerResponse: response.userResponse,
                quizId: state.existingQuizId,
            };
        }

        // New quiz flow
        const { quiz, agentic_message, system_message } = await prisma.$transaction(async (tx) => {
            const db_template = await tx.template.findFirst({
                where: { name: TemplateEnum.CLASSIC },
            });

            const quiz = await tx.quiz.create({
                data: {
                    title: response.title,
                    hostId: state.userId,
                    prizePool: 0,
                    templateId: db_template?.id!,
                },
            });

            const agentic_message = await tx.aiQuizMessage.create({
                data: {
                    aiQuizChatSessionId: state.sessionId,
                    role: AiQuizChatRole.AGENT,
                    content: response.userResponse,
                },
            });

            const system_message = await tx.aiQuizMessage.create({
                data: {
                    aiQuizChatSessionId: state.sessionId,
                    role: AiQuizChatRole.SYSTEM,
                    content: response.title,
                    element: AiMessageElement.TITLE,
                },
            });

            return { quiz, agentic_message, system_message };
        });

        return {
            plan: response.description,
            quizTitle: response.title,
            plannerResponse: response.userResponse,
            quizId: quiz.id,
            sseMessages: [
                { type: STREAM.MESSAGE, data: agentic_message },
                { type: STREAM.MESSAGE, data: system_message },
            ],
        };
    }

    static async executor_node(state: QuizAgentState): Promise<Partial<QuizAgentState>> {
        const response = await model.executor.invoke({
            instruction: state.plan || state.instruction,
        });

        const parsed_questions = response.questions.map(
            (q: generated_question_type, i: number) => ({
                ...q,
                basePoints: 20,
                timeLimit: 30,
                readingTime: 7,
                orderIndex: i,
                isAsked: false,
            }),
        );

        const quizId = state.quizId!;

        const { messages, quiz } = await prisma.$transaction(async (tx) => {
            const agentic_message = await tx.aiQuizMessage.create({
                data: {
                    aiQuizChatSessionId: state.sessionId,
                    role: AiQuizChatRole.AGENT,
                    content: response.userResponse,
                },
            });

            const quiz = await tx.quiz.update({
                where: { id: quizId },
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
                    template: true,
                    basePointsPerQuestion: true,
                    pointsMultiplier: true,
                    timeBonus: true,
                    eliminationThreshold: true,
                    questions: true,
                },
            });

            const system_message = await tx.aiQuizMessage.create({
                data: {
                    aiQuizChatSessionId: state.sessionId,
                    role: AiQuizChatRole.SYSTEM,
                    content: quiz.id,
                    element: AiMessageElement.QUIZ,
                },
            });

            await tx.aiQuizChatSession.update({
                where: { id: state.sessionId },
                data: {
                    step: AgentStep.DONE,
                    quizId: quiz.id,
                },
            });

            return {
                messages: [agentic_message, system_message],
                quiz,
            };
        });

        return {
            quizId,
            sseMessages: [
                { type: STREAM.MESSAGES, data: messages },
                { type: STREAM.QUIZ, data: quiz },
            ],
        };
    }

    private static route_from_top_level_agent(state: QuizAgentState): string {
        switch (state.intent) {
            case INTENT.TOPIC_PROVIDED:
                return NODE.DIFFICULTY_ASKER;
            case INTENT.DIFFICULTY_RESPONSE:
                return NODE.COMPUTE_DIFFICULTY;
            case INTENT.CHANGE_REQUEST:
                return NODE.PLANNER;
            case INTENT.IRRELEVANT:
            default:
                return '__end__';
        }
    }

    public static create_stream(res: Response): void {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
    }
}
