import { prisma } from '@nocturn/database';
import { chain } from '../../services/init.services';
import { QuizAgentGraphState, QuizAgentStateAnnotation } from '../state/quiz-agent.state';
import { StateGraph } from '@langchain/langgraph';
import { AgentStep, AiMessageElement, AiQuizChatRole } from '@nocturn/types';
import ResponseWriter from '../../class/response_writer';

export default class Agent {
    static async ask_difficulty_node(state: QuizAgentGraphState): Promise<QuizAgentGraphState> {
        const { difficulty_asker } = chain.get_chain();

        console.log('ask difficulty node');

        const response = await difficulty_asker.invoke({
            instruction: state.instruction,
        });

        // update the session step and add agent and system message
        const data = await prisma.$transaction(async (tx) => {
            await tx.aiQuizChatSession.update({
                where: {
                    id: state.sessionId,
                },
                data: {
                    step: AgentStep.WAIT_DIFFICULTY,
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
            state.res,
            {
                agenticMessage: data.agentic_message,
                systemMessage: data.system_message,
            },
            'asking for difficulty',
        );

        return {
            ...state,
            step: AgentStep.WAIT_DIFFICULTY,
        };
    }

    static async generate_quiz_node(state: QuizAgentGraphState): Promise<QuizAgentGraphState> {
        const { text_to_number_difficulty, planner, executor } = chain.get_chain();

        // for the time being the instruction is current one sent from the user as "make it very difficult"
        const conversion = await text_to_number_difficulty.invoke({
            instruction: state.instruction,
        });

        // update the session
        await prisma.aiQuizChatSession.update({
            where: {
                id: state.sessionId,
            },
            data: {
                difficulty: conversion.difficulty,
            },
        });

        const plan = await planner.invoke({
            instruction: state.instruction,
            difficulty: conversion.difficulty,
        });

        // create the quiz
        const quiz = await prisma.quiz.create({
            data: {
                hostId: state.userId,
                title: plan.title,
                prizePool: 0,
            },
        });

        const data = await executor.invoke({
            instruction: plan.description,
        });

        await prisma.$transaction(async (tx) => {
            await tx.question.createMany({
                data: data.questions.map((q, i) => ({
                    ...q,
                    quizId: quiz.id,
                    orderIndex: i,
                    timeLimit: 30,
                    readingTime: 7,
                    basePoints: 20,
                })),
            });

            // add quiz-id in ai chat session
            await tx.aiQuizChatSession.update({
                where: { id: state.sessionId },
                data: {
                    quizId: quiz.id,
                    step: AgentStep.DONE,
                },
            });
        });

        return {
            ...state,
            quizId: quiz.id,
            step: AgentStep.DONE,
        };
    }

    static async revise_quiz_node(state: QuizAgentGraphState): Promise<QuizAgentGraphState> {
        const { reviser } = chain.get_chain();

        const quiz = await prisma.quiz.findUnique({
            where: {
                id: state.quizId,
            },
            include: {
                questions: {
                    select: {
                        question: true,
                        options: true,
                        correctAnswer: true,
                        explanation: true,
                        hint: true,
                        difficulty: true,
                    },
                },
            },
        });

        if (!quiz) {
            // return an error response that can't revise a quiz which is not available
            return {
                ...state,
            };
        }

        const response = await reviser.invoke({
            questions: `${JSON.stringify(quiz.questions)}`,
            instruction: '',
        });

        // delete all the questions from the quiz and create new ones

        await prisma.$transaction(async (tx) => {
            await tx.question.deleteMany({
                where: {
                    quizId: quiz.id,
                },
            });

            const update_questions = await tx.question.createMany({
                data: response.questions.map((q, i) => {
                    return {
                        ...q,
                        quizId: quiz.id,
                        orderIndex: i,
                        timeLimit: 30,
                        readingTime: 7,
                        basePoints: 20,
                    };
                }),
            });

            return update_questions;
        });

        return {
            ...state,
            step: AgentStep.DONE,
        };
    }

    static create_graph() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const graph: any = new StateGraph(QuizAgentStateAnnotation);

        graph.addNode(AgentStep.ASK_DIFFICULTY, Agent.ask_difficulty_node);
        graph.addNode(AgentStep.GENERATE, Agent.generate_quiz_node);

        graph.setEntryPoint(AgentStep.ASK_DIFFICULTY);

        graph.addConditionalEdges(AgentStep.ASK_DIFFICULTY, () => AgentStep.WAIT_DIFFICULTY);

        graph.addConditionalEdges(AgentStep.GENERATE, () => '__end__');

        return graph.compile();
    }
}

// static create_graph() {
//     // removing this any will affect in custom types
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const graph: any = new StateGraph(QuizAgentStateAnnotation);

//     graph.addNode(AgentStep.ASK_DIFFICULTY, Agent.ask_difficulty_node);
//     graph.addNode(AgentStep.PLANNING, Agent.planning_quiz_node);
//     graph.addNode(AgentStep.GENERATE, Agent.generate_quiz_node);
//     graph.addNode(AgentStep.REVISE, Agent.revise_quiz_node);

//     // ask user for the difficulty and wait until user responds

//     graph.addConditionalEdges('__start__', (state: QuizAgentGraphState) => {
//         switch (state.step) {
//             case AgentStep.PLANNING:
//                 return AgentStep.PLANNING;
//             case AgentStep.GENERATE:
//                 return AgentStep.GENERATE;
//             case AgentStep.REVISE:
//                 return AgentStep.REVISE;
//             default:
//                 return AgentStep.ASK_DIFFICULTY;
//         }
//     });

//     graph.addEdge(AgentStep.ASK_DIFFICULTY, '__end__');

//     graph.addEdge(AgentStep.PLANNING, AgentStep.GENERATE);
//     graph.addEdge(AgentStep.GENERATE, '__end__');

//     graph.addConditionalEdges(AgentStep.GENERATE, (state: QuizAgentGraphState) => {
//         return state.revisionFeedback ? AgentStep.REVISE : '__end__';
//     });

//     graph.addEdge(AgentStep.REVISE, '__end__');

//     return graph.compile();
// }
