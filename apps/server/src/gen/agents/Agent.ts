import { prisma } from "@nocturn/database";
import { chain } from "../../services/init.services";
import { QUIZ_STEP, QuizAgentState } from "../state/quiz-agent.state";
import { QuestionType } from "../../schemas/createQuizSchema";
import { TemplateEnum } from "@nocturn/types";


export default class Agent {

    static async ask_difficulty_node(
        state: QuizAgentState,
    ): Promise<QuizAgentState> {
        const { difficulty_asker } = chain.get_chain();

        const response = await difficulty_asker.invoke({
            instruction: state.instruction,
        });

        return {
            ...state,
            step: QUIZ_STEP.WAIT_DIFFICULTY,
            streamingMessage: response.userResponse,
        };
    }

    static async planning_quiz_node(
        state: QuizAgentState,
    ): Promise<QuizAgentState> {

        const { planner } = chain.get_chain();
        
        const response = await planner.invoke({
            instruction: state.streamingMessage,
        });

        // create the quiz
        const quiz = await prisma.quiz.create({
            data: {
                hostId: state.userId,
                title: response.title,
                prizePool: 0,
            }
        });

        // stream the response
        // response.userResponse

        return {
            ...state,
            quizId: quiz.id,
            step: QUIZ_STEP.PLANNING,
            streamingMessage: response.description,
        }

    }

    static async generate_quiz_node(
        state: QuizAgentState,
    ): Promise<QuizAgentState> {

        const { executor } = chain.get_chain();

        const response = await executor.invoke({
            instruction: state.streamingMessage,
        });

        
        const defaults = {
            timeLimit: 30,
            readingTime: 7,
            basePoints: 20,
        };

        const questions: QuestionType[] = response.questions.map((q, index) => {
            return {
                ...q,
                timeLimit: defaults.timeLimit,
                readingTime: defaults.readingTime,
                basePoints: defaults.basePoints,
                orderIndex: index,
            };
        });

        // update the quiz with questions
        const quiz = await prisma.quiz.update({
            where: {
                id: state.quizId,
            },
            data: {
                description: response.description,
                questions: {
                    create: questions,
                },
            },
            include: {
                questions: true,
            },
        });

        return {
            ...state,
            quizData: quiz,
        };

    }

    static async revise_quiz_node(
        state: QuizAgentState,
    ): Promise<QuizAgentState> {

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

        if(!quiz) {
            // return an error response that can't revise a quiz which is not available
            return {
                ...state,
            };
        }

        const response = await reviser.invoke({
            questions: `${JSON.stringify(quiz.questions)}`,
            instruction: state.revisionFeedback,
        });

        // delete all the questions from the quiz and create new ones

        const data = await prisma.$transaction(async (tx) => {
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
            quizData: data,
            step: QUIZ_STEP.DONE,
        };
    }

}