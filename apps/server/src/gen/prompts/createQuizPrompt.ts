import { PromptTemplate } from '@langchain/core/prompts';

export const create_quiz_difficulty_prompt = new PromptTemplate({
    template: ``,
    inputVariables: ['']
})

export const create_quiz_planner_prompt = new PromptTemplate({
    template: `
        you're a expert planning teacher, who can give a brief description about the topic which user is asking for

        this is the topic user is asking for
        {instruction}

    `,
    inputVariables: ['instruction']
});

export const create_quiz_executor_prompt = new PromptTemplate({
    template: `
        you're a expert teacher, who can ask really good questions out of any topic

        this is the topic user is asking to make questions about
        {instruction}
    `,
    inputVariables: ['instruction'],
});

export const difficulty_asker_prompt = new PromptTemplate({
    template: `
        your'e an expert teacher, who will appreciate the topic the user has instructed for
        {instruction}
    `,
    inputVariables: ['instruction']
})