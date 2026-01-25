import { PromptTemplate } from '@langchain/core/prompts';

export const create_quiz_difficulty_prompt = new PromptTemplate({
    template: ``,
    inputVariables: [''],
});

export const text_to_number_difficulty_prompt = new PromptTemplate({
    template: `
        You have to convert this user sent difficulty response into the scale of 1 to 5
        {instruction}
    `,
    inputVariables: ['instruction'],
})

export const create_quiz_planner_prompt = new PromptTemplate({
    template: `
        you're a expert planning teacher, who can give a brief description about the topic which user is asking for

        this is the topic user is asking for
        {instruction}

    `,
    inputVariables: ['instruction'],
});

export const create_quiz_executor_prompt = new PromptTemplate({
    template: `
        you're a expert teacher, who can ask really good questions out of any topic

        this is the topic user is asking to make questions about
        {instruction}

        and the difficulty rating is: {difficulty}/5
    `,
    inputVariables: ['instruction', 'difficulty'],
});

export const difficulty_asker_prompt = new PromptTemplate({
    template: `
        your'e an expert teacher, who will appreciate the topic the user has instructed for
        {instruction}
    `,
    inputVariables: ['instruction'],
});

export const reviser_prompt = new PromptTemplate({
    template: `
        You're an expert teacher, who will revamp the questions provided below
        {questions}
        based on user's instruction
        {instruction}
    `,
    inputVariables: ['questions', 'instruction'],
});
