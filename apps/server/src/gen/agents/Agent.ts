import { prisma } from '@nocturn/database';
import { model } from '../../services/init.services';
import { QuizAgentState, QuizAgentStateAnnotation } from '../state/quiz-agent.state';
import { StateGraph } from '@langchain/langgraph';
import { AgentStep, AiMessageElement, AiQuizChatRole, STREAM } from '@nocturn/types';
import { generated_question_type } from '../types/createNewQuizType';
import { TemplateEnum } from '../../schemas/createQuizSchema';
import { NODE, INTENT } from '../types/agentEnums';

export default class Agent {
    // ─── Node: Top-Level Agent (LLM Router) ───────────────────────────────────

    /**
     * LLM-based router. Classifies user intent from:
     * - current message
     * - conversation history
     * - session state (step, has quiz, original topic)
     */
    static async topLevelNode(state: QuizAgentState): Promise<Partial<QuizAgentState>> {
        const response = await model.top_level_agent.invoke({
            instruction: state.instruction,
            conversationHistory: state.conversationHistory || '',
            step: state.currentStep,
            hasQuiz: state.existingQuizId ? 'yes' : 'no',
            originalTopic: state.originalTopic || 'none',
        });

        // If irrelevant, save agent's response to DB and push SSE message
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

    // ─── Node: Difficulty Asker ───────────────────────────────────────────────

    /**
     * Asks the user for quiz difficulty.
     * Saves agent message + system difficulty element to DB.
     */
    static async difficultyAskerNode(state: QuizAgentState): Promise<Partial<QuizAgentState>> {
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
            sseMessages: [
                { type: STREAM.MESSAGES, data: [agentic_message, system_message] },
            ],
        };
    }

    // ─── Node: Compute Difficulty ─────────────────────────────────────────────

    /**
     * Converts user's text difficulty ("very hard", "easy", etc.) to numeric 1-5.
     * Saves the difficulty to the session.
     */
    static async computeDifficultyNode(state: QuizAgentState): Promise<Partial<QuizAgentState>> {
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

    // ─── Node: Planner ────────────────────────────────────────────────────────

    /**
     * Creates a quiz plan: title + detailed description.
     * Creates the Quiz record in DB and saves planner messages.
     */
    static async plannerNode(state: QuizAgentState): Promise<Partial<QuizAgentState>> {
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
            let db_template = await tx.template.findFirst({
                where: { name: TemplateEnum.CLASSIC },
            });

            if (!db_template) {
                db_template = await tx.template.create({
                    data: {
                        name: TemplateEnum.CLASSIC,
                        description: 'Classic quiz template with standard rules',
                    },
                });
            }

            const quiz = await tx.quiz.create({
                data: {
                    title: response.title,
                    hostId: state.userId,
                    prizePool: 0,
                    templateId: db_template.id,
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

    // ─── Node: Executor ───────────────────────────────────────────────────────

    /**
     * Generates quiz questions from the planner's description.
     * Creates Question records and finishes the quiz session.
     */
    static async executorNode(state: QuizAgentState): Promise<Partial<QuizAgentState>> {
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

    // ─── Router ───────────────────────────────────────────────────────────────

    private static routeFromTopLevelAgent(state: QuizAgentState): string {
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

    // ─── Graph Builder ────────────────────────────────────────────────────────

    static createGraph() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const graph: any = new StateGraph(QuizAgentStateAnnotation);

        // Add nodes
        graph.addNode(NODE.TOP_LEVEL_AGENT, Agent.topLevelNode);
        graph.addNode(NODE.DIFFICULTY_ASKER, Agent.difficultyAskerNode);
        graph.addNode(NODE.COMPUTE_DIFFICULTY, Agent.computeDifficultyNode);
        graph.addNode(NODE.PLANNER, Agent.plannerNode);
        graph.addNode(NODE.EXECUTOR, Agent.executorNode);

        // Entry point
        graph.addEdge('__start__', NODE.TOP_LEVEL_AGENT);

        // Conditional routing from top-level agent
        graph.addConditionalEdges(NODE.TOP_LEVEL_AGENT, Agent.routeFromTopLevelAgent, {
            [NODE.DIFFICULTY_ASKER]: NODE.DIFFICULTY_ASKER,
            [NODE.COMPUTE_DIFFICULTY]: NODE.COMPUTE_DIFFICULTY,
            [NODE.PLANNER]: NODE.PLANNER,
            '__end__': '__end__',
        });

        // Sequential edges
        graph.addEdge(NODE.DIFFICULTY_ASKER, '__end__');
        graph.addEdge(NODE.COMPUTE_DIFFICULTY, NODE.PLANNER);
        graph.addEdge(NODE.PLANNER, NODE.EXECUTOR);
        graph.addEdge(NODE.EXECUTOR, '__end__');

        return graph.compile();
    }
}
