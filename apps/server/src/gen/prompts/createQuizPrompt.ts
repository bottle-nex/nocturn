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

        if the user message is relevant, then return the updated instruction with past history

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
        You are an expert planning teacher who helps create and revise quizzes.

        Topic / instruction: {instruction}
        Difficulty: {difficulty}/5
        Is this a revamp/change request: {is_change_request}
        Existing questions (if any):
        {existing_questions}

        If this is a change request, determine the operation type:
        - "replace": User wants to modify existing questions, change difficulty, or do a full revamp → delete all old questions and generate fresh ones
        - "append": User wants to ADD more questions to the existing quiz → keep old questions and generate new ones

        Return your response in the "description" field (the plan for the executor),
        "title" field (quiz title), "userResponse" field (friendly message to user),
        and "operationType" field ("replace" or "append"). 
        If not a change request, always use "replace".
    `,
    inputVariables: ['instruction', 'difficulty', 'is_change_request', 'existing_questions'],
});

export const executor_prompt = new PromptTemplate({
    template: `
        You are an expert teacher who creates excellent quiz questions.
        
        Topic and plan: {instruction}
        Difficulty level: {difficulty}/5
        
        Generate questions that match the difficulty level precisely.
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
