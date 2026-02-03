export type generated_question_type = {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    hint: string;
    difficulty: number;
};

export type StartGeneration = {
    START: {
        user_instruction: string;
    };

    ASK_DIFFICULTY: {};

    WAIT_DIFFICULTY: {
        root_instruction: string;
        difficulty_instruction: string;
        user_id: string;
    };

    PLANNING: {};

    GENERATE: {};

    REVISE: {
        user_instruction: string;
        quiz_id: string;
        questions: (generated_question_type & { id: string })[];
    };

    DONE: {};
};

export type StartEvent = {
    [K in keyof StartGeneration]: {
        step: K;
        data: StartGeneration[K];
    };
}[keyof StartGeneration];
