import { PromptTemplate } from '@langchain/core/prompts';

export const top_level_agent_prompt = new PromptTemplate({
    template: `
        You are an intelligent quiz assistant router. Analyze the user's message, the conversation history, and the current session state to determine the user's intent.

        Current session state:
        - Step: {step}
        - Has existing quiz: {hasQuiz}
        - Original topic: {originalTopic}

        Conversation history:
        {conversationHistory}

        Current user message: {instruction}

        Determine the intent:
        1. "TOPIC_PROVIDED" — The user is providing a topic to create a quiz about (and the session is in START state or has no quiz yet). This includes requests like "make a quiz about X", "quiz on Y", etc.
        2. "DIFFICULTY_RESPONSE" — The user is responding with a difficulty level (and the session step is WAIT_DIFFICULTY). This includes things like "make it hard", "easy", "medium difficulty", "3", etc.
        3. "CHANGE_REQUEST" — The user already has a generated quiz and is asking to change/revise/modify the questions. This includes "make it harder", "change question 3", "add more questions", etc.
        4. "IRRELEVANT" — The message is not related to quiz creation, or the user is sending a difficulty without a quiz topic (step is START). This includes greetings, off-topic messages, etc.

        If the intent is "IRRELEVANT", provide a friendly response in the "response" field. Otherwise leave "response" as a brief acknowledgment.
    `,
    inputVariables: ['instruction', 'conversationHistory', 'step', 'hasQuiz', 'originalTopic'],
});

export const text_to_number_difficulty_prompt = new PromptTemplate({
    template: `
        You have to convert this user sent difficulty response into the scale of 1 to 5
        {instruction}
    `,
    inputVariables: ['instruction'],
});

export const planner_prompt = new PromptTemplate({
    template: `
        you're a expert planning teacher, who can give a brief description about the topic which user is asking for

        this is the topic user is asking for
        {instruction}

        and the difficulty rating is: {difficulty}/5
    `,
    inputVariables: ['instruction', 'difficulty'],
});

export const executor_prompt = new PromptTemplate({
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
    inputVariables: ['instruction'],
});
