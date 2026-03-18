import { Annotation } from '@langchain/langgraph';
import { AgentStep } from '@nocturn/types';
import { stream } from '@nocturn/types';

export const QuizAgentStateAnnotation = Annotation.Root({
    // Input -> set by controller before invoking graph
    sessionId: Annotation<string>,
    userId: Annotation<string>,
    instruction: Annotation<string>,
    conversationHistory: Annotation<string>,
    currentStep: Annotation<AgentStep>,
    existingQuizId: Annotation<string | undefined>,
    originalTopic: Annotation<string | undefined>,

    // Set by top_level_agent
    intent: Annotation<string | undefined>,
    agentResponse: Annotation<string | undefined>,

    // Set by compute_difficulty
    difficulty: Annotation<number | undefined>,

    // Set by planner
    plan: Annotation<string | undefined>,
    quizTitle: Annotation<string | undefined>,
    plannerResponse: Annotation<string | undefined>,

    // Set by executor
    quizId: Annotation<string | undefined>,

    // SSE messages to stream back to client
    sseMessages: Annotation<stream[]>({
        default: () => [],
        reducer: (current, update) => [...current, ...update],
    }),
});

export type QuizAgentState = typeof QuizAgentStateAnnotation.State;
