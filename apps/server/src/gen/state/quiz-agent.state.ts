import { Annotation } from '@langchain/langgraph';
import { AgentStep } from '@nocturn/types';
import { Response } from 'express';

// export const QUIZ_STEP = {
//     START: 'START',
//     ASK_DIFFICULTY: 'ASK_DIFFICULTY',
//     WAIT_DIFFICULTY: 'WAIT_DIFFICULTY',
//     PLANNING: 'PLANNING',
//     GENERATE: 'GENERATE',
//     REVISE: 'REVISE',
//     DONE: 'DONE',
// } as const;

// export type QUIZ_STEP = (typeof QUIZ_STEP)[keyof typeof QUIZ_STEP];
export interface QuizAgentGraphState {
    res: Response;
    sessionId: string;
    userId: string;

    step: AgentStep;

    instruction: string;
    difficulty?: number;

    quizId?: string;
}

export const QuizAgentGraphAnnotation = Annotation.Root({
    res: Annotation<Response>,
    sessionId: Annotation<string>,
    userId: Annotation<string>,
    step: Annotation<AgentStep>,
    instruction: Annotation<string>,
    difficulty: Annotation<number | undefined>,
    quizId: Annotation<string | undefined>,
});

export const QuizAgentStateAnnotation = Annotation.Root({
    step: Annotation<AgentStep>,
    userId: Annotation<string>,
    instruction: Annotation<string | undefined>,
    difficulty: Annotation<number | undefined>,
    quizId: Annotation<string | undefined>,
    quizData: Annotation<any>,
    revisionFeedback: Annotation<string | undefined>,
    streamingMessage: Annotation<string | undefined>,
});

export type QuizAgentState = typeof QuizAgentStateAnnotation.State;

export const quiz_agent_state_for_graph = {
    step: null,
    userId: null,
    instruction: null,
    streamingMessage: null,
    quizId: null,
    quizData: null,
    revisionFeedback: null,
};
