import { ChatOpenAI } from '@langchain/openai';
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
import { toJsonSchema } from '@langchain/core/utils/json_schema';
import { env } from '../../configs/env';
import { OPERATION } from '../types/agentEnums';

/**
 * Bind a structured-output schema as a PLAIN JSON Schema rather than the Zod object.
 *
 * Passing the Zod object to @langchain/openai sends it through interopZodResponseFormat,
 * which forces `strict: true` and attaches StructuredOutputParser — so the schema's
 * .min()/.max() bounds become hard runtime throws. The previous Gemini provider used
 * responseSchema + JsonOutputParser and never enforced them, so enforcing them now would
 * change behaviour (the executor fails outright on a normal generation).
 *
 * toJsonSchema keeps every constraint and .describe() text in the schema the model sees,
 * while leaving the parser non-validating — matching the Gemini behaviour these prompts
 * and schemas were written against.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function as_json_schema(schema: any): any {
    return toJsonSchema(schema);
}

export default class Model {
    public model: ChatOpenAI;

    public top_level_agent: RunnableSequence<
        {
            instruction: string;
            conversationHistory: string;
            step: string;
            hasQuiz: string;
            originalTopic: string;
        },
        { intent: string; response: string; updatedInstruction: string }
    >;

    public difficulty_asker: RunnableSequence<{ instruction: string }, { userResponse: string }>;
    public text_to_number_difficulty: RunnableSequence<
        { instruction: string },
        { difficulty: number }
    >;
    public planner: RunnableSequence<
        {
            instruction: string;
            difficulty: number;
            is_change_request: string;
            existing_questions: string;
        },
        {
            userResponse: string;
            title: string;
            description: string;
            deleteAndGenerateNewQuestions: boolean;
            operationType: OPERATION;
        }
    >;
    public executor: RunnableSequence<
        { instruction: string; difficulty: number },
        { description: string; questions: any; userResponse: string }
    >;

    constructor() {
        this.model = new ChatOpenAI({
            model: 'google/gemini-2.5-flash-lite',
            temperature: 0.2,
            apiKey: env.SERVER_OPENROUTER_API_KEY,
            configuration: {
                baseURL: 'https://openrouter.ai/api/v1',
                defaultHeaders: {
                    'HTTP-Referer': env.SERVER_WEB_URL,
                    'X-Title': 'Nocturn',
                },
            },
        });

        this.top_level_agent = RunnableSequence.from([
            top_level_agent_prompt,
            this.model.withStructuredOutput(as_json_schema(top_level_agent_schema)),
        ]);

        this.difficulty_asker = RunnableSequence.from([
            difficulty_asker_prompt,
            this.model.withStructuredOutput(as_json_schema(difficulty_asker_schema)),
        ]);

        this.text_to_number_difficulty = RunnableSequence.from([
            text_to_number_difficulty_prompt,
            this.model.withStructuredOutput(as_json_schema(text_to_number_difficulty_schema)),
        ]);

        this.planner = RunnableSequence.from([
            planner_prompt,
            this.model.withStructuredOutput(as_json_schema(planner_schema)),
        ]) as RunnableSequence<
            {
                instruction: string;
                difficulty: number;
                is_change_request: string;
                existing_questions: string;
            },
            {
                userResponse: string;
                title: string;
                description: string;
                deleteAndGenerateNewQuestions: boolean;
                operationType: OPERATION;
            }
        >;

        this.executor = RunnableSequence.from([
            executor_prompt,
            this.model.withStructuredOutput(as_json_schema(executor_schema)),
        ]);
    }
}
