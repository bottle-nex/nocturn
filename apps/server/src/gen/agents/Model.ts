import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
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
import { RunnableSequence } from '@langchain/core/runnables';
import { env } from '../../configs/env';
import { generated_question_type } from '../types/createNewQuizType';

export default class Model {
    public model: ChatGoogleGenerativeAI;

    public difficulty_asker: RunnableSequence<{ instruction: string }, { userResponse: string }>;
    public text_to_number_difficulty: RunnableSequence<
        { instruction: string },
        { difficulty: number }
    >;
    public planner: RunnableSequence<
        { instruction: string; difficulty: number },
        { userResponse: string; title: string; description: string }
    >;
    public executor: RunnableSequence<
        { instruction: string },
        { description: string; questions: any; userResponse: string }
    >;
    public reviser: RunnableSequence<
        { instruction: string; questions: generated_question_type[] },
        { userResponse: string; questions: generated_question_type[] }
    >;

    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            model: 'gemini-2.5-flash',
            temperature: 0.2,
            apiKey: env.SERVER_GEMINI_API_KEY,
        });

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
        ]);

        this.executor = RunnableSequence.from([
            executor_prompt,
            this.model.withStructuredOutput(executor_schema),
        ]);

        this.reviser = RunnableSequence.from([
            reviser_prompt,
            this.model.withStructuredOutput(reviser_schema),
        ]);
    }
}
