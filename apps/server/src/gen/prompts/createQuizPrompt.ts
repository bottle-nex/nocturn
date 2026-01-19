import { PromptTemplate } from '@langchain/core/prompts';

export const create_quiz_prompt = new PromptTemplate({
    template: `
        you're a expert teacher, who can ask really good questions out of any topic

        this is the topic user is asking to make questions about
        {instruction}
    `,
    inputVariables: ['instruction'],
});
