import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
    difficulty_asker_prompt,
    executor_prompt,
    planner_prompt,
    text_to_number_difficulty_prompt,
    top_level_agent_prompt,
} from '../prompts/createQuizPrompt';
import {
    executor_schema,
    difficulty_asker_schema,
    planner_schema,
    text_to_number_difficulty_schema,
    top_level_agent_schema,
} from '../schemas/createNewQuizSchema';
import { RunnableSequence } from '@langchain/core/runnables';
import { env } from '../../configs/env';
import { OPERATION } from '../types/agentEnums';

export default class Model {
    public model: ChatGoogleGenerativeAI;

    public top_level_agent: RunnableSequence<
        {
            instruction: string;
            conversationHistory: string;
            step: string;
            hasQuiz: string;
            originalTopic: string;
        },
        { intent: string; response: string, updatedInstruction: string }
    >;

    public difficulty_asker: RunnableSequence<{ instruction: string }, { userResponse: string }>;
    public text_to_number_difficulty: RunnableSequence<
        { instruction: string },
        { difficulty: number }
    >;
    public planner: RunnableSequence<
        { instruction: string; difficulty: number, is_change_request: string, existing_questions: string },
        { userResponse: string; title: string; description: string; deleteAndGenerateNewQuestions: boolean; operationType: OPERATION }
    >;
    public executor: RunnableSequence<
        { instruction: string, difficulty: number },
        { description: string; questions: any; userResponse: string }
    >;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            model: 'gemini-2.5-flash',
            temperature: 0.2,
            apiKey: env.SERVER_GEMINI_API_KEY,
            // maxOutputTokens: 2000,
        });

        this.top_level_agent = RunnableSequence.from([
            top_level_agent_prompt,
            this.model.withStructuredOutput(top_level_agent_schema),
        ]);

        this.difficulty_asker = RunnableSequence.from([
            difficulty_asker_prompt,
            this.model.withStructuredOutput(difficulty_asker_schema),
        ]);

        this.text_to_number_difficulty = RunnableSequence.from([
            text_to_number_difficulty_prompt,
            this.model.withStructuredOutput(text_to_number_difficulty_schema),
        ]);

        this.planner = RunnableSequence.from([
            planner_prompt,
            this.model.withStructuredOutput(planner_schema),
        ]) as RunnableSequence<
            { instruction: string; difficulty: number, is_change_request: string, existing_questions: string },
            { userResponse: string; title: string; description: string; deleteAndGenerateNewQuestions: boolean; operationType: OPERATION }
        >;

        this.executor = RunnableSequence.from([
            executor_prompt,
            this.model.withStructuredOutput(executor_schema),
        ]);
    }
}
