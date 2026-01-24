
// export const QUIZ_STEP = {
//     START : 'START',
//     ASK_DIFFICULTY : 'ASK_DIFFICULTY',
//     WAIT_DIFFICULTY : 'WAIT_DIFFICULTY',
//     PLANNING : 'PLANNING',
//     GENERATE : 'GENERATE',
//     REVISE : 'REVISE',
//     DONE : 'DONE',
// } as const;

import { Annotation } from "@langchain/langgraph";

export enum QUIZ_STEP {
    START = 'START',
    ASK_DIFFICULTY = 'ASK_DIFFICULTY',
    WAIT_DIFFICULTY = 'WAIT_DIFFICULTY',
    PLANNING = 'PLANNING',
    GENERATE = 'GENERATE',
    REVISE = 'REVISE',
    DONE = 'DONE',
} 

// export interface QuizAgentState {
//     step: QUIZ_STEP;

//     userId: string;
//     instruction?: string;

//     difficulty?: number;

//     quizId?: string;
//     // hey take this
//     quizData?: any;

//     revisionFeedback?: string;

//     streamingMessage?: string;
// }

export const QuizAgentStateAnnotation = Annotation.Root({
    step: Annotation<QUIZ_STEP>,
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
