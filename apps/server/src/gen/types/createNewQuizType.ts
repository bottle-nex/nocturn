import { RunnableSequence } from "@langchain/core/runnables";

export type create_new_quiz_type = RunnableSequence<{
    instruction: string;
}, {
    
}>;