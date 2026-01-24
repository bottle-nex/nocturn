import { QuizType } from "@nocturn/types";

export enum QUIZ_STEP {
    START = 'START',
    ASK_DIFFICULTY = 'ASK_DIFFICULTY',
    WAIT_DIFFICULTY = 'WAIT_DIFFICULTY',
    GENERATE = 'GENERATE',
    REVISE = 'REVISE',
    DONE = 'DONE',
}

export interface QuizAgentState {
    step: QUIZ_STEP,

    userId: string,
    instruction?: string,
    
    difficulty?: number,
    
    quizId?: string,
    quizData?: QuizType,

    revisionFeedback?: string,

    streamingMessage?: string,
}